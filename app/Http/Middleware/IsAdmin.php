<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(\Illuminate\Http\Request $request, \Closure $next): \Symfony\Component\HttpFoundation\Response
    {
        // Si está logueado y su rol es 'admin', lo dejamos pasar
        if (auth()->check() && auth()->user()->role === 'admin') {
            return $next($request);
        }

        // Si es un alumno o maestro, le damos un error 403 (Prohibido)
        abort(403, 'Acceso denegado. Esta área es exclusiva para administradores.');
    }
}
