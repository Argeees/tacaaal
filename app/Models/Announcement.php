<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['classroom_id', 'content', 'file_path', 'link_url'];

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }
}