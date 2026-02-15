<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Grade;

class StudentController extends Controller
{
    // 1. Dashboard del Estudiante: Muestra MIS clases
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        // Obtenemos las clases donde el usuario está inscrito
        // (Usamos la relación 'classrooms' que creamos en el modelo User)
        $classrooms = $user->classrooms()->get();

        return Inertia::render('Student/Dashboard', [
            'classrooms' => $classrooms
        ]);
    }

    // 2. Unirse a una clase (La lógica del código secreto)
    public function join(Request $request)
    {
        $request->validate([
            'access_code' => 'required|string|size:6',
        ]);

        // Buscamos la clase por el código (ignorando mayúsculas/minúsculas)
        $classroom = Classroom::where('access_code', strtoupper($request->access_code))->first();

        if (!$classroom) {
            return back()->withErrors(['access_code' => 'El código no es válido.']);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Validar si ya está inscrito para no duplicar
        if ($user->classrooms()->where('classroom_id', $classroom->id)->exists()) {
            return back()->withErrors(['access_code' => 'Ya estás inscrito en esta clase.']);
        }

        // ¡Inscripción exitosa! Guardamos en la tabla pivote
        $user->classrooms()->attach($classroom->id);

        return redirect()->back()->with('success', '¡Te has unido a la clase correctamente!');
    }
    
    // 3. Ver una clase por dentro (como estudiante)
public function show(Classroom $classroom)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        if (!$user->classrooms()->where('classroom_id', $classroom->id)->exists()) {
            abort(403, 'No estás inscrito en esta clase.');
        }

        // --- CAMBIO AQUÍ ---
        // Cargamos las actividades Y ADEMÁS filtramos la calificación de ESTE usuario
        $activities = $classroom->activities()
            ->with(['grades' => function($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->get();
            
        // Transformamos los datos para facilitar el uso en React
        // (Movemos la nota "hacia afuera" para que sea fácil leerla)
        $activities->transform(function ($activity) {
            $activity->my_grade = $activity->grades->first(); // Sacamos la primera (y única) nota
            return $activity;
        });

        return Inertia::render('Student/Show', [
            'classroom' => $classroom,
            'activities' => $activities
        ]);
    }
    // 4. Jugar una actividad (Modo Alumno)
    public function play(Classroom $classroom, \App\Models\Activity $activity)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // 1. Seguridad: Verificar que el alumno esté inscrito
        if (!$user->classrooms()->where('classroom_id', $classroom->id)->exists()) {
            abort(403, 'No estás inscrito en esta clase.');
        }

        // 2. Seguridad: Verificar que la actividad sea de esta clase
        if ($activity->classroom_id !== $classroom->id) {
            abort(404);
        }

        // 3. Renderizar el MISMO Player que usa el maestro
        // (La vista Player.jsx ya sabe manejar usuarios, así que funcionará igual)
        return Inertia::render('Teacher/Player', [
            'classroom' => $classroom,
            'activity' => $activity,
            // Aquí en el futuro pasaremos si ya la completó o su calificación anterior
            'gradeUrl' => route('student.grades.store', [$classroom->id, $activity->id]),
        ]);
    }
    // 5. Guardar la calificación (Recibida desde React)
    public function storeGrade(Request $request, Classroom $classroom, \App\Models\Activity $activity)
    {
        // Validamos que vengan los datos
        $request->validate([
            'score' => 'required|integer',
            'max_score' => 'required|integer',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Guardamos o actualizamos la nota
        // (Si ya jugó antes, actualizamos su nota. Si es la primera vez, la creamos)
        \App\Models\Grade::updateOrCreate(
            [
                'user_id' => $user->id,
                'activity_id' => $activity->id,
            ],
            [
                'score' => $request->score,
                'max_score' => $request->max_score,
            ]
        );

        return back()->with('success', '¡Calificación guardada!');
    }
}