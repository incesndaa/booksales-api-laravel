<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Transaction as MidtransTransaction;

class MidtransWebhookController extends Controller
{
    public function handle(Request $request)
    {
        Log::info('MIDTRANS WEBHOOK RECEIVED', [
            'payload' => $request->all(),
        ]);

        $orderNumber = $request->input('order_id');

        if (!$orderNumber) {
            return response()->json([
                'message' => 'Order ID tidak ditemukan.',
            ], 400);
        }

        try {
            // Konfigurasi Midtrans
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = (bool) config('midtrans.is_production');

            // Ambil status transaksi langsung dari Midtrans
            $midtransStatus = MidtransTransaction::status($orderNumber);

            // Pastikan respons GET Status berhasil
            if (
                (string) $midtransStatus->status_code !== '200' ||
                $midtransStatus->order_id !== $orderNumber
            ) {
                Log::warning('Midtrans status verification failed', [
                    'order_id' => $orderNumber,
                    'response' => (array) $midtransStatus,
                ]);

                return response()->json([
                    'message' => 'Verifikasi transaksi gagal.',
                ], 400);
            }

            DB::transaction(function () use (
                $midtransStatus,
                $orderNumber
            ) {
                $transaction = Transaction::where(
                    'order_number',
                    $orderNumber
                )->lockForUpdate()->first();

                if (!$transaction) {
                    throw new \Exception('Transaksi tidak ditemukan.');
                }

                // Cocokkan nominal transaksi
                $midtransAmount = number_format(
                    (float) $midtransStatus->gross_amount,
                    2,
                    '.',
                    ''
                );

                $databaseAmount = number_format(
                    (float) $transaction->total_amount,
                    2,
                    '.',
                    ''
                );

                if ($midtransAmount !== $databaseAmount) {
                    throw new \Exception(
                        'Nominal transaksi tidak cocok.'
                    );
                }

                $status = $midtransStatus->transaction_status;
                $fraudStatus = $midtransStatus->fraud_status ?? null;

                // Pembayaran berhasil
                $isPaid = in_array(
                    $status,
                    ['settlement', 'capture']
                ) && (
                    $fraudStatus === null ||
                    $fraudStatus === 'accept'
                );

                if ($isPaid) {
                    // Cegah pengurangan stok berulang
                    if ($transaction->payment_status !== 'paid') {
                        $items = $transaction->items;

                        // Kunci dan periksa seluruh stok
                        $books = [];

                        foreach ($items as $item) {
                            $book = Book::where('id', $item->book_id)
                                ->lockForUpdate()
                                ->first();

                            if (!$book || $book->stock < $item->quantity) {
                                throw new \Exception(
                                    "Stok buku tidak mencukupi: "
                                    . "Book ID {$item->book_id}"
                                );
                            }

                            $books[] = [
                                'book' => $book,
                                'quantity' => $item->quantity,
                            ];
                        }

                        // Kurangi stok setelah semua lolos pemeriksaan
                        foreach ($books as $entry) {
                            $entry['book']->decrement(
                                'stock',
                                $entry['quantity']
                            );
                        }

                        $transaction->update([
                            'payment_status' => 'paid',
                            'paid_at' => now(),
                        ]);
                    }

                    return;
                }

                // Pembayaran gagal atau kedaluwarsa
                if (in_array($status, ['deny', 'cancel', 'expire'])) {
                    if ($transaction->payment_status !== 'paid') {
                        $transaction->update([
                            'payment_status' => 'failed',
                        ]);
                    }

                    return;
                }

                // Pembayaran masih menunggu
                if ($status === 'pending') {
                    if ($transaction->payment_status !== 'paid') {
                        $transaction->update([
                            'payment_status' => 'pending',
                        ]);
                    }
                }
            });

            return response()->json([
                'message' => 'Notifikasi berhasil diverifikasi.',
            ], 200);

        } catch (\Throwable $error) {
            Log::error('Midtrans webhook error', [
                'order_id' => $orderNumber,
                'error' => $error->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal memproses notifikasi.',
            ], 500);
        }
    }
}