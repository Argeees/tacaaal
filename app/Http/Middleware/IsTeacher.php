<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsTeacher
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(\Illuminate\Http\Request $request, \Closure $next): \Symfony\Component\HttpFoundation\Response
    {
        // Si está logueado y es 'teacher' (o también si es el 'admin' supremo), lo dejamos pasar
        if (auth()->check() && in_array(auth()->user()->role, ['teacher', 'admin'])) {
            return $next($request);
        }

        // Si es un alumno, le damos un error 403 (Prohibido) con un mensaje claro
        abort(403, 'Acceso denegado. Solo los profesores pueden entrar a esta área.');
    }
}
