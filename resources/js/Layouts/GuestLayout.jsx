import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex">

            {/* IZQUIERDA: Imagen decorativa con capa Amarilla/Gris */}
            {/* Usamos el gris oscuro de TECAAL como base */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-dark-600">
                <img
                    // Sugerencia: Una foto de la biblioteca o centro de lenguas de la UAQ
                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2074&auto=format&fit=crop"
                    alt="Centro de Aprendizaje"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
                {/* Degradado sutil amarillo sobre la imagen */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/30 to-dark-500/80 mix-blend-multiply"></div>

                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    {/* Texto grande en Amarillo y Blanco */}
                    <h1 className="text-5xl font-extrabold mb-4">
                        <span className="text-brand-500">TECAAL</span> Online
                    </h1>
                    <h2 className="text-2xl font-bold mb-4">Facultad de Lenguas y Letras - UAQ</h2>
                    <p className="text-lg text-gray-200 max-w-md leading-relaxed">
                        Tecno Centro de Autoaprendizaje de Lenguas. Tu plataforma para el dominio de idiomas.
                    </p>
                </div>
            </div>

            {/* DERECHA: Formulario de Login */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-gray-50 px-6 py-12">
                <div className="w-full max-w-md">
                    {/* El logo ahora usará los colores definidos */}
                    <div className="flex justify-center mb-10">
                        <Link href="/">
                            <ApplicationLogo className="h-40" />
                        </Link>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-brand-500">
                        {children}
                    </div>

                    {/* Pie de página con el color gris oscuro */}
                    <div className="mt-8 text-center text-sm text-dark-500 font-medium">
                        &copy; {new Date().getFullYear()} Universidad Autónoma de Querétaro.
                    </div>
                </div>
            </div>
        </div>
    );
}