<?php

namespace App\Http\Controllers;

use App\Events\TaskUpdated;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Liste des taches d'un projet
     */
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $perPage = $this->resolvePerPage($request, 50);

        $tasks = $project->tasks()
            ->with(['assignedUser', 'creator'])
            ->paginate($perPage);

        return response()->json($tasks);
    }

    /**
     * Creer une nouvelle tache
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('create', [Task::class, $project]);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'in:todo,in_progress,done'],
            'priority' => ['sometimes', 'in:low,medium,high,critical'],
            'due_date' => ['nullable', 'date'],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ], [
            'title.required' => 'Le titre de la tache est obligatoire.',
            'title.max' => 'Le titre ne peut pas depasser 150 caracteres.',
            'description.max' => 'La description ne peut pas depasser 1000 caracteres.',
            'status.in' => 'Le statut doit etre: a faire, en cours ou termine.',
            'priority.in' => 'La priorite doit etre: basse, moyenne, haute ou critique.',
            'due_date.date' => 'La date limite doit etre valide.',
            'assigned_to.exists' => "L'utilisateur assigne n'existe pas.",
        ]);

        if (array_key_exists('assigned_to', $validated) && $validated['assigned_to'] !== null) {
            $assignedUser = User::find($validated['assigned_to']);
            if (! $assignedUser || (! $project->hasMember($assignedUser) && $project->user_id !== $assignedUser->id)) {
                return response()->json([
                    'message' => "L'utilisateur assigne doit etre membre du projet.",
                ], 422);
            }
        }

        $task = Task::create([
            ...$validated,
            'project_id' => $project->id,
            'created_by' => $request->user()->id,
            'assigned_to' => array_key_exists('assigned_to', $validated)
                ? $validated['assigned_to']
                : $request->user()->id,
        ]);

        $task->load(['assignedUser', 'creator', 'project']);

        return response()->json([
            'message' => 'Tache creee avec succes.',
            'task' => $task,
        ], 201);
    }

    /**
     * Afficher une tache specifique
     */
    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $task->load(['assignedUser', 'creator', 'project.members', 'comments.user']);

        return response()->json($task);
    }

    /**
     * Mettre a jour une tache
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'in:todo,in_progress,done'],
            'priority' => ['sometimes', 'in:low,medium,high,critical'],
            'due_date' => ['nullable', 'date'],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ], [
            'title.required' => 'Le titre de la tache est obligatoire.',
            'title.max' => 'Le titre ne peut pas depasser 150 caracteres.',
            'description.max' => 'La description ne peut pas depasser 1000 caracteres.',
            'status.in' => 'Le statut doit etre: a faire, en cours ou termine.',
            'priority.in' => 'La priorite doit etre: basse, moyenne, haute ou critique.',
            'due_date.date' => 'La date limite doit etre valide.',
            'assigned_to.exists' => "L'utilisateur assigne n'existe pas.",
        ]);

        if (array_key_exists('assigned_to', $validated) && $validated['assigned_to'] !== null) {
            $assignedUser = User::find($validated['assigned_to']);
            if (! $assignedUser || (! $task->project->hasMember($assignedUser) && $task->project->user_id !== $assignedUser->id)) {
                return response()->json([
                    'message' => "L'utilisateur assigne doit etre membre du projet.",
                ], 422);
            }
        }

        $task->update($validated);
        $task->load(['assignedUser', 'creator', 'project']);

        TaskUpdated::dispatch($task);

        return response()->json([
            'message' => 'Tache mise a jour avec succes.',
            'task' => $task,
        ]);
    }

    /**
     * Changer uniquement le statut d'une tache
     */
    public function updateStatus(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'status' => ['required', 'in:todo,in_progress,done'],
        ], [
            'status.required' => 'Le statut est obligatoire.',
            'status.in' => 'Le statut doit etre: a faire, en cours ou termine.',
        ]);

        $task->update(['status' => $validated['status']]);
        $task->load(['assignedUser', 'creator', 'project']);

        TaskUpdated::dispatch($task);

        return response()->json([
            'message' => 'Statut de la tache mis a jour avec succes.',
            'task' => $task,
        ]);
    }

    /**
     * Supprimer une tache
     */
    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->json([
            'message' => 'Tache supprimee avec succes.',
        ]);
    }

    /**
     * Recuperer les taches assignees a l'utilisateur
     * + les taches non assignees creees par lui
     */
    public function myTasks(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $this->resolvePerPage($request, 50);

        $tasks = Task::query()
            ->whereHas('project', function ($projectQuery) use ($user) {
                $projectQuery->where('user_id', $user->id)
                    ->orWhereHas('members', function ($memberQuery) use ($user) {
                        $memberQuery->where('user_id', $user->id);
                    });
            })
            ->where(function ($query) use ($user) {
                $query->where('assigned_to', $user->id)
                    ->orWhere(function ($subQuery) use ($user) {
                        $subQuery->whereNull('assigned_to')
                            ->where('created_by', $user->id);
                    });
            })
            ->with(['assignedUser', 'creator', 'project'])
            ->orderByRaw('due_date IS NULL')
            ->orderBy('due_date', 'asc')
            ->paginate($perPage);

        return response()->json($tasks);
    }

    private function resolvePerPage(Request $request, int $default): int
    {
        return max(1, min($request->integer('per_page', $default), 100));
    }
}
