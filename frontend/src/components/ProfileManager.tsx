import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { User, Save, Trash2, X } from 'lucide-react';
import './ProfileManager.css';

interface Profile {
    id: string;
    name: string;
    signature: string;
}

interface ProfileManagerProps {
    onClose: () => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ onClose }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [newName, setNewName] = useState('');
    const sigCanvas = useRef<SignatureCanvas>(null);

    useEffect(() => {
        const stored = localStorage.getItem('SILSTECH_RP_PROFILES');
        if (stored) {
            try {
                setProfiles(JSON.parse(stored));
            } catch (e) {
                console.error("Error loading profiles", e);
            }
        }
    }, []);

    const saveProfile = () => {
        if (!newName.trim()) {
            alert("Por favor ingresa un nombre.");
            return;
        }
        if (sigCanvas.current?.isEmpty()) {
            alert("Por favor ingresa una firma.");
            return;
        }

        const signature = sigCanvas.current?.getCanvas().toDataURL('image/png') || '';
        const newProfile: Profile = {
            id: Date.now().toString(),
            name: newName,
            signature
        };

        const updated = [...profiles, newProfile];
        setProfiles(updated);
        localStorage.setItem('SILSTECH_RP_PROFILES', JSON.stringify(updated));

        // Reset form
        setNewName('');
        sigCanvas.current?.clear();
        alert("Perfil guardado correctamente.");
    };

    const deleteProfile = (id: string) => {
        if (window.confirm("¿Estás seguro de eliminar este perfil?")) {
            const updated = profiles.filter(p => p.id !== id);
            setProfiles(updated);
            localStorage.setItem('SILSTECH_RP_PROFILES', JSON.stringify(updated));
        }
    };

    return (
        <div className="pm-overlay">
            <div className="pm-modal">
                <div className="pm-header">
                    <h2><User size={24} /> Gestión de Perfiles</h2>
                    <button onClick={onClose} className="pm-close"><X size={24} /></button>
                </div>

                <div className="pm-content">
                    <div className="pm-section pm-new-profile">
                        <h3>Crear Nuevo Perfil</h3>
                        <div className="pm-form-group">
                            <label>Nombre y Apellido (Responsable Silstech)</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ej: Juan Perez"
                                className="pm-input"
                            />
                        </div>
                        <div className="pm-form-group">
                            <label>Firma</label>
                            <div className="pm-sig-container">
                                <SignatureCanvas
                                    ref={sigCanvas}
                                    canvasProps={{ className: 'pm-sig-canvas' }}
                                    minWidth={1.5}
                                    maxWidth={3.5}
                                />
                                <button className="pm-clear-sig" onClick={() => sigCanvas.current?.clear()}>Limpiar Firma</button>
                            </div>
                        </div>
                        <button onClick={saveProfile} className="pm-save-btn">
                            <Save size={18} /> Guardar Perfil
                        </button>
                    </div>

                    <div className="pm-section pm-list">
                        <h3>Perfiles Guardados</h3>
                        {profiles.length === 0 ? (
                            <p className="pm-empty">No hay perfiles guardados.</p>
                        ) : (
                            <ul className="pm-profiles-ul">
                                {profiles.map(p => (
                                    <li key={p.id} className="pm-profile-item">
                                        <div className="pm-profile-info">
                                            <span className="pm-profile-name">{p.name}</span>
                                            <img src={p.signature} alt="Firma" className="pm-profile-sig-preview" />
                                        </div>
                                        <button onClick={() => deleteProfile(p.id)} className="pm-delete-btn" title="Eliminar">
                                            <Trash2 size={18} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileManager;
