<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'order_number',
        'customer_id',
        'book_id',
        'total_amount',
        'payment_status',
        'snap_token',
        'snap_redirect_url',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'total_amount' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    // Relasi lama, tetap dipertahankan.
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    // Satu transaksi bisa memiliki banyak buku.
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
}
