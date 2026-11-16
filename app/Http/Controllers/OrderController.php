<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Midtrans\Config;
use Midtrans\Snap;
use Throwable;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        // Hanya customer yang boleh membeli.
        if ($request->user()->role !== 'customer') {
            return response()->json([
                'message' => 'Hanya customer yang dapat melakukan pembelian.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.book_id' => 'required|integer|distinct|exists:books,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Data keranjang tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Ambil buku dan hitung harga dari database.
            $order = DB::transaction(function () use ($request) {
                $items = [];
                $total = 0;

                foreach ($request->items as $item) {
                    $book = Book::where('id', $item['book_id'])
                        ->lockForUpdate()
                        ->firstOrFail();

                    $quantity = (int) $item['quantity'];

                    if ($book->stock < $quantity) {
                        throw new \Exception(
                            "Stok buku {$book->title} tidak mencukupi."
                        );
                    }

                    $price = (float) $book->price;
                    $subtotal = $price * $quantity;
                    $total += $subtotal;

                    $items[] = [
                        'book' => $book,
                        'quantity' => $quantity,
                        'price' => $price,
                        'subtotal' => $subtotal,
                    ];
                }

                $transaction = Transaction::create([
                    'order_number' => 'BS-' . now()->format('YmdHis')
                        . '-' . strtoupper(substr(uniqid(), -5)),
                    'customer_id' => $request->user()->id,
                    // Kompatibilitas dengan struktur transaksi lama.
                    'book_id' => $items[0]['book']->id,
                    'total_amount' => $total,
                    'payment_status' => 'pending',
                ]);

                foreach ($items as $item) {
                    $transaction->items()->create([
                        'book_id' => $item['book']->id,
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                    ]);
                }

                return $transaction;
            });

            // Konfigurasi Midtrans Sandbox.
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = (bool) config('midtrans.is_production');
            Config::$isSanitized = true;
            Config::$is3ds = true;

            $transaction = $order->load('items.book', 'customer');

            $itemDetails = [];

            foreach ($transaction->items as $item) {
                $itemDetails[] = [
                    'id' => (string) $item->book_id,
                    'price' => (int) $item->price,
                    'quantity' => $item->quantity,
                    'name' => substr($item->book->title, 0, 50),
                ];
            }

            $params = [
                'transaction_details' => [
                    'order_id' => $transaction->order_number,
                    'gross_amount' => (int) $transaction->total_amount,
                ],
                'item_details' => $itemDetails,
                'customer_details' => [
                    'first_name' => $transaction->customer->name,
                    'email' => $transaction->customer->email,
                ],
            ];

            $snap = Snap::createTransaction($params);

            $transaction->update([
                'snap_token' => $snap->token,
                'snap_redirect_url' => $snap->redirect_url,
            ]);

            return response()->json([
                'message' => 'Checkout berhasil dibuat.',
                'data' => [
                    'order_number' => $transaction->order_number,
                    'total_amount' => $transaction->total_amount,
                    'payment_status' => $transaction->payment_status,
                    'snap_token' => $snap->token,
                    'snap_redirect_url' => $snap->redirect_url,
                ],
            ], 201);

        } catch (Throwable $error) {
            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }
}
