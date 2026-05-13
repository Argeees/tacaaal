import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import AssignmentCard from '@/Components/AssignmentCard';

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

                    {/* ======================================================== */}
                    {/* ZONA DE ANUNCIOS (VISTA ALUMNO) */}
                    {/* ======================================================== */}
                    <div className="mb-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
                            📢 Tablero de Anuncios
                        </h2>

                        <div className="space-y-4">
                            {!classroom.announcements || classroom.announcements.length === 0 ? (
                                <p className="text-gray-500 text-sm italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">El profesor no ha publicado anuncios.</p>
                            ) : (
                                classroom.announcements.map(announcement => (
                                    <div key={announcement.id} className="bg-white border-l-4 border-l-yellow-400 border-y border-r border-gray-200 p-5 rounded-r-lg shadow-sm">
                                        <p className="text-gray-800 whitespace-pre-wrap mb-4">{announcement.content}</p>

                                        <div className="flex flex-wrap gap-4">
                                            {announcement.file_path && (
                                                <a href={`/storage/${announcement.file_path}`} target="_blank" download className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
                                                    📄 Descargar Archivo Adjunto
                                                </a>
                                            )}
                                            {announcement.link_url && (
                                                <a href={announcement.link_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
                                                    🔗 Abrir Enlace
                                                </a>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-400 mt-4 border-t pt-2 border-gray-100">
                                            Publicado el: {new Date(announcement.created_at).toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    {/* ======================================================== */}

                    {/* ======================================================== */}
                    {/* SECCIÓN DE TAREAS Y ENTREGAS EXTERNAS (VISTA ALUMNO) */}
                    {/* ======================================================== */}
                    <div className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                            📥 Tareas Pendientes
                        </h3>

                        {!classroom.assignments || classroom.assignments.length === 0 ? (
                            <p className="text-gray-500 text-sm italic bg-gray-50 p-4 rounded-md border border-dashed border-gray-200 text-center">
                                No tienes tareas externas pendientes en esta clase.
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {classroom.assignments.map(assignment => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* ======================================================== */}

                    {/* Título de la sección de juegos */}
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                        🧩 Actividades Interactivas
                    </h3>

                    {/* Lista de Actividades H5P */}
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
                                        <p className="text-gray-500 text-sm mb-2">
                                            Tipo: {activity.h5p_type || 'H5P Genérico'}
                                        </p>

                                        {/* 👇 AQUÍ ESTÁ EL CÓDIGO DE LA FECHA 👇 */}
                                        <div className="mb-4">
                                            {activity.due_date ? (
                                                <div className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold border border-red-100">
                                                    ⏳ Vence: {new Date(activity.due_date).toLocaleString('es-MX', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-bold border border-green-100">
                                                    ♾️ Sin límite de tiempo
                                                </div>
                                            )}
                                        </div>
                                        {/* 👆 FIN DEL CÓDIGO DE LA FECHA 👆 */}

                                        {/* --- ZONA DE CALIFICACIÓN --- */}
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

                                        {/* --- BOTÓN DE JUEGO (CONDICIONAL ACTUALIZADO) --- */}
                                        {activity.my_grade ? (
                                            <button
                                                disabled
                                                className="block w-full text-center bg-gray-200 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed border border-gray-300"
                                            >
                                                🔒 Actividad Completada
                                            </button>
                                        ) : activity.due_date && new Date() > new Date(activity.due_date) ? (
                                            <button
                                                disabled
                                                className="block w-full text-center bg-red-100 text-red-600 font-bold py-2 px-4 rounded cursor-not-allowed border border-red-200"
                                            >
                                                ⏳ Tiempo Agotado
                                            </button>
                                        ) : (
                                            <Link
                                                href={route('student.activities.play', [classroom.id, activity.id])}
                                                className="block w-full text-center bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition shadow-sm"
                                            >
                                                ▶ Jugar Actividad
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                                <p className="text-gray-500">El profesor aún no ha subido actividades interactivas.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}