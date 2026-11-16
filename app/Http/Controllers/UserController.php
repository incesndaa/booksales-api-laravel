<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::select('id', 'name', 'email', 'role', 'last_access')
                ->orderByDesc('id')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'customer'])],
        ]);

        $user = User::create($validated);

        return response()->json([
            'message' => 'User berhasil ditambahkan.',
            'data' => $user->only(['id', 'name', 'email', 'role', 'last_access']),
        ], 201);
    }

    public function show(User $user)
    {
        return response()->json(
            $user->only(['id', 'name', 'email', 'role', 'last_access'])
        );
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8',
            'role' => ['required', Rule::in(['admin', 'customer'])],
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'data' => $user->only(['id', 'name', 'email', 'role', 'last_access']),
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Akun yang sedang digunakan tidak dapat dihapus.',
            ], 422);
        }

        if ($user->transactions()->exists()) {
            return response()->json([
                'message' => 'User tidak dapat dihapus karena masih memiliki transaksi.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }
}