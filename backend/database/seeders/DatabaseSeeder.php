<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Créer 10 utilisateurs de test
        $users = User::factory(10)->create();

        // Créer 5 projets avec relations
        $projects = Project::factory(5)->create();

        // Ajouter des membres aux projets
        foreach ($projects as $project) {
            // Ajouter 2-4 membres aléatoires à chaque projet
            $randomMembers = $users->random(rand(2, 4));
            foreach ($randomMembers as $member) {
                if ($member->id !== $project->user_id) {
                    $project->members()->attach($member->id, [
                        'role' => fake()->randomElement(['admin', 'member']),
                    ]);
                }
            }
        }

        // Créer 50 tâches réparties dans les projets
        Task::factory(50)->create()->each(function ($task) use ($projects) {
            // Assigner certaines tâches à des membres du projet
            $project = $projects->random();
            $task->update(['project_id' => $project->id]);

            if ($task->assigned_to) {
                // S'assurer que l'utilisateur assigné est membre du projet
                $projectMembers = $project->members->pluck('id')->toArray();
                $projectMembers[] = $project->user_id;

                if (! in_array($task->assigned_to, $projectMembers)) {
                    $task->update([
                        'assigned_to' => fake()->randomElement($projectMembers),
                    ]);
                }
            }

            // S'assurer que le créateur est membre du projet
            $projectMembers = $project->members->pluck('id')->toArray();
            $projectMembers[] = $project->user_id;
            $task->update([
                'created_by' => fake()->randomElement($projectMembers),
            ]);
        });
    }
}
