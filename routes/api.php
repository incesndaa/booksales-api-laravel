
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\BookController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\ContactMessageController;

// Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Books
Route::apiResource('books', BookController::class)
    ->only(['index', 'show']);

Route::apiResource('books', BookController::class)
    ->except(['index', 'show'])
    ->middleware(['auth:sanctum', 'admin']);

// Genres
Route::apiResource('genres', GenreController::class)
    ->only(['index', 'show']);

Route::apiResource('genres', GenreController::class)
    ->except(['index', 'show'])
    ->middleware(['auth:sanctum', 'admin']);

// Authors
Route::apiResource('authors', AuthorController::class)
    ->only(['index', 'show']);

Route::apiResource('authors', AuthorController::class)
    ->except(['index', 'show'])
    ->middleware(['auth:sanctum', 'admin']);

// Midtrans Webhook
Route::post('/midtrans/notification', [
    MidtransWebhookController::class,
    'handle'
]);


// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Checkout
    Route::post('/checkout', [OrderController::class, 'checkout']);

    // Transactions
    Route::post('/transactions', [
        TransactionController::class,
        'store'
    ]);

    // History transaksi user
    Route::get('/transactions/history', [
        TransactionController::class,
        'history'
    ]);

    // Payment status
    Route::get('/payment-status/{orderNumber}', [
        TransactionController::class,
        'paymentStatus'
    ]);

    // Show transaction
    Route::get('/transactions/{id}', [
        TransactionController::class,
        'show'
    ])->whereNumber('id');

    // Update transaction
    Route::put('/transactions/{id}', [
        TransactionController::class,
        'update'
    ])->whereNumber('id');

    Route::patch('/transactions/{id}', [
        TransactionController::class,
        'update'
    ])->whereNumber('id');

    // Admin Routes
    Route::middleware('admin')->group(function () {

        // Read all transactions
        Route::get('/transactions', [
            TransactionController::class,
            'index'
        ]);

        // Delete transaction
        Route::delete('/transactions/{id}', [
            TransactionController::class,
            'destroy'
        ])->whereNumber('id');

        // Users CRUD
        Route::apiResource('users', UserController::class);
    });
});

// Contact Message
Route::post('/contact-messages', [
    ContactMessageController::class,
    'store'
]);

// Admin Contact Message Routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/contact-messages', [
        ContactMessageController::class,
        'index'
    ]);

    Route::get('/contact-messages/{id}', [
        ContactMessageController::class,
        'show'
    ])->whereNumber('id');

    Route::patch('/contact-messages/{id}/read', [
        ContactMessageController::class,
        'markAsRead'
    ])->whereNumber('id');

    Route::delete('/contact-messages/{id}', [
        ContactMessageController::class,
        'destroy'
    ])->whereNumber('id');
});