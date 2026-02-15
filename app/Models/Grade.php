<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'activity_id',
        'score',
        'max_score',
    ];

    // Relación opcional (por si la necesitas luego)
    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }
}