<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Classroom;
use App\Models\Submission;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    // 1. Maestro CREA una nueva instrucción/tarea
    public function store(Request $request, Classroom $classroom)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'instructions' => 'required|string',
            'due_date' => 'required|date',
        ]);

        $classroom->assignments()->create([
            'title' => $request->title,
            'instructions' => $request->instructions,
            'due_date' => $request->due_date,
        ]);

        return back()->with('success', 'Instrucción creada exitosamente.');
    }

    // 2. Alumno ENTREGA su trabajo (Pega el Link)
    public function submitLink(\Illuminate\Http\Request $request, \App\Models\Assignment $assignment)
        {
            $request->validate([
                'link_url' => 'nullable|url|max:255',
                'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,png,zip|max:10240', // Max 10MB
            ]);
            // 🚨 Candado de Fecha Límite
            if ($assignment->due_date && now()->greaterThan($assignment->due_date)) {
                return back()->withErrors(['error' => 'La fecha límite ha pasado. Ya no puedes entregar esta tarea.']);
            }

            if (!$request->link_url && !$request->hasFile('file')) {
                return back()->withErrors(['link_url' => 'Debes proporcionar un enlace o subir un archivo.']);
            }

            /** @var \App\Models\User $user */
            $user = \Illuminate\Support\Facades\Auth::user();

            // Buscamos si ya había entregado algo antes
            $submission = \App\Models\Submission::firstOrNew([
                'user_id' => $user->id,
                'assignment_id' => $assignment->id,
            ]);

            // Si subió un archivo...
            if ($request->hasFile('file')) {
                // Guardamos el archivo en la carpeta storage/app/public/submissions
                $path = $request->file('file')->store('submissions', 'public');
                $submission->file_path = $path;
                $submission->link_url = null; // Borramos el link viejo si existía
            } 
            // Si subió un link...
            elseif ($request->link_url) {
                $submission->link_url = $request->link_url;
                $submission->file_path = null; // Borramos el archivo viejo si existía
            }

            $submission->save();

            return back()->with('success', '¡Tarea entregada con éxito!');
        }
    // 3. Maestro CALIFICA la entrega
    public function grade(Request $request, Submission $submission)
    {
        $request->validate([
            // La nota debe ser un número entre 1 y 10
            'grade' => 'required|numeric|min:1|max:10' 
        ]);

        $submission->update([
            'grade' => $request->grade
        ]);

        return back()->with('success', 'Calificación guardada exitosamente.');
    }
}