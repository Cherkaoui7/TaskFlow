<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Rechercher des projets et des tâches
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->input('q');
        $user = $request->user();

        if (! $query) {
            return response()->json([
                'projects' => [],
                'tasks' => [],
            ]);
        }

        // Recherche des projets
        // L'utilisateur doit être propriétaire ou membre
        $projects = Project::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%");
        })
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('members', function ($mq) use ($user) {
                        $mq->where('user_id', $user->id);
                    });
            })
            ->limit(5)
            ->get();

        // Recherche des tâches
        // L'utilisateur doit avoir accès au projet de la tâche
        $tasks = Task::where(function ($q) use ($query) {
            $q->where('title', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%");
        })
            ->whereHas('project', function ($pq) use ($user) {
                $pq->where('user_id', $user->id)
                    ->orWhereHas('members', function ($mq) use ($user) {
                        $mq->where('user_id', $user->id);
                    });
            })
            ->with(['project:id,name'])
            ->limit(10)
            ->get();

        return response()->json([
            'projects' => $projects,
            'tasks' => $tasks,
        ]);
    }
}
