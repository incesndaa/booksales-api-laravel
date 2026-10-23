<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    public static function getAll()
    {
        return [
            ['id' => 1, 'name' => 'Tere Liye'],
            ['id' => 2, 'name' => 'Andrea Hirata'],
            ['id' => 3, 'name' => 'Dee Lestari'],
            ['id' => 4, 'name' => 'Raditya Dika'],
            ['id' => 5, 'name' => 'Ahmad Fuadi'],
        ];
    }
}
