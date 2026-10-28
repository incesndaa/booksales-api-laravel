<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Book;

class BookSeeder extends Seeder
{
    public function run(): void
        {
            Book::insert([
                ['title' => 'Bumi', 'author_id' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['title' => 'Laskar Pelangi', 'author_id' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['title' => 'Perahu Kertas', 'author_id' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['title' => 'Koala Kumal', 'author_id' => 4, 'created_at' => now(), 'updated_at' => now()],
                ['title' => 'Negeri 5 Menara', 'author_id' => 5, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
}
