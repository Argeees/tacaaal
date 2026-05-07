import { Link, Head } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ParticleBackground from '@/Components/ParticleBackground';


export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Bienvenido a TECAAL" />

            {/* ✨ AQUÍ INYECTAMOS EL FONDO ANIMADO ✨ */}
            <ParticleBackground />

            {/* Agregamos 'relative' para asegurar que el contenido flote sobre el canvas fixed */}
            <div className="relative min-h-screen flex flex-col font-sans text-gray-800">

                {/* --- 1. ENCABEZADO (HEADER) --- */}
                {/* Usamos bg-white/90 y backdrop-blur para un efecto cristal sutil */}
                <header className="bg-white/90 backdrop-blur-sm shadow-sm py-4 sticky top-0 z-50 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <ApplicationLogo className="h-16 w-auto" />
                        </div>

                        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                            <a href="#" className="hover:text-brand-600 transition-colors">Inicio</a>
                            <a href="#" className="hover:text-brand-600 transition-colors">Catálogo de Idiomas</a>
                            <a href="#" className="hover:text-brand-600 transition-colors">Recursos</a>
                        </nav>

                        <div>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-dark-600 text-white px-5 py-2 rounded font-bold hover:bg-dark-700 transition shadow-sm"
                                >
                                    Ir a mi Panel
                                </Link>
                            ) : (
                                <div className="flex gap-4">
                                    <Link
                                        href={route('login')}
                                        className="bg-dark-600 text-white px-5 py-2 rounded font-bold hover:bg-dark-700 transition shadow-sm"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="text-gray-600 px-5 py-2 rounded font-bold border border-gray-300 hover:bg-gray-50 transition bg-white/80"
                                    >
                                        Registrarse
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* --- 2. HÉROE (HERO SECTION) --- */}
                {/* Quitamos el bg-white fijo para dejar ver el canvas del fondo */}
                <section className="py-16 lg:py-24 relative z-10">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">

                        {/* Texto Izquierda */}
                        <div className="lg:w-1/2 space-y-6">
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-dark-600 leading-tight drop-shadow-sm">
                                Centro de Autoaprendizaje de Lenguas <span className="text-brand-500">TECAAL</span>
                            </h1>
                            <p className="text-lg text-gray-700 font-medium">
                                Plataforma oficial de la UAQ para practicar, aprender y certificarte en nuevos idiomas a tu propio ritmo.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <Link
                                    href={route('login')}
                                    className="bg-brand-500 text-dark-700 px-8 py-3 rounded font-bold text-lg shadow-lg hover:bg-brand-400 hover:-translate-y-0.5 transition-all"
                                >
                                    Explorar Cursos
                                </Link>
                                <button className="px-8 py-3 rounded font-bold text-lg border-2 border-brand-500 text-dark-600 hover:bg-white/50 backdrop-blur-sm transition">
                                    Saber más
                                </button>
                            </div>
                        </div>

                        {/* Imagen Derecha */}
                        <div className="lg:w-1/2 w-full">
                            <div className="bg-white/50 backdrop-blur-sm rounded-2xl aspect-video flex items-center justify-center border border-white shadow-xl relative overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                                    alt="Estudiantes UAQ"
                                    className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-multiply"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 3. IDIOMAS (CARDS) --- */}
                {/* Un poco de opacidad en el fondo para separar secciones sin tapar el canvas del todo */}
                <section className="bg-white/80 backdrop-blur-md py-16 border-y border-gray-100 relative z-10">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <h2 className="text-center text-3xl font-bold text-dark-600 mb-12 drop-shadow-sm">Idiomas Disponibles</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <LanguageCard title="Inglés" level="Niveles A1 - C1" flag="🇬🇧" />
                            <LanguageCard title="Francés" level="Niveles A1 - B2" flag="🇫🇷" />
                            <LanguageCard title="Italiano" level="Niveles A1 - B2" flag="🇮🇹" />
                            <LanguageCard title="Alemán" level="Niveles A1 - B1" flag="🇩🇪" />
                        </div>
                    </div>
                </section>

                {/* --- 4. FOOTER AMARILLO (COMUNIDAD) --- */}
                <section className="bg-brand-500 py-16 text-center relative z-10 shadow-inner">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-dark-700 mb-8 drop-shadow-sm">Comunidad TECAAL</h2>
                        <div className="flex justify-center gap-12 flex-wrap">
                            <StatItem icon="🏆" label="Top Estudiantes" />
                            <StatItem icon="📚" label="+500 Recursos" />
                            <StatItem icon="🎓" label="Certificaciones" />
                        </div>
                    </div>
                </section>

                {/* --- 5. FOOTER FINAL --- */}
                <footer className="bg-dark-600 py-8 text-center text-gray-400 text-sm relative z-10">
                    <p>&copy; {new Date().getFullYear()} Universidad Autónoma de Querétaro - Facultad de Lenguas y Letras</p>
                </footer>

            </div>
        </>
    );
}

// Componentes auxiliares
function LanguageCard({ title, level, flag }) {
    return (
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{flag}</div>
            <h3 className="text-xl font-bold text-dark-600 mb-2">{title}</h3>
            <p className="text-sm font-medium text-gray-500">{level}</p>
        </div>
    );
}

function StatItem({ icon, label }) {
    return (
        <div className="flex flex-col items-center group">
            <div className="bg-white/20 group-hover:bg-white/30 transition-colors w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 backdrop-blur-md shadow-sm border border-white/10">
                <span className="group-hover:scale-110 transition-transform">{icon}</span>
            </div>
            <span className="font-bold text-dark-700 tracking-wide">{label}</span>
        </div>
    );
}