<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    // Mengirim pesan dari customer
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $contactMessage = ContactMessage::create($validated);

        return response()->json([
            'message' => 'Pesan berhasil dikirim.',
            'data' => $contactMessage
        ], 201);
    }

    // Menampilkan semua pesan (Admin)
    public function index()
    {
        $messages = ContactMessage::latest()->get();

        return response()->json($messages);
    }

    // Menampilkan detail pesan (Admin)
    public function show($id)
    {
        $contactMessage = ContactMessage::findOrFail($id);

        return response()->json($contactMessage);
    }

    // Menandai pesan sudah dibaca (Admin)
    public function markAsRead($id)
    {
        $contactMessage = ContactMessage::findOrFail($id);

        $contactMessage->update([
            'is_read' => true
        ]);

        return response()->json([
            'message' => 'Pesan berhasil ditandai sudah dibaca.',
            'data' => $contactMessage
        ]);
    }

    // Menghapus pesan (Admin)
    public function destroy($id)
    {
        $contactMessage = ContactMessage::findOrFail($id);
        $contactMessage->delete();

        return response()->json([
            'message' => 'Pesan berhasil dihapus.'
        ]);
    }
}
