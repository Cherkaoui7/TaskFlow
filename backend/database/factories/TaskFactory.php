<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'status' => fake()->randomElement(['todo', 'in_progress', 'done']),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'critical']),
            'due_date' => fake()->optional(0.6)->dateTimeBetween('now', '+2 months'),
            'project_id' => Project::factory(),
            'assigned_to' => fake()->optional(0.7)->randomElement([User::factory(), null]),
            'created_by' => User::factory(),
        ];
    }
}
