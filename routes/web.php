<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\StudentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth; // <--- Agregamos esto para usar Auth
use Inertia\Inertia;

// --- RUTA DE BIENVENIDA ---
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// --- DASHBOARD INTELIGENTE (SEMÁFORO) 🚦 ---
// Esta ruta decide a dónde va el usuario según su rol
Route::get('/dashboard', function () {
    $user = Auth::user();

    if ($user->role === 'teacher') {
        return redirect()->route('teacher.dashboard');
    }

    // Si no es maestro, va al panel de estudiante
    return redirect()->route('student.dashboard');

})->middleware(['auth', 'verified'])->name('dashboard');


// --- GRUPO DE RUTAS PROTEGIDAS (Requiere Login) ---
Route::middleware('auth')->group(function () {

    // ==========================================
    // 👨‍🏫 RUTAS PARA MAESTROS (Teacher)
    // ==========================================
    Route::prefix('teacher')->name('teacher.')->group(function () {
        
        // Panel principal del maestro
        Route::get('/dashboard', [ClassroomController::class, 'index'])->name('dashboard');
        
        // 👇 ESTAS DOS RUTAS SE HABÍAN BORRADO 👇
        // Guardar clase nueva
        Route::post('/classrooms', [ClassroomController::class, 'store'])->name('classrooms.store');
        // Ver una clase (Vista Maestro)
        Route::get('/classrooms/{classroom}', [ClassroomController::class, 'show'])->name('classrooms.show');
        // 👆 --------------------------------- 👆

        // Eliminar clase
        Route::delete('/classrooms/{classroom}', [ClassroomController::class, 'destroy'])->name('classrooms.destroy');

        // Guardar actividad nueva (.h5p)
        Route::post('/classrooms/{classroom}/activities', [ClassroomController::class, 'storeActivity'])->name('activities.store');
        
        // Ruta para generar Sopa de Letras (NUEVA)
        Route::post('/classrooms/{classroom}/wordsearch', [ClassroomController::class, 'storeWordSearch'])->name('activities.wordsearch');
        
        // Ruta para generar Sopa de Letras
        Route::post('/classrooms/{classroom}/wordsearch', [ClassroomController::class, 'storeWordSearch'])->name('activities.wordsearch');
        
        // Ruta para generar Crucigramas (NUEVA)
        Route::post('/classrooms/{classroom}/crossword', [ClassroomController::class, 'storeCrossword'])->name('activities.crossword');
        // Ruta para generar Drag the Words (NUEVA)
        Route::post('/classrooms/{classroom}/dragwords', [ClassroomController::class, 'storeDragWords'])->name('activities.dragwords');
        // Ruta para generar Fill in the Blanks (NUEVA)
        Route::post('/classrooms/{classroom}/blanks', [ClassroomController::class, 'storeBlanks'])->name('activities.blanks');
        // Jugar actividad (Modo Vista Previa)
        Route::get('/classrooms/{classroom}/activities/{activity}', [ClassroomController::class, 'play'])->name('activities.play');

        // Ver calificaciones (Gradebook)
        Route::get('/classrooms/{classroom}/grades', [ClassroomController::class, 'grades'])->name('classrooms.grades');
        
        // Borrar actividad
        Route::delete('/activities/{activity}', [ClassroomController::class, 'destroyActivity'])->name('activities.destroy');
        // Ruta para eliminar a un alumno de la clase
        Route::delete('/classrooms/{classroom}/students/{student}', [ClassroomController::class, 'removeStudent'])->name('classrooms.students.destroy');
    });


    // ==========================================
    // 👨‍🎓 RUTAS PARA ESTUDIANTES (Student)
    // ==========================================
    Route::middleware('verified')->prefix('student')->name('student.')->group(function () {
        
        // Dashboard del alumno
        Route::get('/dashboard', [StudentController::class, 'index'])->name('dashboard');
        
        // Formulario "Unirse a clase"
        Route::post('/join', [StudentController::class, 'join'])->name('join');
        
        // Ver una clase (Vista Alumno)
        Route::get('/classrooms/{classroom}', [StudentController::class, 'show'])->name('classrooms.show');
        
        // Jugar actividad (Modo Evaluación)
        Route::get('/classrooms/{classroom}/activities/{activity}', [StudentController::class, 'play'])->name('activities.play');
        
        // Guardar calificación (Invisible)
        Route::post('/classrooms/{classroom}/activities/{activity}/grade', [StudentController::class, 'storeGrade'])->name('grades.store');
    });
    // ==========================================
    // RUTAS EXCLUSIVAS DEL ADMINISTRADOR
    // ==========================================
    Route::middleware(['auth', \App\Http\Middleware\IsAdmin::class])->prefix('admin')->group(function () {
        // Panel para ver solicitudes pendientes
        Route::get('/approvals', [\App\Http\Controllers\ApprovalController::class, 'index'])->name('admin.approvals');
    
        // Ruta para aprobar y asignar rol
        Route::patch('/approvals/{user}', [\App\Http\Controllers\ApprovalController::class, 'approve'])->name('admin.approve');
    });


    // ==========================================
    // ⚙️ RUTAS DE PERFIL (Profile)
    // ==========================================
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';