import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Approvals({ auth, pendingUsers }) {

    // Función para aprobar y asignar el rol
    const handleApprove = (user, roleName) => {
        const roleLabel = roleName === 'teacher' ? 'MAESTRO' : 'ALUMNO';

        if (confirm(`¿Estás seguro de aprobar a ${user.name} y darle el rol de ${roleLabel}? Se le enviará un correo automáticamente.`)) {
            router.patch(route('admin.approve', user.id), {
                role: roleName
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">🛡️ Panel de Administración - Solicitudes</h2>}
        >
            <Head title="Aprobaciones Pendientes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border-t-4 border-indigo-600">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                                Usuarios en lista de espera
                                <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
                                    {pendingUsers.length} pendientes
                                </span>
                            </h3>

                            {pendingUsers.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <p className="text-gray-500 font-medium">No hay solicitudes pendientes.</p>
                                    <p className="text-sm text-gray-400">Todos los usuarios han sido revisados.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                                        <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-4 text-gray-500 font-bold">Expediente</th>
                                                <th scope="col" className="px-6 py-4 text-gray-500 font-bold">Nombre</th>
                                                <th scope="col" className="px-6 py-4 text-gray-500 font-bold">Email</th>
                                                <th scope="col" className="px-6 py-4 text-gray-500 font-bold text-center">Acciones (Asignar Rol)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingUsers.map((user) => (
                                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{user.expediente}</td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                                    <td className="px-6 py-4 flex justify-center gap-3">

                                                        {/* Botón: Aprobar como Alumno */}
                                                        <button
                                                            onClick={() => handleApprove(user, 'student')}
                                                            className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-md font-bold text-xs transition border border-green-200 shadow-sm"
                                                        >
                                                            🎓 Aprobar Alumno
                                                        </button>

                                                        {/* Botón: Aprobar como Maestro */}
                                                        <button
                                                            onClick={() => handleApprove(user, 'teacher')}
                                                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-md font-bold text-xs transition border border-blue-200 shadow-sm"
                                                        >
                                                            🍎 Aprobar Maestro
                                                        </button>

                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}