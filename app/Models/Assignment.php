<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = ['classroom_id', 'title', 'instructions', 'due_date'];

    // Una tarea pertenece a una clase
    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    // Una tarea tiene muchas entregas (esto lo usaremos en el paso 2)
    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }
}