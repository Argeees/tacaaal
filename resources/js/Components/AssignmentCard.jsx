import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function AssignmentCard({ assignment }) {
    // Buscamos si el alumno ya tiene una entrega registrada para esta tarea
    const mySubmission = assignment.submissions && assignment.submissions.length > 0
        ? assignment.submissions[0]
        : null;

    // 👇 NUEVO: Detectar si la tarea ya venció
    const isOverdue = assignment.due_date && new Date() > new Date(assignment.due_date);

    // 👇 NUEVO: Formatear la fecha para que se vea bonita (Ej: "15 de mayo, 23:59")
    const formattedDate = assignment.due_date
        ? new Date(assignment.due_date).toLocaleString('es-MX', {
            dateStyle: 'medium', timeStyle: 'short'
        })
        : 'Sin fecha límite';

    const [submissionType, setSubmissionType] = useState('link');

    const { data, setData, post, processing, errors } = useForm({
        link_url: '',
        file: null,
    });

    const handleStudentSubmit = (e) => {
        e.preventDefault();
        post(route('assignments.submit', assignment.id), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <div className="bg-blue-50/30 border border-blue-100 p-5 rounded-lg shadow-sm">
            {/* 👇 MODIFICADO: Título con Fecha Límite 👇 */}
            <h4 className="font-bold text-gray-800 flex justify-between items-center gap-2">
                <span>📝 {assignment.title}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${isOverdue && !mySubmission ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    Vence: {formattedDate}
                </span>
            </h4>
            <p className="text-sm text-gray-600 mt-2 mb-4">{assignment.instructions || assignment.description}</p>

            {/* 👇 LÓGICA CONDICIONAL: ¿Ya entregó? ¿Ya venció? 👇 */}
            {mySubmission ? (
                // --- VISTA: YA ENTREGÓ ---
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-green-800 font-bold text-sm mb-1">✅ ¡Tarea entregada!</p>
                            {mySubmission.file_path ? (
                                <span className="text-xs text-gray-500">Subiste un archivo.</span>
                            ) : (
                                <a href={mySubmission.link_url} target="_blank" className="text-xs text-blue-600 hover:underline">
                                    Ver tu enlace enviado
                                </a>
                            )}
                        </div>

                        {/* Mostrar calificación si el maestro ya la revisó */}
                        <div className="text-right">
                            {mySubmission.grade !== null ? (
                                <div className="bg-white px-3 py-1 rounded border border-green-200 shadow-sm">
                                    <span className="text-xs text-gray-500 block">Calificación:</span>
                                    <span className="font-black text-green-600 text-lg">{mySubmission.grade}/10</span>
                                </div>
                            ) : (
                                <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">En revisión</span>
                            )}
                        </div>
                    </div>
                </div>
            ) : isOverdue ? (
                // 👇 NUEVO --- VISTA: TIEMPO AGOTADO --- 👇
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-2 text-center">
                    <p className="text-red-600 font-bold text-sm">⛔ Tiempo Agotado</p>
                    <p className="text-xs text-red-400 mt-1">La fecha límite ha pasado y ya no puedes entregar esta tarea.</p>
                </div>
            ) : (
                // --- VISTA: AÚN NO ENTREGA (Muestra el formulario) ---
                <form onSubmit={handleStudentSubmit} className="flex flex-col gap-3">
                    <div className="flex gap-4 mb-1">
                        <label className="flex items-center gap-1 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name={`type-${assignment.id}`}
                                checked={submissionType === 'link'}
                                onChange={() => { setSubmissionType('link'); setData('file', null); }}
                            />
                            🔗 Enlace Web
                        </label>
                        <label className="flex items-center gap-1 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name={`type-${assignment.id}`}
                                checked={submissionType === 'file'}
                                onChange={() => { setSubmissionType('file'); setData('link_url', ''); }}
                            />
                            📎 Subir Archivo
                        </label>
                    </div>

                    <div className="flex gap-2">
                        {submissionType === 'link' ? (
                            <input
                                type="url"
                                required
                                placeholder="https://tu-enlace-aqui.com"
                                value={data.link_url || ''}
                                onChange={e => setData('link_url', e.target.value)}
                                className="flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                            />
                        ) : (
                            <input
                                type="file"
                                required
                                accept=".pdf,.doc,.docx,.zip,.jpg,.png"
                                onChange={e => setData('file', e.target.files[0])}
                                className="flex-1 border border-gray-300 bg-white px-3 py-2 rounded-md shadow-sm text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            />
                        )}

                        <button disabled={processing} className="bg-indigo-600 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm">
                            {processing ? 'Enviando...' : 'Entregar'}
                        </button>
                    </div>

                    {errors.link_url && <p className="text-red-600 text-xs font-bold">{errors.link_url}</p>}
                    {errors.file && <p className="text-red-600 text-xs font-bold">{errors.file}</p>}
                    {errors.error && <p className="text-red-600 text-xs font-bold text-center mt-2">{errors.error}</p>}
                </form>
            )}
        </div>
    );
}