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
        Schema::table('users', function (Blueprint $table) {
            // Agregamos el expediente (único para cada alumno)
            $table->string('expediente')->unique()->nullable();
            
            // Agregamos el estatus de aprobación (por defecto es falso/0)
            $table->boolean('is_approved')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['expediente', 'is_approved']);
        });
    }
};
