import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Dashboard({ auth, classrooms }) {
    // Usamos el hook useForm de Inertia para manejar el formulario de inscripción
    const { data, setData, post, processing, errors, reset } = useForm({
        access_code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        // Enviamos el código a la ruta que creamos en StudentController
        post(route('student.join'), {
            onSuccess: () => reset(), // Limpiar el campo si todo sale bien
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mis Clases (Alumno)</h2>}
        >
            <Head title="Dashboard Alumno" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* --- ZONA 1: UNIRSE A CLASE --- */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8 border border-gray-200">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-bold mb-2 text-indigo-700">🚀 Unirse a una nueva clase</h3>
                            <p className="text-sm text-gray-500 mb-4">Ingresa el código que te dio tu profesor.</p>

                            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                <div>
                                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                        Código de acceso (6 letras)
                                    </label>
                                    <input
                                        id="code"
                                        type="text"
                                        value={data.access_code}
                                        // Forzamos mayúsculas mientras escribe para mejor UX
                                        onChange={(e) => setData('access_code', e.target.value.toUpperCase())}
                                        className="mt-1 block w-48 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm font-mono uppercase tracking-widest"
                                        placeholder="EJ: ABX92L"
                                        maxLength={6}
                                    />
                                    {errors.access_code && <div className="text-red-500 text-sm mt-1">{errors.access_code}</div>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 font-bold shadow-md"
                                >
                                    {processing ? 'Uniéndome...' : 'Unirse a la clase'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* --- ZONA 2: LISTA DE MIS CLASES --- */}
                    <h3 className="text-xl font-bold mb-4 text-gray-700 px-2">Mis Materias Inscritas</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {classrooms.length > 0 ? (
                            classrooms.map((classroom) => (
                                <Link
                                    href={route('student.classrooms.show', classroom.id)}
                                    key={classroom.id}
                                    className="block group h-full"
                                >
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg h-full hover:shadow-xl transition-all duration-300 border-t-4 border-indigo-500 relative top-0 hover:-top-1">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition">
                                                    {classroom.name}
                                                </h3>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    Código: {classroom.access_code}
                                                </span>
                                                <span className="text-indigo-600 text-sm font-semibold group-hover:underline">
                                                    Entrar &rarr;
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-16 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                                <div className="text-gray-400 text-5xl mb-4">📚</div>
                                <h4 className="text-lg font-medium text-gray-900">Aún no tienes clases</h4>
                                <p className="text-gray-500">Ingresa un código arriba para empezar.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}