<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Author;

class AuthorController extends Controller
{
    public function index()
    {
        return response()->json(Author::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $author = Author::create($validated);

        return response()->json([
            'message' => 'Author berhasil ditambahkan',
            'data' => $author
        ], 201);
    }

     public function show(string $id)
    {
        $author = Author::find($id);

        if (!$author) {
            return response()->json([
                'message' => 'Author tidak ditemukan'
            ], 404);
        }

        return response()->json($author, 200);
    }

    // Mengubah author
    public function update(Request $request, string $id)
    {
        $author = Author::find($id);

        if (!$author) {
            return response()->json([
                'message' => 'Author tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $author->update($validated);

        return response()->json([
            'message' => 'Author berhasil diperbarui',
            'data' => $author
        ], 200);
    }

    // Menghapus author
    public function destroy(string $id)
    {
        $author = Author::find($id);

        if (!$author) {
            return response()->json([
                'message' => 'Author tidak ditemukan'
            ], 404);
        }

        $author->delete();

        return response()->json([
            'message' => 'Author berhasil dihapus'
        ], 200);
    }
}