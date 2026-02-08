import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Play, User } from 'lucide-react';
import ProfileManager from '../components/ProfileManager';
import './Home.css';

const Home: React.FC = () => {
    const [showProfileManager, setShowProfileManager] = useState(false);

    return (
        <div className="home-container">
            <header className="header">
                <button
                    className="profile-btn"
                    onClick={() => setShowProfileManager(true)}
                    title="Gestionar Perfiles de Responsables"
                >
                    <User size={20} /> Perfiles
                </button>
                <h1>App de Checks SILS</h1>
                <p>Selecciona una plantilla para comenzar</p>
            </header>

            <main className="templates-grid">
                <div className="template-card">
                    <div className="preview-container">
                        <iframe
                            src="/checklist.pdf#toolbar=0&navpanes=0&scrollbar=0"
                            title="Checklist Preview"
                            className="pdf-preview"
                        />
                        <div className="preview-overlay">
                            <FileText size={48} color="#fff" />
                        </div>
                    </div>
                    <div className="card-content">
                        <h3>Checklist Instalación TLK</h3>
                        <p>Formulario estándar para validación de instalaciones.</p>
                        <Link to="/form" className="start-btn">
                            <Play size={16} /> Iniciar Check
                        </Link>
                    </div>
                </div>
            </main>
            {showProfileManager && (
                <ProfileManager onClose={() => setShowProfileManager(false)} />
            )}
        </div>
    );
};

export default Home;
