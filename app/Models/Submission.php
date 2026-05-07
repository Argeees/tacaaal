<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $fillable = ['assignment_id', 'user_id', 'link_url', 'grade'];

    // Una entrega pertenece a una tarea
    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    // Una entrega pertenece a un alumno
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}