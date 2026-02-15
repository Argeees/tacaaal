import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, classroom, activities }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {classroom.name} (Vista Alumno)
                    </h2>
                    <Link
                        href={route('student.dashboard')}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                        &larr; Volver a mis clases
                    </Link>
                </div>
            }
        >
            <Head title={classroom.name} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Lista de Actividades */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activities && activities.length > 0 ? (
                            activities.map((activity) => (
                                <div key={activity.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 hover:shadow-lg transition">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                                Actividad
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{activity.title}</h3>
                                        <p className="text-gray-500 text-sm mb-4">
                                            Tipo: {activity.h5p_type || 'H5P Genérico'}
                                        </p>

                                        {/* --- ZONA DE CALIFICACIÓN (NUEVO) --- */}
                                        {activity.my_grade ? (
                                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-center">
                                                <p className="text-green-800 text-sm font-bold">
                                                    ✅ Calificación: {activity.my_grade.score} / {activity.my_grade.max_score}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="mb-4 p-3 bg-gray-50 border border-gray-100 rounded-md text-center">
                                                <p className="text-gray-400 text-sm italic">
                                                    Sin calificación aún
                                                </p>
                                            </div>
                                        )}
                                        {/* ------------------------------------ */}

                                        <Link
                                            href={route('student.activities.play', [classroom.id, activity.id])}
                                            className="block w-full text-center bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition"
                                        >
                                            ▶ Jugar Actividad
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-500">El profesor aún no ha subido actividades.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}