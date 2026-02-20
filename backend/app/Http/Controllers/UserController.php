<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Rechercher des utilisateurs par nom ou email.
     */
    public function index(Request $request): JsonResponse
    {
        $search = (string) $request->query('search', '');

        $query = User::query()
            ->select(['id', 'name', 'email'])
            ->orderBy('name');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        // Limiter les résultats pour l'auto-complétion
        $users = $query->limit(20)->get();

        return response()->json($users);
    }

    /**
     * Mettre à jour le profil de l'utilisateur connecté.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user' => $user,
        ]);
    }

    /**
     * Uploader une photo de profil.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $url = asset('storage/'.$path);

            $user->update(['profile_picture' => $url]);

            return response()->json([
                'message' => 'Photo de profil mise à jour avec succès.',
                'user' => $user,
                'avatar_url' => $url,
            ]);
        }

        return response()->json(['message' => 'Aucun fichier téléchargé.'], 400);
    }
}
