<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return (bool) $user;
    }

    public function view(User $user, Project $project): bool
    {
        return $this->isProjectMember($user, $project);
    }

    public function create(User $user): bool
    {
        return (bool) $user;
    }

    public function update(User $user, Project $project): bool
    {
        return $this->isProjectAdmin($user, $project);
    }

    public function delete(User $user, Project $project): bool
    {
        return $this->isProjectAdmin($user, $project);
    }

    public function manageMembers(User $user, Project $project): bool
    {
        return $this->isProjectAdmin($user, $project);
    }

    private function isProjectMember(User $user, Project $project): bool
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
