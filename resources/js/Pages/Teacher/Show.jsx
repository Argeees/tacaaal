import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function TeacherShow({ auth, classroom, activities }) {

    // --- ESTADO PARA LAS PESTAÑAS ---
    const [creationMode, setCreationMode] = useState('upload'); // Puede ser 'upload' o 'wordsearch'

    // --- FORMULARIO 1: SUBIR ARCHIVO .H5P ---
    const { data: uploadData, setData: setUploadData, post: postUpload, processing: procUpload, reset: resetUpload, errors: errUpload } = useForm({
        title: '',
        h5p_file: null,
    });

    // --- FORMULARIO 2: CREAR SOPA DE LETRAS ---
    const { data: wsData, setData: setWsData, post: postWs, processing: procWs, reset: resetWs, errors: errWs } = useForm({
        title: '',
        words: '',
    });
    // --- FORMULARIO 3: CREAR CRUCIGRAMA ---
    const { data: cwData, setData: setCwData, post: postCw, processing: procCw, reset: resetCw, errors: errCw } = useForm({
        title: '',
        words: '',
    });

    const submitCrossword = (e) => {
        e.preventDefault();
        postCw(route('teacher.activities.crossword', classroom.id), {
            onSuccess: () => {
                resetCw();
                setCreationMode('upload');
            },
        });
    };
    // --- FORMULARIO 4: DRAG THE WORDS ---
    const { data: dwData, setData: setDwData, post: postDw, processing: procDw, reset: resetDw, errors: errDw } = useForm({
        title: '',
        text: '',
    });

    const submitDragWords = (e) => {
        e.preventDefault();
        postDw(route('teacher.activities.dragwords', classroom.id), {
            onSuccess: () => {
                resetDw();
                setCreationMode('upload');
            },
        });
    };
    // --- FORMULARIO 5: FILL THE BLANKS ---
    const { data: fbData, setData: setFbData, post: postFb, processing: procFb, reset: resetFb, errors: errFb } = useForm({
        title: '',
        text: '',
    });

    const submitBlanks = (e) => {
        e.preventDefault();
        postFb(route('teacher.activities.blanks', classroom.id), {
            onSuccess: () => {
                resetFb();
                setCreationMode('upload');
            },
        });
    };

    // Acción al subir archivo
    const submitUpload = (e) => {
        e.preventDefault();
        postUpload(route('teacher.activities.store', classroom.id), {
            onSuccess: () => resetUpload(),
            forceFormData: true,
        });
    };

    // Acción al generar Sopa de Letras
    const submitWordSearch = (e) => {
        e.preventDefault();
        postWs(route('teacher.activities.wordsearch', classroom.id), {
            onSuccess: () => {
                resetWs();
                setCreationMode('upload');
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Clase: {classroom.name}
                    </h2>

                    {/* --- ZONA DE ACCIONES (HEADER) --- */}
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('teacher.classrooms.grades', classroom.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
                        >
                            📊 Ver Calificaciones
                        </Link>

                        <span className="text-sm bg-brand-100 text-brand-800 py-2 px-3 rounded-full font-mono border border-brand-200">
                            Código: {classroom.access_code}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title={classroom.name} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Botón para regresar */}
                    <Link href={route('teacher.classrooms.index')} className="text-gray-500 hover:text-gray-700 mb-4 inline-block font-medium">
                        &larr; Volver al tablero
                    </Link>

                    {/* ======================================================== */}
                    {/* SECCIÓN NUEVA: TAREAS CON ENLACE O ARCHIVO */}
                    {/* ======================================================== */}
                    <div className="mb-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                Tareas y Entregas Externas
                            </h2>
                        </div>

                        {/* Formulario rápido para crear tareas (Solo Maestros) */}
                        {(auth.user.role === 'teacher' || auth.user.role === 'admin') && (
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                                <h3 className="font-bold text-indigo-900 mb-3 text-sm">➕ Publicar Nueva Tarea (Para recibir Links o Archivos)</h3>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    router.post(route('teacher.assignments.store', classroom.id), {
                                        title: formData.get('title'),
                                        instructions: formData.get('instructions'),
                                        due_date: formData.get('due_date')
                                    }, {
                                        preserveScroll: true,
                                        onSuccess: () => e.target.reset()
                                    });
                                }} className="flex flex-col md:flex-row gap-3 items-start">
                                    <input type="text" name="title" required placeholder="Título (Ej. Ensayo en PDF)" className="border-gray-300 rounded-md text-sm md:w-1/3" />
                                    <textarea name="instructions" required placeholder="Instrucciones detalladas..." className="border-gray-300 rounded-md text-sm md:w-2/3 h-10 resize-none"></textarea>
                                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md text-sm transition shrink-0 whitespace-nowrap">
                                        Publicar Tarea
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Lista de Tareas y Panel de Calificación Inline */}
                        {classroom.assignments?.length === 0 ? (
                            <p className="text-gray-500 text-sm italic text-center bg-gray-50 py-4 rounded-md border border-dashed border-gray-300">
                                No hay tareas asignadas todavía.
                            </p>
                        ) : (
                            <div className="space-y-6 mt-4">
                                {classroom.assignments?.map(assignment => (
                                    <div key={assignment.id} className="bg-blue-50/30 border border-blue-100 p-5 rounded-lg">
                                        <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                            📝 {assignment.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-4">{assignment.instructions}</p>

                                        <div className="mt-4 border-t border-gray-200 pt-4 bg-white rounded-md p-4 shadow-sm">
                                            <h5 className="font-bold text-sm text-gray-700 mb-3">
                                                Entregas de los alumnos ({assignment.submissions?.length || 0})
                                            </h5>

                                            {!assignment.submissions || assignment.submissions.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic">Nadie ha entregado esta tarea aún.</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left text-gray-500">
                                                        <thead className="text-xs text-gray-400 uppercase border-b">
                                                            <tr>
                                                                <th className="pb-2 font-medium">Alumno</th>
                                                                <th className="pb-2 font-medium">Entregable</th>
                                                                <th className="pb-2 font-medium text-right pr-4">Calificación (0-10)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {assignment.submissions.map(sub => (
                                                                <tr key={sub.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                                    <td className="py-3 font-medium text-gray-900">{sub.user?.name || 'Alumno'}</td>
                                                                    <td className="py-3">
                                                                        {/* 👇 LÓGICA DE ARCHIVOS VS ENLACES 👇 */}
                                                                        {sub.file_path ? (
                                                                            <a
                                                                                href={`/storage/${sub.file_path}`}
                                                                                target="_blank"
                                                                                download
                                                                                className="text-indigo-600 hover:text-indigo-900 font-bold flex items-center gap-1"
                                                                            >
                                                                                📄 Descargar Archivo
                                                                            </a>
                                                                        ) : sub.link_url ? (
                                                                            <a
                                                                                href={sub.link_url}
                                                                                target="_blank"
                                                                                className="text-blue-600 hover:text-blue-900 font-bold flex items-center gap-1"
                                                                            >
                                                                                🔗 Abrir Enlace
                                                                            </a>
                                                                        ) : (
                                                                            <span className="text-gray-400 italic">Sin archivo</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-3 text-right pr-2">
                                                                        <form onSubmit={(e) => {
                                                                            e.preventDefault();
                                                                            router.patch(route('submissions.grade', sub.id), {
                                                                                grade: e.target.grade.value
                                                                            }, { preserveScroll: true });
                                                                        }} className="flex justify-end gap-2 items-center">
                                                                            <input
                                                                                type="number"
                                                                                name="grade"
                                                                                defaultValue={sub.grade}
                                                                                min="0" max="10" step="0.1"
                                                                                className="w-20 border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-indigo-500 focus:border-indigo-500"
                                                                            />
                                                                            <button type="submit" className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-300 transition font-bold">
                                                                                Guardar
                                                                            </button>
                                                                        </form>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* ======================================================== */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* COLUMNA IZQUIERDA: Formularios y Lista de Actividades H5P */}
                        <div className="md:col-span-2">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Actividades Interactivas </h2>

                            {/* ========================================== */}
                            {/* 🛠️ PANEL DE CREACIÓN MULTI-OPCIÓN          */}
                            {/* ========================================== */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-brand-500 mb-6">

                                {/* Pestañas */}
                                <div className="flex gap-6 border-b border-gray-200 mb-5 overflow-x-auto">
                                    <button
                                        onClick={() => setCreationMode('upload')}
                                        className={`pb-3 font-bold text-sm transition-colors whitespace-nowrap ${creationMode === 'upload' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-700'}`}
                                    >
                                        Subir Archivo .h5p
                                    </button>
                                    <button
                                        onClick={() => setCreationMode('wordsearch')}
                                        className={`pb-3 font-bold text-sm transition-colors whitespace-nowrap ${creationMode === 'wordsearch' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-700'}`}
                                    >
                                        Crear Sopa de Letras
                                    </button>
                                    <button
                                        onClick={() => setCreationMode('crossword')}
                                        className={`pb-3 font-bold text-sm transition-colors whitespace-nowrap ${creationMode === 'crossword' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-700'}`}
                                    >
                                        Crear Crucigrama
                                    </button>
                                    <button
                                        onClick={() => setCreationMode('dragwords')}
                                        className={`pb-3 font-bold text-sm transition-colors whitespace-nowrap ${creationMode === 'dragwords' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-700'}`}
                                    >
                                        Arrastrar Palabras
                                    </button>
                                    <button
                                        onClick={() => setCreationMode('blanks')}
                                        className={`pb-3 font-bold text-sm transition-colors whitespace-nowrap ${creationMode === 'blanks' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-700'}`}
                                    >
                                        Rellenar Huecos
                                    </button>
                                </div>

                                {/* PESTAÑA 1: Formulario de Subida Rápida */}
                                {creationMode === 'upload' && (
                                    <form onSubmit={submitUpload} className="flex flex-col gap-4 animate-fade-in-up">
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Título de la actividad"
                                                value={uploadData.title}
                                                onChange={e => setUploadData('title', e.target.value)}
                                                className="rounded-md border-gray-300 px-4 py-2 text-sm w-full focus:ring-brand-500 focus:border-brand-500"
                                            />
                                            {errUpload.title && <div className="text-red-500 text-xs mt-1">{errUpload.title}</div>}
                                        </div>

                                        <div>
                                            <input
                                                type="file"
                                                accept=".h5p,.zip"
                                                onChange={e => setUploadData('h5p_file', e.target.files[0])}
                                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 w-full"
                                            />
                                            {errUpload.h5p_file && <div className="text-red-500 text-xs mt-1">{errUpload.h5p_file}</div>}
                                        </div>

                                        <div className="flex justify-end">
                                            <button type="submit" disabled={procUpload} className="bg-dark-600 text-white px-6 py-2 rounded shadow hover:bg-dark-700 text-sm font-bold transition disabled:opacity-50">
                                                {procUpload ? 'Subiendo...' : 'Subir Archivo'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* PESTAÑA 2: Formulario Creador de Sopa de Letras */}
                                {creationMode === 'wordsearch' && (
                                    <form onSubmit={submitWordSearch} className="flex flex-col gap-4 animate-fade-in-up">
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Título (Ej: Animales en Inglés)"
                                                value={wsData.title}
                                                onChange={e => setWsData('title', e.target.value)}
                                                className="rounded-md border-gray-300 px-4 py-2 text-sm w-full focus:ring-brand-500 focus:border-brand-500"
                                            />
                                            {errWs.title && <div className="text-red-500 text-xs mt-1">{errWs.title}</div>}
                                        </div>

                                        <div>
                                            <textarea
                                                placeholder="Escribe las palabras separadas por comas (Ej: DOG, CAT, BIRD, FISH)"
                                                value={wsData.words}
                                                onChange={e => setWsData('words', e.target.value)}
                                                className="rounded-md border-gray-300 px-4 py-2 text-sm w-full h-24 uppercase focus:ring-brand-500 focus:border-brand-500"
                                            ></textarea>
                                            <p className="text-xs text-gray-500 mt-1">Mínimo 2 palabras. No uses acentos ni espacios dentro de la misma palabra.</p>
                                            {errWs.words && <div className="text-red-500 text-xs mt-1">{errWs.words}</div>}
                                        </div>

                                        <div className="flex justify-end">
                                            <button type="submit" disabled={procWs} className="bg-brand-500 text-dark-700 px-6 py-2 rounded shadow hover:bg-brand-400 text-sm font-bold transition disabled:opacity-50">
                                                {procWs ? 'Generando...' : ' Generar Sopa de Letras'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {/* PESTAÑA 3: Formulario Creador de Crucigrama */}
                                {creationMode === 'crossword' && (
                                    <form onSubmit={submitCrossword} className="flex flex-col gap-4 animate-fade-in-up">
                                        <div>
                                            <input type="text" placeholder="Título (Ej: Conceptos de Biología)" value={cwData.title} onChange={e => setCwData('title', e.target.value)} className="rounded-md border-gray-300 px-4 py-2 text-sm w-full focus:ring-brand-500 focus:border-brand-500" />
                                            {errCw.title && <div className="text-red-500 text-xs mt-1">{errCw.title}</div>}
                                        </div>
                                        <div>
                                            <textarea
                                                placeholder="Escribe PALABRA: Pista.&#10;Ejemplo:&#10;GATO: Animal que caza ratones.&#10;PERRO: El mejor amigo del hombre."
                                                value={cwData.words}
                                                onChange={e => setCwData('words', e.target.value)}
                                                className="rounded-md border-gray-300 px-4 py-2 text-sm w-full h-32 focus:ring-brand-500 focus:border-brand-500"
                                            ></textarea>
                                            <p className="text-xs text-gray-500 mt-1">Escribe la respuesta, pon dos puntos (:) y luego la pista. Una palabra por línea.</p>
                                            {errCw.words && <div className="text-red-500 text-xs mt-1">{errCw.words}</div>}
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="submit" disabled={procCw} className="bg-brand-500 text-dark-700 px-6 py-2 rounded shadow hover:bg-brand-400 text-sm font-bold transition disabled:opacity-50">
                                                {procCw ? 'Calculando cuadricula...' : ' Generar Crucigrama'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {/* PESTAÑA 4: Formulario Creador de Drag the Words */}
                                {creationMode === 'dragwords' && (
                                    <form onSubmit={submitDragWords} className="flex flex-col gap-4 animate-fade-in-up">
                                        <div>
                                            <input type="text" placeholder="Título (Ej: Completar Oraciones)" value={dwData.title} onChange={e => setDwData('title', e.target.value)} className="rounded-md border-gray-300 px-4 py-2 text-sm w-full focus:ring-brand-500 focus:border-brand-500" />
                                            {errDw.title && <div className="text-red-500 text-xs mt-1">{errDw.title}</div>}
                                        </div>
                                        <div>
                                            <textarea
                                                placeholder="Escribe tu texto y pon las palabras a arrastrar entre asteriscos (*).&#10;Ejemplo:&#10;El *perro* es el mejor amigo del *hombre*."
                                                value={dwData.text}
                                                onChange={e => setDwData('text', e.target.value)}
                                                className="rounded-md border-gray-300 px-4 py-2 text-sm w-full h-32 focus:ring-brand-500 focus:border-brand-500"
                                            ></textarea>
                                            <p className="text-xs text-gray-500 mt-1">Usa asteriscos para marcar las palabras ocultas. Las palabras se revolverán automáticamente.</p>
                                            {errDw.text && <div className="text-red-500 text-xs mt-1">{errDw.text}</div>}
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="submit" disabled={procDw} className="bg-brand-500 text-dark-700 px-6 py-2 rounded shadow hover:bg-brand-400 text-sm font-bold transition disabled:opacity-50">
                                                {procDw ? 'Generando...' : ' Generar Actividad'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {/* PESTAÑA 5: Formulario Creador de Fill the Blanks */}
                                {creationMode === 'blanks' && (
                                    <form onSubmit={submitBlanks} className="flex flex-col gap-4 animate-fade-in-up">
                                        <div>
                                            <input type="text" placeholder="Título (Ej: Completar Oraciones Históricas)" value={fbData.title} onChange={e => setFbData('title', e.target.value)} className="rounded-md border-gray-300 px-4 py-2 text-sm w-full focus:ring-brand-500 focus:border-brand-500" />
                                            {errFb.title && <div className="text-red-500 text-xs mt-1">{errFb.title}</div>}
                                        </div>
                                        <div>
                                            <textarea
                                                placeholder="Escribe tu texto y pon las palabras ocultas entre asteriscos (*).&#10;Ejemplo:&#10;La capital de Francia es *París* y la de España es *Madrid*."
                                                value={fbData.text}
                                                onChange={e => setFbData('text', e.target.value)}
                                                className="rounded-md border-gray-300 px-4 py-2 text-sm w-full h-32 focus:ring-brand-500 focus:border-brand-500"
                                            ></textarea>
                                            <p className="text-xs text-gray-500 mt-1">Usa asteriscos para crear los huecos que el alumno deberá escribir con su teclado.</p>
                                            {errFb.text && <div className="text-red-500 text-xs mt-1">{errFb.text}</div>}
                                        </div>
                                        <div className="flex justify-end">
                                            <button type="submit" disabled={procFb} className="bg-brand-500 text-dark-700 px-6 py-2 rounded shadow hover:bg-brand-400 text-sm font-bold transition disabled:opacity-50">
                                                {procFb ? 'Generando...' : '📝 Generar Actividad'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                            {/* ========================================== */}

                            {/* LISTA REAL DE ACTIVIDADES H5P */}
                            <div className="space-y-4">
                                {activities.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                                        <p className="text-gray-500">No hay ejercicios interactivos todavía.</p>
                                        <p className="text-sm text-gray-400">Usa el panel de arriba para crear o subir uno.</p>
                                    </div>
                                ) : (
                                    activities.map((activity) => (
                                        <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-brand-100 p-3 rounded-full text-brand-600 font-bold text-xl">
                                                    🧩
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-800">{activity.title}</h4>
                                                    <div className="flex gap-2 text-xs text-gray-500">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded uppercase font-medium">
                                                            {activity.h5p_type || 'H5P'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {/* Botón Jugar (Vista Previa) */}
                                                <Link
                                                    href={route('teacher.activities.play', [classroom.id, activity.id])}
                                                    className="bg-dark-600 text-white px-3 py-2 rounded font-bold text-sm hover:bg-dark-700 shadow transition flex items-center"
                                                    title="Probar actividad"
                                                >
                                                    ▶
                                                </Link>

                                                {/* Botón Eliminar 🗑️ */}
                                                <button
                                                    onClick={() => {
                                                        if (confirm('¿Estás seguro de eliminar esta actividad? Se borrarán también las calificaciones.')) {
                                                            router.delete(route('teacher.activities.destroy', activity.id));
                                                        }
                                                    }}
                                                    className="bg-red-50 text-red-600 px-3 py-2 rounded font-bold text-sm hover:bg-red-100 transition border border-red-100 flex items-center justify-center"
                                                    title="Eliminar actividad permanentemente"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Lista de Alumnos */}
                        <div className="md:col-span-1">
                            <div className="bg-white shadow-sm sm:rounded-xl p-6 border-t-4 border-dark-500 sticky top-6">
                                <h3 className="text-lg font-bold mb-2 text-dark-700 flex items-center justify-between">
                                    <span>👥 Alumnos Inscritos</span>
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                        {classroom.students ? classroom.students.length : 0}
                                    </span>
                                </h3>

                                <p className="text-gray-500 text-sm mb-4 pb-4 border-b border-gray-100">
                                    Código de clase: <strong className="text-brand-600 bg-brand-50 px-2 py-1 rounded select-all">{classroom.access_code}</strong>
                                </p>

                                {/* --- LISTA DINÁMICA DE ALUMNOS --- */}
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {!classroom.students || classroom.students.length === 0 ? (
                                        <div className="text-center py-6 text-gray-400 italic text-sm">
                                            Aún no hay alumnos unidos a esta clase.
                                        </div>
                                    ) : (
                                        classroom.students.map(student => (
                                            <div key={student.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="bg-indigo-100 text-indigo-700 rounded-full min-w-[32px] h-8 flex items-center justify-center font-bold text-sm">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{student.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            <span className="font-bold text-indigo-600">Exp: {student.expediente || 'S/N'}</span> • {student.email}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Botón de Expulsar */}
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`¿Estás seguro de eliminar a ${student.name} de la clase? Perderá el acceso a las actividades.`)) {
                                                            router.delete(route('teacher.classrooms.students.destroy', [classroom.id, student.id]));
                                                        }
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition flex-shrink-0"
                                                    title="Eliminar alumno"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {/* --------------------------------- */}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}