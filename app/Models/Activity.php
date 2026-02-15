<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'classroom_id',
        'title',
        'description',
        'h5p_type',
        'h5p_parameters',
        'is_visible',
        'due_date'
    ];
    
    // Casting automático para que el JSON se lea como Array
    protected $casts = [
        'h5p_parameters' => 'array',
    ];
    // Relación: Una actividad tiene muchas calificaciones (de muchos alumnos)
    public function grades()
    {
        return $this->hasMany(Grade::class);
    }
    // Relación Inversa: Una actividad PERTENECE a una Clase
    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }
}