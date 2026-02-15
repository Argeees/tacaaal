import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function TeacherShow({ auth, classroom, activities }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        h5p_file: null,
    });

    const submitActivity = (e) => {
        e.preventDefault();
        post(route('teacher.activities.store', classroom.id), {
            onSuccess: () => reset(),
            forceFormData: true, // ¡CRUCIAL para subir archivos!
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
                        {/* 1. BOTÓN NUEVO: IR A CALIFICACIONES */}
                        <Link
                            href={route('teacher.classrooms.grades', classroom.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
                        >
                            📊 Ver Calificaciones
                        </Link>

                        {/* 2. CÓDIGO DE LA CLASE */}
                        <span className="text-sm bg-indigo-100 text-indigo-800 py-2 px-3 rounded-full font-mono border border-indigo-200">
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
                    <Link href={route('teacher.dashboard')} className="text-gray-500 hover:text-gray-700 mb-4 inline-block">
                        &larr; Volver al tablero
                    </Link>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* COLUMNA IZQUIERDA: Lista de Actividades (span-2 para que sea ancha) */}
                        <div className="md:col-span-2">

                            {/* Formulario de Subida Rápida */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full mb-6">
                                <h4 className="font-bold text-gray-700 mb-2">Subir Nueva Actividad</h4>
                                <form onSubmit={submitActivity} className="flex flex-col gap-3">
                                    {/* 1. Título */}
                                    <input
                                        type="text"
                                        placeholder="Título (ej: Sopa de Letras)"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="rounded border-gray-300 px-3 py-1 text-sm w-full"
                                    />
                                    {errors.title && <div className="text-red-500 text-xs">{errors.title}</div>}

                                    {/* 2. Archivo H5P */}
                                    <input
                                        type="file"
                                        accept=".h5p,.zip"
                                        onChange={e => setData('h5p_file', e.target.files[0])}
                                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    {errors.h5p_file && <div className="text-red-500 text-xs">{errors.h5p_file}</div>}

                                    {/* 3. Botón Guardar */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 text-sm font-bold transition"
                                        >
                                            {processing ? 'Subiendo...' : 'Subir H5P'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* LISTA REAL DE ACTIVIDADES */}
                            <div className="space-y-4">
                                {activities.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                                        <p className="text-gray-500">No hay ejercicios todavía.</p>
                                        <p className="text-sm text-gray-400">Sube un archivo .h5p para empezar.</p>
                                    </div>
                                ) : (
                                    activities.map((activity) => (
                                        <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 font-bold text-xl">
                                                    🧩
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-800">{activity.title}</h4>
                                                    <div className="flex gap-2 text-xs text-gray-500">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded uppercase">
                                                            {activity.h5p_type || 'H5P'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {/* Botón Jugar (Vista Previa) */}
                                                <Link
                                                    href={route('teacher.activities.play', [classroom.id, activity.id])}
                                                    className="bg-indigo-600 text-white px-3 py-2 rounded font-bold text-sm hover:bg-indigo-700 shadow transition flex items-center"
                                                    title="Probar actividad"
                                                >
                                                    ▶
                                                </Link>

                                                {/* --- BOTÓN NUEVO: ELIMINAR 🗑️ --- */}
                                                <button
                                                    onClick={() => {
                                                        if (confirm('¿Estás seguro de eliminar esta actividad? Se borrarán también las calificaciones.')) {
                                                            router.delete(route('teacher.activities.destroy', activity.id));
                                                        }
                                                    }}
                                                    className="bg-red-100 text-red-600 px-3 py-2 rounded font-bold text-sm hover:bg-red-200 transition border border-red-200 flex items-center justify-center"
                                                    title="Eliminar actividad permanentemente"
                                                >
                                                    🗑️
                                                </button>
                                                {/* ------------------------------- */}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Lista de Alumnos */}
                        <div className="md:col-span-1">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-bold mb-4">Alumnos Inscritos</h3>
                                <p className="text-gray-500 text-sm">Comparte el código <strong>{classroom.access_code}</strong> para que tus alumnos se unan.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}