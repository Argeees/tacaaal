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

        // Buscamos la clase por el código
        $classroom = Classroom::where('access_code', strtoupper($request->access_code))->first();

        if (!$classroom) {
            return back()->withErrors(['access_code' => 'El código no es válido.']);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Validar si ya está inscrito
        if ($user->classrooms()->where('classroom_id', $classroom->id)->exists()) {
            return back()->withErrors(['access_code' => 'Ya estás inscrito en esta clase.']);
        }

        // Inscripción exitosa
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

        // 👇 CORRECCIÓN: Cargar tareas y SOLO la entrega de este alumno específico
        $classroom->load(['assignments' => function ($query) use ($user) {
            $query->with(['submissions' => function ($subQuery) use ($user) {
                $subQuery->where('user_id', $user->id);
            }]);
        }]);

        // Cargamos las actividades Y ADEMÁS filtramos la calificación de ESTE usuario
        $activities = $classroom->activities()
            ->with(['grades' => function($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->get();
            
        // Transformamos los datos
        $activities->transform(function ($activity) {
            $activity->my_grade = $activity->grades->first(); 
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

        if (!$user->classrooms()->where('classroom_id', $classroom->id)->exists()) {
            abort(403, 'No estás inscrito en esta clase.');
        }

        if ($activity->classroom_id !== $classroom->id) {
            abort(404);
        }

        // 🚨 CANDADO 1: Si ya tiene calificación, lo regresamos al salón
        $yaJugo = Grade::where('user_id', $user->id)
                       ->where('activity_id', $activity->id)
                       ->exists();
                       
        if ($yaJugo) {
            return redirect()->route('student.classrooms.show', $classroom->id)
                             ->withErrors(['error' => 'Ya has completado esta actividad y no puedes repetirla.']);
        }

        return Inertia::render('Teacher/Player', [
            'classroom' => $classroom,
            'activity' => $activity,
            'gradeUrl' => route('student.grades.store', [$classroom->id, $activity->id]),
        ]);
    }

    // 5. Guardar la calificación
    public function storeGrade(Request $request, Classroom $classroom, \App\Models\Activity $activity)
    {
        $request->validate([
            'score' => 'required|integer',
            'max_score' => 'required|integer',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // 🚨 CANDADO 2: Verificamos si ya existe una nota en la base de datos
        $notaExistente = Grade::where('user_id', $user->id)
                              ->where('activity_id', $activity->id)
                              ->first();

        // Si ya hay nota, ignoramos este intento y regresamos error
        if ($notaExistente) {
            return back()->withErrors(['error' => 'Ya tienes calificación en esta actividad. No se puede sobrescribir.']);
        }

        // Si es su primera vez, creamos el registro
        Grade::create([
            'user_id' => $user->id,
            'activity_id' => $activity->id,
            'score' => $request->score,
            'max_score' => $request->max_score,
        ]);

        return back()->with('success', '¡Calificación guardada!');
    }
}