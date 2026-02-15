import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Grades({ auth, classroom, activities, students }) {

    // Función auxiliar para buscar la nota de un alumno en una actividad específica
    const getGrade = (student, activityId) => {
        // Buscamos en el array de grades del estudiante
        const grade = student.grades.find(g => g.activity_id === activityId);

        if (!grade) return <span className="text-gray-300">-</span>; // No ha jugado

        // Retornamos la nota con estilo (Verde si es perfecta, gris si no)
        const isPerfect = grade.score === grade.max_score;
        return (
            <span className={`font-bold ${isPerfect ? 'text-green-600' : 'text-gray-700'}`}>
                {grade.score}/{grade.max_score}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Libreta de Calificaciones: {classroom.name}
                    </h2>
                    <Link
                        href={route('teacher.classrooms.show', classroom.id)}
                        className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition"
                    >
                        Volver a la Clase
                    </Link>
                </div>
            }
        >
            <Head title={`Notas - ${classroom.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg overflow-x-auto">

                        {/* TABLA DE CALIFICACIONES */}
                        <table className="min-w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-gray-900 sticky left-0 bg-gray-100">
                                        Alumno
                                    </th>
                                    {/* Generamos una columna por cada actividad */}
                                    {activities.map((activity) => (
                                        <th key={activity.id} className="px-6 py-3 whitespace-nowrap">
                                            {activity.title}
                                            <div className="text-[10px] text-gray-400 font-normal normal-case">
                                                {activity.h5p_type || 'Actividad'}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white">
                                                {student.name}
                                                <div className="text-xs text-gray-400">{student.email}</div>
                                            </td>

                                            {/* Por cada alumno, recorremos las actividades para llenar las celdas */}
                                            {activities.map((activity) => (
                                                <td key={activity.id} className="px-6 py-4 text-center border-l border-gray-50">
                                                    {getGrade(student, activity.id)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={activities.length + 1} className="px-6 py-12 text-center text-gray-400">
                                            Aún no hay alumnos inscritos en esta clase.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}