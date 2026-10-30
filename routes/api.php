<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\GenreController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('genres', GenreController::class)
    ->only(['index', 'show']);

Route::apiResource('genres', GenreController::class)
    ->except(['index', 'show'])
    ->middleware(['auth:sanctum', 'admin']);

Route::apiResource('authors', AuthorController::class)
    ->only(['index', 'show']);

Route::apiResource('authors', AuthorController::class)
    ->except(['index', 'show'])
    ->middleware(['auth:sanctum', 'admin']);