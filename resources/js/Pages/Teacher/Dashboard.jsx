import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';

export default function TeacherDashboard({ auth, classrooms }) {
    // Hook de Inertia para manejar formularios sin recargar página
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        // IMPORTANTE: Usamos 'teacher.classrooms.store' porque agrupamos las rutas en web.php
        post(route('teacher.classrooms.store'), {
            onSuccess: () => reset(), // Limpiar el input si sale bien
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Panel del Maestro</h2>}
        >
            <Head title="Maestro" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* SECCIÓN 1: Crear Nueva Clase */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6 p-6">
                        <h3 className="text-lg font-medium mb-4">Crear Nueva Clase</h3>
                        <form onSubmit={submit} className="mt-4 space-y-4">
                            {/* Campo de Texto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nombre de la Materia
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Ej: Inglés III - Grupo A"
                                />
                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                            </div>

                            {/* Botón de envío */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 font-bold"
                                >
                                    {processing ? 'Creando...' : 'Crear Clase +'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* SECCIÓN 2: Lista de Clases */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classrooms.length > 0 ? (
                            classrooms.map((classroom) => (
                                <div key={classroom.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg border-l-4 border-indigo-500 relative group transition-all hover:shadow-md">

                                    {/* --- BOTÓN DE ELIMINAR CLASE (NUEVO) --- */}
                                    <button
                                        onClick={(e) => {
                                            // Prevenir navegación al hacer clic en borrar
                                            e.preventDefault();
                                            if (confirm(`¿PELIGRO: Vas a borrar la clase "${classroom.name}"?\n\nSe borrarán TODAS las actividades y calificaciones de los alumnos.`)) {
                                                router.delete(route('teacher.classrooms.destroy', classroom.id));
                                            }
                                        }}
                                        className="absolute top-2 right-2 text-gray-300 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition duration-200"
                                        title="Eliminar Clase permanentemente"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                    {/* -------------------------------------- */}

                                    <div className="p-6">
                                        <h4 className="text-xl font-bold text-gray-800 pr-6">{classroom.name}</h4>
                                        <div className="mt-4 p-3 bg-gray-50 rounded bg-opacity-50">
                                            <p className="text-sm text-gray-500">CÓDIGO DE ACCESO:</p>
                                            <p className="text-2xl font-mono text-indigo-600 tracking-widest select-all">
                                                {classroom.access_code}
                                            </p>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <Link
                                                href={route('teacher.classrooms.show', classroom.id)}
                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center gap-1"
                                            >
                                                Entrar a la Clase &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-10 text-gray-500">
                                No tienes clases creadas aún. ¡Crea la primera arriba!
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}