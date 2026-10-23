<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    public static function getAll()
    {
        return [
            ['id' => 1, 'name' => 'Novel'],
            ['id' => 2, 'name' => 'Komik'],
            ['id' => 3, 'name' => 'Pendidikan'],
            ['id' => 4, 'name' => 'Sejarah'],
            ['id' => 5, 'name' => 'Teknologi'],
        ];
    }
}
