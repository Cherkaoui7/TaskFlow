<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Ajouter un commentaire a une tache
     */
    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorize('create', [Comment::class, $task]);

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:1000'],
        ], [
            'content.required' => 'Le commentaire ne peut pas etre vide.',
            'content.max' => 'Le commentaire ne peut pas depasser 1000 caracteres.',
        ]);

        $comment = $task->comments()->create([
            'content' => $validated['content'],
            'user_id' => $request->user()->id,
        ]);

        $comment->load('user');

        return response()->json([
            'message' => 'Commentaire ajoute avec succes.',
            'comment' => $comment,
        ], 201);
    }

    /**
     * Supprimer un commentaire
     */
    public function destroy(Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->json([
            'message' => 'Commentaire supprime avec succes.',
        ]);
    }
}
