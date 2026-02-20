<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Liste des projets de l'utilisateur connecte
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Project::class);

        $user = $request->user();
        $perPage = $this->resolvePerPage($request, 20);

        $projects = Project::where('user_id', $user->id)
            ->orWhereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['members', 'tasks'])
            ->withCount('tasks')
            ->withCount([
                'tasks as tasks_todo_count' => function ($query) {
                    $query->where('status', 'todo');
                },
                'tasks as tasks_in_progress_count' => function ($query) {
                    $query->where('status', 'in_progress');
                },
                'tasks as tasks_done_count' => function ($query) {
                    $query->where('status', 'done');
                },
            ])
            ->paginate($perPage);

        return response()->json($projects);
    }

    /**
     * Creer un nouveau projet
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Project::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ], [
            'name.required' => 'Le nom du projet est obligatoire.',
            'name.max' => 'Le nom du projet ne peut pas depasser 100 caracteres.',
            'description.max' => 'La description ne peut pas depasser 500 caracteres.',
            'start_date.required' => 'La date de debut est obligatoire.',
            'start_date.date' => 'La date de debut doit etre valide.',
            'end_date.date' => 'La date de fin doit etre valide.',
            'end_date.after_or_equal' => 'La date de fin doit etre posterieure ou egale a la date de debut.',
            'color.regex' => 'La couleur doit etre au format hexadecimal (#RRGGBB).',
        ]);

        $project = Project::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        // Ajouter le createur comme admin du projet
        $project->members()->attach($request->user()->id, ['role' => 'admin']);

        $project->load(['members', 'tasks']);

        return response()->json([
            'message' => 'Projet cree avec succes.',
            'project' => $project,
        ], 201);
    }

    /**
     * Afficher un projet specifique
     */
    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $project->load(['members', 'tasks.assignedUser', 'tasks.creator'])->loadCount('tasks');

        return response()->json($project);
    }

    /**
     * Mettre a jour un projet
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'status' => ['sometimes', 'in:active,archived'],
        ], [
            'name.required' => 'Le nom du projet est obligatoire.',
            'name.max' => 'Le nom du projet ne peut pas depasser 100 caracteres.',
            'description.max' => 'La description ne peut pas depasser 500 caracteres.',
            'start_date.required' => 'La date de debut est obligatoire.',
            'start_date.date' => 'La date de debut doit etre valide.',
            'end_date.date' => 'La date de fin doit etre valide.',
            'end_date.after_or_equal' => 'La date de fin doit etre posterieure ou egale a la date de debut.',
            'color.regex' => 'La couleur doit etre au format hexadecimal (#RRGGBB).',
            'status.in' => 'Le statut doit etre actif ou archive.',
        ]);

        $project->update($validated);
        $project->load(['members', 'tasks']);

        return response()->json([
            'message' => 'Projet mis a jour avec succes.',
            'project' => $project,
        ]);
    }

    /**
     * Supprimer un projet
     */
    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json([
            'message' => 'Projet supprime avec succes.',
        ]);
    }

    /**
     * Ajouter un membre a un projet
     */
    public function addMember(Request $request, Project $project): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['sometimes', 'in:admin,member'],
        ], [
            'user_id.required' => "L'ID de l'utilisateur est obligatoire.",
            'user_id.exists' => "L'utilisateur specifie n'existe pas.",
            'role.in' => 'Le role doit etre admin ou member.',
        ]);

        $userToAdd = User::find($validated['user_id']);

        if ($userToAdd && $project->hasMember($userToAdd)) {
            return response()->json([
                'message' => 'Cet utilisateur est deja membre du projet.',
            ], 422);
        }

        $project->members()->attach($validated['user_id'], [
            'role' => $validated['role'] ?? 'member',
        ]);

        $project->load('members');

        return response()->json([
            'message' => 'Membre ajoute avec succes.',
            'project' => $project,
        ], 201);
    }

    /**
     * Retirer un membre d'un projet
     */
    public function removeMember(Request $request, Project $project, int $userId): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        if ($project->user_id === $userId) {
            return response()->json([
                'message' => 'Le createur du projet ne peut pas etre retire.',
            ], 422);
        }

        $memberExists = $project->members()->where('user_id', $userId)->exists();
        if (! $memberExists) {
            return response()->json([
                'message' => 'Cet utilisateur nest pas membre du projet.',
            ], 404);
        }

        $isAdminMember = $project->members()
            ->where('user_id', $userId)
            ->wherePivot('role', 'admin')
            ->exists();

        if ($isAdminMember) {
            $adminCount = $project->members()->wherePivot('role', 'admin')->count();

            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'Impossible de retirer le dernier administrateur du projet.',
                ], 422);
            }
        }

        $project->members()->detach($userId);

        return response()->json([
            'message' => 'Membre retire avec succes.',
        ]);
    }

    private function resolvePerPage(Request $request, int $default): int
    {
        return max(1, min($request->integer('per_page', $default), 100));
    }
}
