<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('enrollments', function (Blueprint $table) {
        $table->id();
        
        // Relación: Alumno <-> Clase
        $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('classroom_id')->constrained('classrooms')->onDelete('cascade');
        
        // Evitar que un alumno se inscriba dos veces al mismo curso
        $table->unique(['student_id', 'classroom_id']); 
        
        $table->timestamps(); // Fecha de inscripción (created_at)
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
