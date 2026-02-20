<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class CommentPolicy
{
    public function create(User $user, Task $task): bool
    {
        return $this->canAccessProject($user, $task->project);
    }

    public function delete(User $user, Comment $comment): bool
    {
        if ($comment->user_id === $user->id) {
            return true;
        }

        return $this->isProjectAdmin($user, $comment->task->project);
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
