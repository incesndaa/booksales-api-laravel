<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public function paymentStatus(Request $request, $orderNumber)
    {
        $transaction = Transaction::with([
            'items.book',
            'customer',
        ])
            ->where('order_number', $orderNumber)
            ->where('customer_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'order_number' => $transaction->order_number,
            'payment_status' => $transaction->payment_status,
            'total_amount' => $transaction->total_amount,
            'paid_at' => $transaction->paid_at,
            'items' => $transaction->items,
            'customer' => $transaction->customer,
        ]);
    }
     // Read All
    public function index()
    {
        $transactions = Transaction::with([
            'customer',
            'items.book',
        ])
            ->latest()
            ->get();

        return response()->json($transactions);
    }

    // Create
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_number' => 'required|unique:transactions,order_number',
            'book_id' => 'required|exists:books,id',
            'total_amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $transaction = Transaction::create([
            'order_number' => $request->order_number,
            'customer_id' => $request->user()->id,
            'book_id' => $request->book_id,
            'total_amount' => $request->total_amount,
        ]);

        return response()->json($transaction, 201);
    }

    // Show
    public function show($id)
    {
        $transaction = Transaction::with(['customer', 'book'])->find($id);

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        return response()->json($transaction);
    }

    // Update
    public function update(Request $request, $id)
    {
        $transaction = Transaction::find($id);

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'total_amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $transaction->update([
            'total_amount' => $request->total_amount,
        ]);

        return response()->json($transaction);
    }

    // Destroy
    public function destroy($id)
    {
        $transaction = Transaction::find($id);

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted successfully']);
    }

    public function history(Request $request)
    {
        $transactions = Transaction::with([
            'items.book',
        ])
            ->where('customer_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($transactions);
    }
}
