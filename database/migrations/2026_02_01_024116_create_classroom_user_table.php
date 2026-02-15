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
        Schema::create('classroom_user', function (Blueprint $table) {
            $table->id();
            
            // Relación con el Alumno
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Relación con la Clase
            $table->foreignId('classroom_id')->constrained()->onDelete('cascade');
            
            // Fecha de inscripción
            $table->timestamps();
            
            // Evitar duplicados: Un alumno no puede inscribirse 2 veces a la misma clase
            $table->unique(['user_id', 'classroom_id']);
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classroom_user');
    }
};
