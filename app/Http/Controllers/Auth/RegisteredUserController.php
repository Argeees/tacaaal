<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        // 1. Validamos que el expediente venga y no esté repetido
        $request->validate([
            'name' => 'required|string|max:255',
            'expediente' => 'required|string|max:255|unique:'.User::class, // <--- NUEVA REGLA
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ]);

        // 2. Creamos al usuario (is_approved se pone en 'false' por defecto gracias a la BD)
        $user = User::create([
            'name' => $request->name,
            'expediente' => $request->expediente, // <--- GUARDAMOS EL EXPEDIENTE
            'email' => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
        ]);

        event(new \Illuminate\Auth\Events\Registered($user));

        // 3. 🚨 EL CAMBIO MÁS IMPORTANTE 🚨
        // Borramos (o comentamos) la línea de Auth::login($user); para que no entren de golpe.
        // Auth::login($user); 

        // 4. Los mandamos al login con un mensaje de espera
        return redirect()->route('login')->with('status', '¡Registro exitoso! Tu cuenta está en revisión. Te notificaremos cuando el administrador te dé de alta.');
    }
}
