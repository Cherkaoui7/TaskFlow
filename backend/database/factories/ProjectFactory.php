<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 month', 'now');
        $endDate = fake()->dateTimeBetween($startDate, '+3 months');

        return [
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(10),
            'start_date' => $startDate,
            'end_date' => fake()->optional(0.7)->dateTimeBetween($startDate, $endDate),
            'color' => fake()->optional()->hexColor(),
            'status' => fake()->randomElement(['active', 'archived']),
            'user_id' => User::factory(),
        ];
    }
}
