<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'content',
        'task_id',
        'user_id',
    ];

    /**
     * La tâche à laquelle appartient le commentaire
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * L'auteur du commentaire
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
