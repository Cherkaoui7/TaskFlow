<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('tasks.{taskId}', function ($user, $taskId) {
    // Check if user has access to the task's project
    $task = \App\Models\Task::find($taskId);
    if (! $task) {
        return false;
    }

    return $task->project->hasMember($user) || $task->project->user_id === $user->id;
});

Broadcast::channel('projects.{projectId}', function ($user, $projectId) {
    $project = \App\Models\Project::find($projectId);
    if (! $project) {
        return false;
    }

    return $project->hasMember($user) || $project->user_id === $user->id;
});
