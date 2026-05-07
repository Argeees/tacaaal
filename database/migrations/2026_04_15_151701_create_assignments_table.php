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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            // Lo conectamos a la clase para saber de dónde es la tarea
            $table->foreignId('classroom_id')->constrained()->cascadeOnDelete();
            
            $table->string('title'); // Título (ej. "Ensayo en Drive")
            $table->text('instructions'); // Instrucciones detalladas
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
