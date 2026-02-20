<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function view(User $user, Task $task): bool
    {
        return $this->canAccessProject($user, $task->project);
    }

    public function create(User $user, Project $project): bool
    {
        return $this->canAccessProject($user, $project);
    }

    public function update(User $user, Task $task): bool
    {
        return $this->canAccessProject($user, $task->project);
    }

    public function delete(User $user, Task $task): bool
    {
        return $task->created_by === $user->id || $this->isProjectAdmin($user, $task->project);
    }

    private function canAccessProject(User $user, Project $project): bool
    {
        if ($project->user_id === $user->id) {
            return true;
        }

        return $project->members()
            ->where('user_id', $user->id)
            ->exists();
    }

    private function isProjectAdmin(User $user, Project $project): bool
    {
        if ($project->user_id === $user->id) {
            return true;
        }

        return $project->members()
            ->where('user_id', $user->id)
            ->wherePivot('role', 'admin')
            ->exists();
    }
}
