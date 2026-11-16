<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    public function index()
    {
        $books = Book::with('author', 'genre')->get();

        return response()->json(
            $books->map(fn ($book) => $this->formatBook($book))
        );
    }

    public function show($id)
    {
        $book = Book::with('author', 'genre')->findOrFail($id);

        return response()->json($this->formatBook($book));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'genre_id' => 'required|exists:genres,id',
            'author_id' => 'required|exists:authors,id',
            'cover_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('cover_photo')) {
            $validated['cover_photo'] = $request->file('cover_photo')
                ->store('books', 'public');
        }

        $book = Book::create($validated);

        return response()->json([
            'message' => 'Buku berhasil ditambahkan.',
            'data' => $this->formatBook($book->load('author', 'genre')),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'genre_id' => 'required|exists:genres,id',
            'author_id' => 'required|exists:authors,id',
            'cover_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('cover_photo')) {
            if ($book->cover_photo &&
                !filter_var($book->cover_photo, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($book->cover_photo);
            }

            $validated['cover_photo'] = $request->file('cover_photo')
                ->store('books', 'public');
        } else {
            unset($validated['cover_photo']);
        }

        $book->update($validated);

        return response()->json([
            'message' => 'Buku berhasil diperbarui.',
            'data' => $this->formatBook($book->load('author', 'genre')),
        ]);
    }

    public function destroy($id)
    {
        $book = Book::findOrFail($id);

        if ($book->cover_photo &&
            !filter_var($book->cover_photo, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($book->cover_photo);
        }

        $book->delete();

        return response()->json([
            'message' => 'Buku berhasil dihapus.',
        ]);
    }

    private function formatBook($book)
    {
        if ($book->cover_photo &&
            !filter_var($book->cover_photo, FILTER_VALIDATE_URL)) {
            $book->cover_photo = Storage::disk('public')->url(
                $book->cover_photo
            );
        }

        return $book;
    }
}
