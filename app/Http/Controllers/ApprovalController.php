<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Classroom;  // <-- NUEVO
use App\Models\Activity;   // <-- NUEVO
use App\Models\Assignment; // <-- NUEVO
use App\Models\Submission; // <-- NUEVO
use Illuminate\Support\Facades\DB; // <-- NUEVO
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Notifications\AccountApproved;

class ApprovalController extends Controller
{
    // Mostrar lista de espera al ADMIN
    public function index()
    {
        // Solo traemos a los que no están aprobados
        $pendingUsers = User::where('is_approved', false)->get();
        
        // ¡Cambiamos la ruta a la carpeta Admin!
        return Inertia::render('Admin/Approvals', [
            'pendingUsers' => $pendingUsers
        ]);
    }

    // El ADMIN aprueba y asigna rol
    public function approve(Request $request, User $user)
    {
        // Validamos que el admin nos diga qué rol le va a dar (student o teacher)
        $request->validate([
            'role' => 'required|in:student,teacher'
        ]);

        // Lo aprobamos y le guardamos su nuevo rol
        $user->update([
            'is_approved' => true,
            'role' => $request->role
        ]);

        // Disparamos el correo
        $user->notify(new AccountApproved());

        return back()->with('success', 'Usuario aprobado como ' . $request->role . ' exitosamente.');
    }

    // ========================================================
    // 🔥 EL BOTÓN NUCLEAR: LIMPIEZA SEMESTRAL 🔥
    // ========================================================
    public function wipeData(Request $request)
    {
        // 1. Doble candado de seguridad: Verificar que REALMENTE es el admin
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Acceso denegado. Solo el administrador puede hacer esto.');
        }

        // 2. Usamos DB::transaction para que si falla, no deje la base de datos a medias
        DB::transaction(function () {
            // Borramos primero lo que depende de otras cosas
            Submission::query()->delete(); // Entregas de tareas
            Assignment::query()->delete(); // Tareas PDF/Links
            Activity::query()->delete();   // Juegos H5P
            Classroom::query()->delete();  // Las clases

            // Finalmente, borramos a todos los usuarios que NO sean admin
            User::whereIn('role', ['teacher', 'student'])->delete();
        });

        // 3. Regresar con mensaje de éxito
        return back()->with('success', '🧹 Limpieza semestral completada. Tecaal está listo para el nuevo ciclo.');
    }
}