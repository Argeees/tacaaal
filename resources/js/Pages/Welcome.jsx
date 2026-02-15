import { Link, Head } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Bienvenido a TECAAL" />

            <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">

                {/* --- 1. ENCABEZADO (HEADER) --- */}
                <header className="bg-white shadow-sm py-4">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <ApplicationLogo className="h-16 w-auto" />
                        </div>

                        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                            <a href="#" className="hover:text-brand-600">Inicio</a>
                            <a href="#" className="hover:text-brand-600">Catálogo de Idiomas</a>
                            <a href="#" className="hover:text-brand-600">Recursos</a>
                        </nav>

                        <div>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-dark-600 text-white px-5 py-2 rounded font-bold hover:bg-dark-700 transition"
                                >
                                    Ir a mi Panel
                                </Link>
                            ) : (
                                <div className="flex gap-4">
                                    <Link
                                        href={route('login')}
                                        className="bg-dark-600 text-white px-5 py-2 rounded font-bold hover:bg-dark-700 transition"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="text-gray-600 px-5 py-2 rounded font-bold border border-gray-300 hover:bg-gray-100 transition"
                                    >
                                        Registrarse
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* --- 2. HÉROE (HERO SECTION) --- */}
                <section className="bg-white py-16 lg:py-24">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">

                        {/* Texto Izquierda */}
                        <div className="lg:w-1/2 space-y-6">
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-dark-600 leading-tight">
                                Centro de Autoaprendizaje de Lenguas <span className="text-brand-500">TECAAL</span>
                            </h1>
                            <p className="text-lg text-gray-600">
                                Plataforma oficial de la UAQ para practicar, aprender y certificarte en nuevos idiomas a tu propio ritmo.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <Link
                                    href={route('login')}
                                    className="bg-brand-500 text-dark-700 px-8 py-3 rounded font-bold text-lg shadow-lg hover:bg-brand-400 transition"
                                >
                                    Explorar Cursos
                                </Link>
                                <button className="px-8 py-3 rounded font-bold text-lg border-2 border-brand-500 text-dark-600 hover:bg-brand-50 transition">
                                    Saber más
                                </button>
                            </div>
                        </div>

                        {/* Imagen Derecha (Gris placeholder o imagen real) */}
                        <div className="lg:w-1/2 w-full">
                            <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
                                {/* Puedes poner aquí una imagen real con <img> */}
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                                    alt="Estudiantes UAQ"
                                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 3. IDIOMAS (CARDS) --- */}
                <section className="bg-gray-50 py-16">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <h2 className="text-center text-3xl font-bold text-dark-600 mb-12">Idiomas Disponibles</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1: Inglés */}
                            <LanguageCard title="Inglés" level="Niveles A1 - C1" flag="🇬🇧" />
                            {/* Card 2: Francés */}
                            <LanguageCard title="Francés" level="Niveles A1 - B2" flag="🇫🇷" />
                            {/* Card 3: Italiano */}
                            <LanguageCard title="Italiano" level="Niveles A1 - B2" flag="🇮🇹" />
                            {/* Card 4: Alemán */}
                            <LanguageCard title="Alemán" level="Niveles A1 - B1" flag="🇩🇪" />
                        </div>
                    </div>
                </section>

                {/* --- 4. FOOTER AMARILLO (COMUNIDAD) --- */}
                <section className="bg-brand-500 py-16 text-center">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-dark-700 mb-8">Comunidad TECAAL</h2>
                        <div className="flex justify-center gap-12">
                            <StatItem icon="🏆" label="Top Estudiantes" />
                            <StatItem icon="📚" label="+500 Recursos" />
                            <StatItem icon="🎓" label="Certificaciones" />
                        </div>
                    </div>
                </section>

                {/* --- 5. FOOTER FINAL --- */}
                <footer className="bg-dark-600 py-8 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Universidad Autónoma de Querétaro - Facultad de Lenguas y Letras</p>
                </footer>

            </div>
        </>
    );
}

// Componentes auxiliares para no repetir código
function LanguageCard({ title, level, flag }) {
    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-brand-400 transition cursor-pointer group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{flag}</div>
            <h3 className="text-xl font-bold text-dark-600 mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{level}</p>
        </div>
    );
}

function StatItem({ icon, label }) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 backdrop-blur-sm">
                {icon}
            </div>
            <span className="font-bold text-dark-700">{label}</span>
        </div>
    );
}