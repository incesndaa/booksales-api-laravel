<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id',
        'book_id',
        'quantity',
        'price',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
