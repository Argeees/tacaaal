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
    Schema::create('activity_results', function (Blueprint $table) {
        $table->id();
        
        // Quién lo hizo y qué actividad fue
        $table->foreignId('activity_id')->constrained('activities')->onDelete('cascade');
        $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
        
        // Datos cuantitativos
        $table->integer('score');      // Puntos obtenidos (ej: 8)
        $table->integer('max_score');  // Puntos totales posibles (ej: 10)
        
        // Datos cualitativos (opcional, para saber cuánto tardó)
        $table->integer('duration_seconds')->nullable(); 
        
        $table->timestamps(); // created_at será la fecha en que lo terminó
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_results');
    }
};
