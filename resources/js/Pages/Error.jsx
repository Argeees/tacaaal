import { Head, Link } from '@inertiajs/react';

export default function Error({ status }) {
    // Diccionario de mensajes según el error
    const title = {
        503: '503: Servicio no disponible',
        500: '500: Error del Servidor',
        404: '404: Página no encontrada',
        403: '403: Acceso Prohibido',
    }[status];

    const description = {
        503: 'Lo sentimos, estamos haciendo mantenimiento. Vuelve pronto.',
        500: '¡Ups! Algo explotó en nuestros servidores. Ya enviamos a los técnicos.',
        404: 'Parece que esta página no existe o te equivocaste de salón.',
        403: 'No tienes permiso para entrar aquí. (¿Te equivocaste de cuenta?)',
    }[status];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-700 p-4">
            <Head title={title} />

            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-lg w-full border-t-4 border-indigo-500">
                {/* Icono Grande */}
                <div className="text-6xl mb-4">
                    {status === 404 ? '🗺️' : status === 403 ? '🚫' : '🔥'}
                </div>

                <h1 className="text-3xl font-bold mb-2 text-gray-800">{title || 'Error Desconocido'}</h1>
                <p className="text-lg mb-6 text-gray-500">{description || 'Algo salió mal, pero no sabemos qué.'}</p>

                <div className="flex justify-center gap-4">
                    <Link
                        href="/"
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md font-bold hover:bg-indigo-700 transition shadow"
                    >
                        Ir al Inicio
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-bold hover:bg-gray-300 transition"
                    >
                        Volver atrás
                    </button>
                </div>
            </div>

            <div className="mt-8 text-sm text-gray-400">
                Código de error: {status}
            </div>
        </div>
    );
}