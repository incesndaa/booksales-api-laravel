<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
     // Read All
    public function index()
    {
        $transactions = Transaction::with(['customer', 'book'])->get();
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
}
