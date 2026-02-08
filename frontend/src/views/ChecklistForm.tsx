import React, { useState, useEffect } from 'react';
import { checklistConfig } from '../utils/checklistConfig';
import { fillPdf } from '../utils/pdfGenerator';
import SignaturePad from '../components/SignaturePad';
import { Download, Save, ArrowLeft, Share2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ChecklistForm.css';

const ChecklistForm: React.FC = () => {
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        // Initialize with default values
        const now = new Date();
        // Format for datetime-local: YYYY-MM-DDTHH:mm
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return {
            fecha_hora: `${year}-${month}-${day}T${hours}:${minutes}`
        };
    });
    const [generating, setGenerating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');

    // Load profiles on mount
    useEffect(() => {
        const stored = localStorage.getItem('SILSTECH_RP_PROFILES');
        if (stored) {
            try {
                setProfiles(JSON.parse(stored));
            } catch (e) {
                console.error("Error parsing profiles", e);
            }
        }
    }, []);



    const handleSelectProfile = (id: string) => {
        setSelectedProfileId(id);
        if (!id) {
            // Clear fields if desired, or just leave them
            return;
        }
        const profile = profiles.find(p => p.id === id);
        if (profile) {
            setFormData(prev => ({
                ...prev,
                responsable_silstech: profile.name,
                firma_responsable_silstech: profile.signature
            }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Specific handler for evaluation radio buttons
    const handleEvolutionChange = (itemId: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [`${itemId}_condition`]: value
        }));
    };

    // Specific handler for item observation
    const handleObservationChange = (itemId: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [`${itemId}_observation`]: value
        }));
    };

    const handleSignature = (key: string, dataUrl: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: dataUrl
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const pdfBytes = await fillPdf(formData);
            const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error al generar el PDF. Verifica la consola para más detalles.");
        } finally {
            setGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!pdfUrl) return;

        try {
            // Convert data to file
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            const file = new File([blob], "checklist_completado.pdf", { type: "application/pdf" });

            if (navigator.share) {
                await navigator.share({
                    title: 'Checklist Completado',
                    text: 'Adjunto el checklist de instalación.',
                    files: [file]
                });
            } else {
                alert("Tu dispositivo no soporta la función de compartir archivos nativa.");
                // Fallback or just text
                window.open(`https://wa.me/?text=He%20completado%20un%20checklist`, '_blank');
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    if (pdfUrl) {
        return (
            <div className="result-container">
                <div className="success-message">
                    <h2>¡PDF Generado con Éxito!</h2>
                    <p>Tu checklist ha sido completado y procesado.</p>
                    <div className="actions">
                        <button onClick={handleShare} className="share-btn">
                            <Share2 size={20} /> Compartir por WhatsApp
                        </button>
                        <a href={pdfUrl} download="checklist_completado.pdf" className="download-btn">
                            <Download size={20} /> Descargar PDF
                        </a>
                        <button onClick={() => setPdfUrl(null)} className="back-btn">
                            <ArrowLeft size={20} /> Volver al Formulario
                        </button>
                    </div>
                    <div className="preview-frame">
                        <iframe src={pdfUrl} title="Generated PDF" width="100%" height="600px" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <header className="form-header">
                <Link to="/" className="back-link"><ArrowLeft size={16} /> Volver</Link>
                <h1>{checklistConfig.title}</h1>
            </header>

            {/* Profile Manager Section */}
            <div className="profile-manager section-card">
                <div className="profile-header">
                    <h3><User size={18} /> Gestión de Perfil (Responsable Silstech)</h3>
                </div>
                <div className="profile-controls">
                    <select
                        value={selectedProfileId}
                        onChange={(e) => handleSelectProfile(e.target.value)}
                        className="profile-select"
                    >
                        <option value="">-- Seleccionar Perfil Guardado --</option>
                        {profiles.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <div className="profile-save-hint">
                        <small>
                            Selecciona un perfil para autocompletar nombre y firma.
                            Para gestionar perfiles (crear/borrar), ve al Inicio.
                        </small>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="checklist-form">
                {checklistConfig.sections.map((section, idx) => (
                    <div key={idx} className="form-section">
                        <h2>{section.title}</h2>

                        {/* Fields (Text, Date, textarea) */}
                        {section.fields && (
                            <div className="fields-grid">
                                {section.fields.map((field) => (
                                    <div key={field.name} className="form-group">
                                        <label htmlFor={field.name}>{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                id={field.name}
                                                name={field.name}
                                                onChange={handleInputChange}
                                                className="form-input"
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                id={field.name}
                                                name={field.name}
                                                value={formData[field.name] || ''}
                                                onChange={handleInputChange}
                                                className="form-input"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Items (Evaluation Rows with Apto/No Apto and Observation) */}
                        {section.items && (
                            <div className="items-list">
                                {section.items.map((item) => {
                                    if (item.type === 'evaluation_row') {
                                        return (
                                            <div key={item.id} className="evaluation-row">
                                                <div className="item-label">{item.label}</div>
                                                <div className="condition-group">
                                                    <label className={`radio-label ${formData[`${item.id}_condition`] === 'apto' ? 'selected-apto' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name={`${item.id}_condition`}
                                                            value="apto"
                                                            onChange={(e) => handleEvolutionChange(item.id, e.target.value)}
                                                        />
                                                        APTO
                                                    </label>
                                                    <label className={`radio-label ${formData[`${item.id}_condition`] === 'no_apto' ? 'selected-no-apto' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name={`${item.id}_condition`}
                                                            value="no_apto"
                                                            onChange={(e) => handleEvolutionChange(item.id, e.target.value)}
                                                        />
                                                        NO APTO
                                                    </label>
                                                    <label className={`radio-label ${formData[`${item.id}_condition`] === 'saltar' ? 'selected-saltar' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name={`${item.id}_condition`}
                                                            value="saltar"
                                                            onChange={(e) => handleEvolutionChange(item.id, e.target.value)}
                                                        />
                                                        SALTAR
                                                    </label>
                                                </div>
                                                <div className="observation-group">
                                                    <input
                                                        type="text"
                                                        placeholder="Observaciones (opcional)"
                                                        className="form-input observation-input"
                                                        onChange={(e) => handleObservationChange(item.id, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Fallback for simple checkbox
                                    return (
                                        <div key={item.id} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                id={item.id}
                                                name={item.id}
                                                onChange={handleInputChange}
                                            />
                                            <label htmlFor={item.id}>{item.label}</label>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Signatures */}
                        {section.signatures && (
                            <div className="signatures-grid">
                                {section.signatures.map((sig) => (
                                    <div key={sig.id} className="signature-wrapper">
                                        <label>{sig.label}</label>
                                        <SignaturePad
                                            label=""
                                            value={formData[sig.id]} // Pass current value to show pre-loaded signatures
                                            onEnd={(data) => handleSignature(sig.id, data)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={generating}>
                        {generating ? 'Generando PDF...' : 'Finalizar y Generar PDF'} <Save size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChecklistForm;
