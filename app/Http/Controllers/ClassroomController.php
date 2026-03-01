<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str; // Para generar códigos aleatorios
use Inertia\Inertia; // Para conectar con React
use Illuminate\Support\Facades\Storage;
use ZipArchive;
use App\Models\Activity;
use Illuminate\Support\Facades\File;

class ClassroomController extends Controller
{
    // Muestra el Dashboard del Maestro con sus clases
    public function index()
    {
        // Obtener solo las clases creadas por ESTE usuario
        $classrooms = Classroom::where('teacher_id', Auth::id())->get();

        return Inertia::render('Teacher/Dashboard', [
            'classrooms' => $classrooms
        ]);
    }

    // Guarda una nueva clase
    public function store(Request $request)
    {
        // 1. Validar que nos manden un nombre
        $request->validate([
            'name' => 'required|string|max:100',
        ]);
    
        // 2. Crear la clase
        Classroom::create([
            'teacher_id' => Auth::id(),
            'name' => $request->name,
            // Generar un código único de 6 letras mayúsculas (Ej: ABX92L)
            'access_code' => strtoupper(Str::random(6)),
            'is_active' => true,
        ]);

        // 3. Recargar la página
        return redirect()->back();
    }

    // Muestra una clase específica y sus actividades
    public function show(Classroom $classroom)
    {
        if ($classroom->teacher_id !== Auth::id()) {
            abort(403, 'No tienes permiso para ver esta clase.');
        }

        // 1. Buscamos las actividades de ESTA clase en la base de datos
        $activities = Activity::where('classroom_id', $classroom->id)->get();

        // 2. Se las enviamos a la vista
        return Inertia::render('Teacher/Show', [
            'classroom' => $classroom,
            'activities' => $activities 
        ]);
    }

    // SUBIR ACTIVIDAD (CON LA CORRECCIÓN DE RUTA PÚBLICA)
    public function storeActivity(Request $request, Classroom $classroom)
    {
        // 1. Validar
        $request->validate([
            'title' => 'required|string|max:150',
            'h5p_file' => 'required|file|extensions:h5p,zip|max:50000', 
        ]);

        // 2. Guardar el archivo en la carpeta temporal (esto sigue igual)
        $path = $request->file('h5p_file')->store('temp_h5p');
        
        // Obtener ruta absoluta del temporal para que ZipArchive la encuentre en Windows
        $fullPath = Storage::path($path);

        // 3. Crear registro en BD
        $activity = Activity::create([
            'classroom_id' => $classroom->id,
            'title' => $request->title,
            'h5p_type' => 'unknown',
            'h5p_parameters' => [], 
        ]);

        // 4. Descomprimir DIRECTAMENTE EN PUBLIC (Solución al Error 403)
        // Usamos public_path() en lugar de storage_path()
        $extractPath = public_path('h5p/' . $activity->id);
        
        // Asegurarnos de que el directorio destino existe
        if (!file_exists($extractPath)) {
            mkdir($extractPath, 0777, true);
        }
        
        $zip = new ZipArchive;
        $res = $zip->open($fullPath);

        if ($res === TRUE) {
            $zip->extractTo($extractPath);
            $zip->close();
            
            // Leer metadatos del H5P
            if (file_exists($extractPath . '/h5p.json')) {
                $jsonContent = json_decode(file_get_contents($extractPath . '/h5p.json'), true);
                $activity->update([
                    'h5p_type' => $jsonContent['mainLibrary'] ?? 'unknown',
                    'h5p_parameters' => $jsonContent 
                ]);
            }
        } else {
            // Si falla, borramos el registro de la BD para no dejar basura
            $activity->delete();
            return back()->withErrors(['h5p_file' => 'El archivo está corrupto (Error ZIP: ' . $res . ')']);
        }

        // 5. Limpiar archivo temporal
        Storage::delete($path);
        
        return redirect()->back();
    }

    // 5. Jugar/Ver Actividad
    public function play(Classroom $classroom, Activity $activity)
    {
        // Validar que la actividad pertenezca a la clase
        if ($activity->classroom_id !== $classroom->id) {
            abort(404);
        }

        return Inertia::render('Teacher/Player', [
            'classroom' => $classroom,
            'activity' => $activity
        ]);
    }
    // Vista de Calificaciones (Gradebook)
    public function grades(Classroom $classroom)
    {
        // 1. Seguridad: Solo el dueño de la clase puede ver esto
        if ($classroom->teacher_id !== Auth::id()) {
            abort(403, 'No tienes permiso para ver estas calificaciones.');
        }

        // 2. Obtenemos todas las actividades de la clase (para las columnas de la tabla)
        $activities = $classroom->activities;

        // 3. Obtenemos los alumnos y "cargamos" sus notas (Eager Loading)
        // Esto es muy eficiente: hace solo 2 consultas a la BD en lugar de 100
        $students = $classroom->students()->with(['grades' => function($query) use ($activities) {
            $query->whereIn('activity_id', $activities->pluck('id'));
        }])->get();

        return Inertia::render('Teacher/Grades', [
            'classroom' => $classroom,
            'activities' => $activities,
            'students' => $students
        ]);
    }
    // Eliminar una actividad
    public function destroyActivity(\App\Models\Activity $activity)
    {
        // 1. Seguridad: Verificar que el usuario sea el dueño de la clase
        if ($activity->classroom->teacher_id !== \Illuminate\Support\Facades\Auth::id()) {
            abort(403, 'No tienes permiso para borrar esto.');
        }

        // 2. (Opcional) Borrar los archivos del disco para no llenar basura
        // Storage::deleteDirectory('public/h5p/' . $activity->id); 
        // (Por ahora saltamos esto para no complicarte con permisos de carpetas)

        // 3. Borrar de la base de datos
        $activity->delete();

        return back()->with('success', 'Actividad eliminada correctamente.');
    }
    // Generador Automático de Sopa de Letras
public function storeWordSearch(\Illuminate\Http\Request $request, \App\Models\Classroom $classroom)
    {
        // 1. Validar
        $request->validate([
            'title' => 'required|string|max:255',
            'words' => 'required|string', 
        ]);

        // 2. Limpiar palabras
        $rawWords = explode(',', $request->words);
        $cleanWords = array_map('trim', $rawWords);
        $cleanWords = array_map('strtoupper', $cleanWords);
        $finalWordsString = implode(',', $cleanWords); 

        // 3. Crear el registro en la BD
        $activity = new \App\Models\Activity();
        $activity->title = $request->title;
        $activity->h5p_type = 'H5P.FindTheWords'; 
        $activity->classroom_id = $classroom->id;
        
        // 👇 ESTA ES LA LÍNEA NUEVA QUE FALTA 👇
        $activity->h5p_parameters = json_encode(['title' => $request->title]); 
        
        $activity->save();

        // 🚨 CANDADO: Obligamos a Laravel a refrescar y traernos el ID real de la BD 🚨
        $activity->refresh();

        if (empty($activity->id)) {
            // Si la BD falló en darnos el ID, cancelamos todo para evitar otro "derrame"
            $activity->delete();
            return back()->withErrors(['title' => 'Error de BD: No se pudo asignar un ID a la actividad.']);
        }

        // 4. Clonar la carpeta usando el ID seguro
        $templatePath = public_path('h5p/template_wordsearch');
        $newActivityPath = public_path('h5p/' . $activity->id);

        if (!\Illuminate\Support\Facades\File::exists($templatePath)) {
            $activity->delete();
            return back()->withErrors(['title' => 'Falta la plantilla template_wordsearch en public/h5p/']);
        }

        \Illuminate\Support\Facades\File::copyDirectory($templatePath, $newActivityPath);

        // 5. Inyectar las palabras nuevas
        $jsonPath = $newActivityPath . '/content/content.json';
        if (\Illuminate\Support\Facades\File::exists($jsonPath)) {
            $jsonContent = json_decode(file_get_contents($jsonPath), true);
            $jsonContent['wordList'] = $finalWordsString;
            $jsonContent['taskDescription'] = 'Encuentra las siguientes palabras: ' . str_replace(',', ', ', $finalWordsString);
            file_put_contents($jsonPath, json_encode($jsonContent, JSON_UNESCAPED_UNICODE));
        }

        return back()->with('success', '¡Sopa de letras generada con éxito!');
    }
}
