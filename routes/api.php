<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\TransactionController;

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

// Transaction: Customer yang sudah login
Route::middleware('auth:sanctum')->group(function () {

    // Create
    Route::post('/transactions', [TransactionController::class, 'store']);

    // Show
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);

    // Update
    Route::put('/transactions/{id}', [TransactionController::class, 'update']);
    Route::patch('/transactions/{id}', [TransactionController::class, 'update']);

    // Admin only
    Route::middleware('admin')->group(function () {

        // Read All
        Route::get('/transactions', [TransactionController::class, 'index']);

        // Destroy
        Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);

    });
});