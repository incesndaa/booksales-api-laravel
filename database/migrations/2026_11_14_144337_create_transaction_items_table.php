
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();

            $table->integer('transaction_id');
            $table->foreign('transaction_id')
                ->references('id')
                ->on('transactions')
                ->cascadeOnDelete();

            $table->integer('book_id');
            $table->foreign('book_id')
                ->references('id')
                ->on('books')
                ->restrictOnDelete();

            $table->unsignedInteger('quantity');
            $table->decimal('price', 12, 2);
            $table->timestamps();
        });

        // Pindahkan transaksi lama ke detail transaksi.
        DB::table('transactions')->orderBy('id')->get()
            ->each(function ($transaction) {
                DB::table('transaction_items')->insert([
                    'transaction_id' => $transaction->id,
                    'book_id' => $transaction->book_id,
                    'quantity' => 1,
                    'price' => $transaction->total_amount,
                    'created_at' => $transaction->created_at,
                    'updated_at' => $transaction->updated_at,
                ]);
            });

        Schema::table('transactions', function (Blueprint $table) {
            $table->string('payment_status')->default('pending');
            $table->string('snap_token')->nullable();
            $table->text('snap_redirect_url')->nullable();
            $table->timestamp('paid_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'payment_status',
                'snap_token',
                'snap_redirect_url',
                'paid_at',
            ]);
        });

        Schema::dropIfExists('transaction_items');
    }
};
