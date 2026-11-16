<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'title',
        'description',
        'price',
        'stock',
        'cover_photo',
        'genre_id',
        'author_id',
    ];
    public $timestamps = false;

    public function author()
    {
        return $this->belongsTo(Author::class);
    }

    public function genre()
    {
        return $this->belongsTo(Genre::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'book_id');
    }

    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
}
