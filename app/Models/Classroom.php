<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    use HasFactory;

    // ESTA ES LA LISTA BLANCA DE CAMPOS PERMITIDOS
    protected $fillable = [
        'teacher_id',
        'name',
        'access_code',
        'is_active',
    ];

    // Opcional: Relación inversa para saber quién es el maestro
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
    // Relación: Una clase tiene muchos estudiantes (usuarios)
    public function students()
    {
        // Especificamos que la relación es con User
        return $this->belongsToMany(User::class)->withTimestamps();
    }
    // Relación: Una clase tiene muchas actividades
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }
    // Una clase tiene muchas tareas asignadas
    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }
    

}