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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            
            // ¿Quién jugó?
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // ¿Qué jugó?
            $table->foreignId('activity_id')->constrained()->onDelete('cascade');
            
            // ¿Cuánto sacó?
            $table->integer('score');      // Puntos obtenidos (ej: 8)
            $table->integer('max_score');  // Puntos máximos posibles (ej: 10)
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
