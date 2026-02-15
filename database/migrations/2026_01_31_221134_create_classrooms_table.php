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
    Schema::create('classrooms', function (Blueprint $table) {
        $table->id();
        // El maestro dueño de la clase
        $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
        
        $table->string('name'); // Ej: "Inglés Avanzado"
        $table->string('access_code')->unique(); // Ej: "ING-2026"
        $table->boolean('is_active')->default(true);
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classrooms');
    }
};
