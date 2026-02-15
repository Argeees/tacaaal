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
    Schema::create('activities', function (Blueprint $table) {
        $table->id();
        
        // Relación: Una actividad pertenece a una clase específica
        $table->foreignId('classroom_id')->constrained('classrooms')->onDelete('cascade');
        
        $table->string('title'); // Ej: "Verbos en Pasado"
        $table->text('description')->nullable();
        
        // Aquí guardaremos el tipo de juego (ej: 'crossword', 'memory')
        $table->string('h5p_type'); 
        
        // ¡IMPORTANTE! Aquí guardaremos toda la configuración del juego H5P en formato JSON
        // Esto te evita tener 20 tablas complejas de H5P por ahora.
        $table->json('h5p_parameters'); 
        
        $table->boolean('is_visible')->default(true);
        $table->timestamp('due_date')->nullable(); // Fecha límite
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
