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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            // Conectamos la entrega a la Tarea
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            // Conectamos la entrega al Alumno
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // El link que pega el alumno
            $table->string('link_url'); 
            
            // La calificación que pondrá el maestro (de 1 a 10). 
            // 'nullable' significa que puede estar vacío (cuando el alumno recién entrega).
            $table->decimal('grade', 4, 2)->nullable(); 

            $table->timestamps();
            
            // Un alumno solo puede entregar una vez por tarea
            $table->unique(['assignment_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
