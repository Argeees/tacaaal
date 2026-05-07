import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Grades({ auth, classroom, activities, assignments, students }) {
    // 👇 NUEVO: Estados para el buscador y el filtro de pendientes
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyPending, setShowOnlyPending] = useState(false);

    const getGrade = (student, activityId) => {
        const grade = student.grades.find(g => g.activity_id === activityId);
        if (!grade) return <span className="text-gray-300">-</span>;

        const isPerfect = grade.score === grade.max_score;
        return (
            <span className={`font-bold ${isPerfect ? 'text-green-600' : 'text-gray-700'}`}>
                {grade.score}/{grade.max_score}
            </span>
        );
    };

    const getAssignmentGrade = (student, assignmentId) => {
        const assignment = assignments.find(a => a.id === assignmentId);
        if (!assignment) return <span className="text-gray-300">-</span>;

        const submission = assignment.submissions.find(s => s.user_id === student.id);
        if (!submission) return <span className="text-gray-300">-</span>;

        if (submission.grade === null) return <span className="text-yellow-500 text-xs font-bold">Pendiente</span>;

        return (
            <span className="font-bold text-blue-600">
                {submission.grade}/10
            </span>
        );
    };

    // 👇 NUEVO: Lógica del Filtro Inteligente 👇
    const filteredStudents = students.filter(student => {
        // 1. Filtro por texto (Nombre, Email o Expediente)
        const term = searchTerm.toLowerCase();
        const exp = student.expediente ? student.expediente.toString().toLowerCase() : '';
        const matchesText =
            student.name.toLowerCase().includes(term) ||
            student.email.toLowerCase().includes(term) ||
            exp.includes(term);

        // 2. Filtro de "Pendientes"
        let hasPending = false;
        if (showOnlyPending) {
            // Revisa si le falta entregar tareas o si el maestro no le ha calificado
            const missingTasks = assignments.some(a => {
                const sub = a.submissions.find(s => s.user_id === student.id);
                return !sub || sub.grade === null;
            });
            // Revisa si le falta jugar algún H5P
            const missingH5P = activities.some(act => {
                return !student.grades.find(g => g.activity_id === act.id);
            });

            hasPending = missingTasks || missingH5P;
        }

        // El alumno se muestra si cumple el texto y (si está activo el botón) tiene pendientes
        return matchesText && (showOnlyPending ? hasPending : true);
    });

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
                        className="bg-gray-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-600 transition"
                    >
                        Volver a la Clase
                    </Link>
                </div>
            }
        >
            <Head title={`Notas - ${classroom.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* BARRA DE BÚSQUEDA Y FILTROS */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="w-full md:w-1/2">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, correo o expediente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <label className="flex items-center cursor-pointer text-sm font-medium text-gray-700 bg-gray-50 px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-100 transition">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 mr-2"
                                    checked={showOnlyPending}
                                    onChange={(e) => setShowOnlyPending(e.target.checked)}
                                />
                                Solo mostrar alumnos con pendientes
                            </label>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-gray-900 sticky left-0 bg-gray-100 border-r">
                                        Alumno
                                    </th>
                                    {assignments && assignments.map((assignment) => (
                                        <th key={`assign-${assignment.id}`} className="px-6 py-3 whitespace-nowrap bg-blue-50/50">
                                            {assignment.title}
                                            <div className="text-[10px] text-blue-400 font-normal normal-case">Tarea Externa</div>
                                        </th>
                                    ))}
                                    {activities.map((activity) => (
                                        <th key={`h5p-${activity.id}`} className="px-6 py-3 whitespace-nowrap">
                                            {activity.title}
                                            <div className="text-[10px] text-gray-400 font-normal normal-case">{activity.h5p_type || 'Actividad'}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    /* 👇 Usamos filteredStudents en lugar de students 👇 */
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white border-r">
                                                {student.name}
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {/* MOSTRAMOS EL EXPEDIENTE AQUÍ */}
                                                    <span className="font-bold text-indigo-600">Exp: {student.expediente || 'S/N'}</span> | {student.email}
                                                </div>
                                            </td>
                                            {assignments && assignments.map((assignment) => (
                                                <td key={`assign-cell-${assignment.id}`} className="px-6 py-4 text-center border-l border-gray-50 bg-blue-50/10">
                                                    {getAssignmentGrade(student, assignment.id)}
                                                </td>
                                            ))}
                                            {activities.map((activity) => (
                                                <td key={`h5p-cell-${activity.id}`} className="px-6 py-4 text-center border-l border-gray-50">
                                                    {getGrade(student, activity.id)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={(activities?.length || 0) + (assignments?.length || 0) + 1} className="px-6 py-12 text-center text-gray-400">
                                            No se encontraron alumnos con esos filtros.
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