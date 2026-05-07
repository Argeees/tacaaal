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
    // Muestra una clase específica y sus actividades
// Muestra una clase específica y sus actividades (VISTA MAESTRO)
    public function show(Classroom $classroom)
    {
        // 👇 AQUÍ ES DONDE DEBE DECIR != EN LUGAR DE !== 👇
        if ($classroom->teacher_id != Auth::id()) {
            abort(403, 'No tienes permiso para ver esta clase.');
        }
        
        // Cargamos la clase con los alumnos y tareas
        $classroom->load(['students', 'assignments.submissions.user']);
        
        // 1. Buscamos las actividades de ESTA clase en la base de datos
        $activities = \App\Models\Activity::where('classroom_id', $classroom->id)->get();

        // 2. Se las enviamos a la vista
        return \Inertia\Inertia::render('Teacher/Show', [
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
        if ($classroom->teacher_id != Auth::id()) {
            abort(403, 'No tienes permiso para ver estas calificaciones.');
        }

        // 1. Obtenemos las actividades H5P
        $activities = $classroom->activities;

        // 2. 👇 NUEVO: Obtenemos las tareas de link y cargamos sus entregas 👇
        $assignments = $classroom->assignments()->with('submissions')->get();

        // 3. Obtenemos a los alumnos y sus calificaciones de H5P
        $students = $classroom->students()->with(['grades' => function($query) use ($activities) {
            $query->whereIn('activity_id', $activities->pluck('id'));
        }])->get();

        return Inertia::render('Teacher/Grades', [
            'classroom' => $classroom,
            'activities' => $activities,
            'assignments' => $assignments, // Mandamos las tareas a React
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
    // =========================================================
    // MOTOR GENERADOR DE CRUCIGRAMAS
    // =========================================================
    public function storeCrossword(\Illuminate\Http\Request $request, \App\Models\Classroom $classroom)
    {
        $request->validate(['title' => 'required|string', 'words' => 'required|string']);

        // 1. Procesar el texto del maestro ("PALABRA: La pista")
        $lines = explode("\n", str_replace("\r", "", $request->words));
        $wordList = [];
        foreach($lines as $line) {
            if(strpos($line, ':') !== false) {
                list($answer, $clue) = explode(':', $line, 2);
                $answer = preg_replace('/[^A-Z]/', '', strtoupper(trim($answer))); // Solo letras
                if(strlen($answer) > 1) {
                    $wordList[] = ['answer' => $answer, 'clue' => trim($clue)];
                }
            }
        }

        if(count($wordList) < 2) return back()->withErrors(['words' => 'Se necesitan al menos 2 palabras válidas.']);

        // 2. Ejecutar el Algoritmo de Cruce
        $placedWords = $this->generateCrosswordLayout($wordList);

        // 3. Guardar en Base de Datos
        $activity = new \App\Models\Activity();
        $activity->title = $request->title;
        $activity->h5p_type = 'H5P.Crossword'; 
        $activity->classroom_id = $classroom->id;
        $activity->h5p_parameters = json_encode(['title' => $request->title]); 
        $activity->save();

        // 4. Clonar Plantilla e Inyectar
        $templatePath = public_path('h5p/template_crossword');
        $newPath = public_path('h5p/' . $activity->id);

        if (!\Illuminate\Support\Facades\File::exists($templatePath)) {
            $activity->delete(); return back()->withErrors(['title' => 'Falta template_crossword en public/h5p']);
        }

        \Illuminate\Support\Facades\File::copyDirectory($templatePath, $newPath);
        $jsonPath = $newPath . '/content/content.json';
        
        if (\Illuminate\Support\Facades\File::exists($jsonPath)) {
            $json = json_decode(file_get_contents($jsonPath), true);
            $json['words'] = array_values($placedWords); // Inyectar coordenadas
            $json['taskDescription'] = 'Resuelve el siguiente crucigrama.';
            file_put_contents($jsonPath, json_encode($json, JSON_UNESCAPED_UNICODE));
        }

        return back()->with('success', '¡Crucigrama generado con éxito!');
    }

    // --- ALGORITMOS PRIVADOS DE CÁLCULO DE COORDENADAS ---
    private function generateCrosswordLayout($wordList) {
        $placedWords = []; $grid = [];
        // Ordenar de la palabra más larga a la más corta para un mejor cruce
        usort($wordList, function($a, $b) { return strlen($b['answer']) - strlen($a['answer']); });

        foreach ($wordList as $item) {
            $word = $item['answer']; $placed = false;

            if (empty($placedWords)) {
                $placedWords[] = $this->placeWordOnGrid($grid, $item, 20, 20, 'across');
                continue;
            }

            foreach ($placedWords as $pWord) {
                if ($placed) break;
                for ($i = 0; $i < strlen($pWord['answer']); $i++) {
                    if ($placed) break;
                    for ($j = 0; $j < strlen($word); $j++) {
                        if ($pWord['answer'][$i] === $word[$j]) {
                            // Encontramos una letra igual, intentamos cruzar
                            $orientation = $pWord['orientation'] === 'across' ? 'down' : 'across';
                            $startX = $pWord['orientation'] === 'across' ? $pWord['x'] + $i : $pWord['x'] - $j;
                            $startY = $pWord['orientation'] === 'across' ? $pWord['y'] - $j : $pWord['y'] + $i;

                            if ($this->canPlaceWord($grid, $word, $startX, $startY, $orientation)) {
                                $placedWords[] = $this->placeWordOnGrid($grid, $item, $startX, $startY, $orientation);
                                $placed = true; break;
                            }
                        }
                    }
                }
            }

            // Si no comparte letras, la ponemos al final abajo
            if (!$placed) {
                $maxY = 20;
                foreach ($placedWords as $pw) $maxY = max($maxY, $pw['y'] + ($pw['orientation'] == 'down' ? strlen($pw['answer']) : 1));
                $placedWords[] = $this->placeWordOnGrid($grid, $item, 20, $maxY + 2, 'across');
            }
        }

        // Centrar las coordenadas al origen (1,1) para H5P
        $minX = 999; $minY = 999;
        foreach ($placedWords as $pw) { $minX = min($minX, $pw['x']); $minY = min($minY, $pw['y']); }
        foreach ($placedWords as &$pw) { $pw['x'] = $pw['x'] - $minX + 1; $pw['y'] = $pw['y'] - $minY + 1; }
        return $placedWords;
    }

    private function canPlaceWord($grid, $word, $x, $y, $orientation) {
        $len = strlen($word);
        for ($i = 0; $i < $len; $i++) {
            $cx = $orientation === 'across' ? $x + $i : $x;
            $cy = $orientation === 'across' ? $y : $y + $i;
            if (isset($grid[$cy][$cx]) && $grid[$cy][$cx] !== $word[$i]) return false; // Choca con letra distinta
            if (!isset($grid[$cy][$cx])) {
                // Revisar que no toque otra palabra en paralelo
                if ($orientation === 'across' && (isset($grid[$cy-1][$cx]) || isset($grid[$cy+1][$cx]))) return false;
                if ($orientation === 'down' && (isset($grid[$cy][$cx-1]) || isset($grid[$cy][$cx+1]))) return false;
            }
        }
        // Espacios vacíos antes y después
        if ($orientation === 'across' && (isset($grid[$y][$x-1]) || isset($grid[$y][$x+$len]))) return false;
        if ($orientation === 'down' && (isset($grid[$y-1][$x]) || isset($grid[$y+$len][$x]))) return false;
        return true;
    }

    private function placeWordOnGrid(&$grid, $item, $x, $y, $orientation) {
        for ($i = 0; $i < strlen($item['answer']); $i++) {
            $cx = $orientation === 'across' ? $x + $i : $x;
            $cy = $orientation === 'across' ? $y : $y + $i;
            $grid[$cy][$cx] = $item['answer'][$i];
        }
        $item['x'] = $x; $item['y'] = $y; $item['orientation'] = $orientation;
        return $item;
    }
    // =========================================================
    // GENERADOR DE DRAG THE WORDS
    // =========================================================
    public function storeDragWords(\Illuminate\Http\Request $request, \App\Models\Classroom $classroom)
    {
        // 1. Validar
        $request->validate([
            'title' => 'required|string|max:255',
            'text' => 'required|string', // El texto que trae los *asteriscos*
        ]);

        // 2. Guardar en Base de Datos
        $activity = new \App\Models\Activity();
        $activity->title = $request->title;
        $activity->h5p_type = 'H5P.DragText'; // Tipo interno
        $activity->classroom_id = $classroom->id;
        $activity->h5p_parameters = json_encode(['title' => $request->title]); 
        $activity->save();

        // 3. Clonar la carpeta de la plantilla
        $templatePath = public_path('h5p/template_dragwords');
        $newPath = public_path('h5p/' . $activity->id);

        if (!\Illuminate\Support\Facades\File::exists($templatePath)) {
            $activity->delete();
            return back()->withErrors(['title' => 'Falta la plantilla template_dragwords en public/h5p/']);
        }

        \Illuminate\Support\Facades\File::copyDirectory($templatePath, $newPath);

        // 4. Inyectar el texto en el archivo JSON
        $jsonPath = $newPath . '/content/content.json';
        
        if (\Illuminate\Support\Facades\File::exists($jsonPath)) {
            $json = json_decode(file_get_contents($jsonPath), true);
            
            // H5P DragText guarda su texto principal bajo la llave 'textField'
            $json['textField'] = $request->text;
            $json['taskDescription'] = 'Arrastra las palabras correctas a los espacios vacíos.';
            $json['distractors'] = ''; // Borramos cualquier palabra trampa vieja de la plantilla
            
            file_put_contents($jsonPath, json_encode($json, JSON_UNESCAPED_UNICODE));
        }

        return back()->with('success', '¡Actividad de arrastrar palabras generada!');
    }
    // =========================================================
    // GENERADOR DE FILL IN THE BLANKS (RELLENAR HUECOS)
    // =========================================================
    public function storeBlanks(\Illuminate\Http\Request $request, \App\Models\Classroom $classroom)
    {
        // 1. Validar
        $request->validate([
            'title' => 'required|string|max:255',
            'text' => 'required|string', 
        ]);

        // 2. Guardar en Base de Datos
        $activity = new \App\Models\Activity();
        $activity->title = $request->title;
        $activity->h5p_type = 'H5P.Blanks'; 
        $activity->classroom_id = $classroom->id;
        $activity->h5p_parameters = json_encode(['title' => $request->title]); 
        $activity->save();

        // 3. Clonar la plantilla
        $templatePath = public_path('h5p/template_blanks');
        $newPath = public_path('h5p/' . $activity->id);

        if (!\Illuminate\Support\Facades\File::exists($templatePath)) {
            $activity->delete();
            return back()->withErrors(['title' => 'Falta la plantilla template_blanks en public/h5p/']);
        }

        \Illuminate\Support\Facades\File::copyDirectory($templatePath, $newPath);

        // 4. Inyectar el texto
        $jsonPath = $newPath . '/content/content.json';
        
        if (\Illuminate\Support\Facades\File::exists($jsonPath)) {
            $json = json_decode(file_get_contents($jsonPath), true);
            
            // H5P Blanks usa un arreglo "questions" y espera formato HTML <p>
            $json['questions'] = ['<p>' . nl2br($request->text) . '</p>'];
            $json['text'] = 'Escribe las palabras que faltan en los siguientes espacios.';
            
            file_put_contents($jsonPath, json_encode($json, JSON_UNESCAPED_UNICODE));
        }

        return back()->with('success', '¡Actividad de rellenar huecos generada!');
    }
    // =========================================================
    // EXPULSAR ALUMNO DE LA CLASE
    // =========================================================
    public function removeStudent(\App\Models\Classroom $classroom, \App\Models\User $student)
    {
        // "detach" borra el vínculo entre el alumno y la clase en la tabla pivot
        $classroom->students()->detach($student->id);

        return back()->with('success', 'Alumno eliminado de la clase correctamente.');
    }
}
