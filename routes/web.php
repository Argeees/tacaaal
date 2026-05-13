<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\StudentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth; 
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

// --- DASHBOARD INTELIGENTE (SEMÁFORO)  ---
Route::get('/dashboard', function () {
    $user = Auth::user();

    if ($user->role === 'teacher') {
        return redirect()->route('teacher.classrooms.index');
    }

    return redirect()->route('student.dashboard');

})->middleware(['auth', 'verified'])->name('dashboard');


// --- GRUPO DE RUTAS PROTEGIDAS (Requiere Login) ---
Route::middleware('auth')->group(function () {

    // ==========================================
    // RUTAS PARA MAESTROS (Teacher)
    // ==========================================
    Route::middleware(['auth', \App\Http\Middleware\IsTeacher::class])->prefix('teacher')->name('teacher.')->group(function () {        
        
        Route::get('/classrooms', [ClassroomController::class, 'index'])->name('classrooms.index');
        Route::post('/classrooms', [ClassroomController::class, 'store'])->name('classrooms.store');
        Route::get('/classrooms/{classroom}', [ClassroomController::class, 'show'])->name('classrooms.show');
        Route::delete('/classrooms/{classroom}', [ClassroomController::class, 'destroy'])->name('classrooms.destroy');

        Route::post('/classrooms/{classroom}/activities', [ClassroomController::class, 'storeActivity'])->name('activities.store');
        Route::post('/classrooms/{classroom}/wordsearch', [ClassroomController::class, 'storeWordSearch'])->name('activities.wordsearch');
        Route::post('/classrooms/{classroom}/crossword', [ClassroomController::class, 'storeCrossword'])->name('activities.crossword');
        Route::post('/classrooms/{classroom}/dragwords', [ClassroomController::class, 'storeDragWords'])->name('activities.dragwords');
        Route::post('/classrooms/{classroom}/blanks', [ClassroomController::class, 'storeBlanks'])->name('activities.blanks');
        
        Route::get('/classrooms/{classroom}/activities/{activity}', [ClassroomController::class, 'play'])->name('activities.play');
        Route::get('/classrooms/{classroom}/grades', [ClassroomController::class, 'grades'])->name('classrooms.grades');
        Route::delete('/activities/{activity}', [ClassroomController::class, 'destroyActivity'])->name('activities.destroy');
        Route::delete('/classrooms/{classroom}/students/{student}', [ClassroomController::class, 'removeStudent'])->name('classrooms.students.destroy');
        
        Route::post('/classrooms/{classroom}/assignments', [\App\Http\Controllers\AssignmentController::class, 'store'])->name('assignments.store');
        Route::post('/classrooms/{classroom}/announcements', [ClassroomController::class, 'storeAnnouncement'])->name('announcements.store');
        Route::delete('/announcements/{announcement}', [ClassroomController::class, 'destroyAnnouncement'])->name('announcements.destroy');
    });

    // ==========================================
    // RUTAS PARA ESTUDIANTES (Student)
    // ==========================================
    Route::middleware('verified')->prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', [StudentController::class, 'index'])->name('dashboard');
        Route::post('/join', [StudentController::class, 'join'])->name('join');
        Route::get('/classrooms/{classroom}', [StudentController::class, 'show'])->name('classrooms.show');
        Route::get('/classrooms/{classroom}/activities/{activity}', [StudentController::class, 'play'])->name('activities.play');
        Route::post('/classrooms/{classroom}/activities/{activity}/grade', [StudentController::class, 'storeGrade'])->name('grades.store');
    });

    // ==========================================
    // RUTAS COMPARTIDAS (Sin prefijo de nombre)
    // ==========================================
    // Alumno entrega su enlace
    Route::post('/assignments/{assignment}/submit', [\App\Http\Controllers\AssignmentController::class, 'submitLink'])->name('assignments.submit');
    // Maestro califica una entrega
    Route::patch('/submissions/{submission}/grade', [\App\Http\Controllers\AssignmentController::class, 'grade'])->name('submissions.grade');


    // ==========================================
    // RUTAS EXCLUSIVAS DEL ADMINISTRADOR
    // ==========================================
    Route::middleware(['auth', \App\Http\Middleware\IsAdmin::class])->prefix('admin')->group(function () {
        Route::get('/approvals', [\App\Http\Controllers\ApprovalController::class, 'index'])->name('admin.approvals');
        Route::patch('/approvals/{user}', [\App\Http\Controllers\ApprovalController::class, 'approve'])->name('admin.approve');
        
        // ☢️ Botón Nuclear de Limpieza (Apunta a ApprovalController)
        Route::delete('/wipe-data', [\App\Http\Controllers\ApprovalController::class, 'wipeData'])->name('admin.wipe-data');
    });


    // ==========================================
    //  RUTAS DE PERFIL (Profile)
    // ==========================================
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';