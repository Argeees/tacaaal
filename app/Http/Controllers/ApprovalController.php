<?php

namespace App\Http\Controllers;

use App\Models\User;
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
}