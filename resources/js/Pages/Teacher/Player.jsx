import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react'; // <--- Imports fusionados correctamente
import { useEffect, useRef } from 'react';
import { H5P } from 'h5p-standalone';

export default function Player({ auth, activity, classroom, gradeUrl }) { // <--- Agregamos 'gradeUrl' aquí
    const h5pContainer = useRef(null);

    useEffect(() => {
        const libraryPath = `/h5p/${activity.id}`;

        const options = {
            h5pJsonPath: libraryPath,
            frameJs: '/frame.bundle.js',
            frameCss: '/h5p.css',
        };

        // --- CORRECCIÓN AQUÍ ---
        // Quitamos "const h5p =" y quitamos ".init()"
        // En la versión nueva, new H5P(...) devuelve la promesa directamente.

        new H5P(h5pContainer.current, options).then(() => {

            // --- ZONA DEL ESPÍA 🕵️‍♂️ ---
            if (gradeUrl) {
                console.log('🕵️‍♂️ Modo Alumno: Espía activado');

                window.H5P.externalDispatcher.on('xAPI', function (event) {
                    const verb = event.getVerb();
                    if (verb === 'completed' || verb === 'answered' || verb === 'passed') {
                        const score = event.getScore();
                        const maxScore = event.getMaxScore();

                        if (maxScore > 0) {
                            console.log(`✅ Calificación capturada: ${score}/${maxScore}`);
                            router.post(gradeUrl, {
                                score: score,
                                max_score: maxScore
                            }, {
                                preserveScroll: true,
                                onSuccess: () => console.log('💾 Guardado')
                            });
                        }
                    }
                });
            }
        });

    }, [activity.id, gradeUrl]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Jugando: {activity.title}</h2>}
        >
            <Head title={activity.title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Barra de navegación */}
                    <div className="mb-4 flex justify-between items-center">
                        {/* TRUCO: Si existe gradeUrl, somos alumnos, volvemos al dashboard de alumno.
                            Si no, somos maestros, volvemos al panel de maestro.
                        */}
                        <Link
                            href={gradeUrl ? route('student.classrooms.show', classroom.id) : route('classrooms.show', classroom.id)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold"
                        >
                            &larr; Volver a la clase
                        </Link>

                        <span className={`text-sm px-2 py-1 rounded ${gradeUrl ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                            {gradeUrl ? 'Modo: Evaluación (Se guarda nota)' : 'Modo: Vista Previa (No guarda nota)'}
                        </span>
                    </div>

                    {/* EL CONTENEDOR DEL JUEGO */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div id="h5p-container" ref={h5pContainer}></div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}