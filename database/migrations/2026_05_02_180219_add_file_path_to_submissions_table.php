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
    Schema::table('submissions', function (Blueprint $table) {
        // Agregamos la columna para la ruta del archivo
        $table->string('file_path')->nullable()->after('link_url');
        // Hacemos que el link sea opcional por si solo suben archivo
        $table->string('link_url')->nullable()->change(); 
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            //
        });
    }
};
