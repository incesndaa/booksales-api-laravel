<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Author;

class AuthorSeeder extends Seeder
{
    public function run(): void
        {
            Author::insert([
                ['name' => 'Tere Liye', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Andrea Hirata', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Dee Lestari', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Raditya Dika', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Ahmad Fuadi', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
}
