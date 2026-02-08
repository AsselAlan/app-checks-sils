import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import './SignaturePad.css';

interface SignaturePadProps {
    onEnd: (dataUrl: string) => void;
    label?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onEnd, label }) => {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const clear = () => {
        sigCanvas.current?.clear();
    };

    const handleConfirm = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            const dataUrl = sigCanvas.current.getCanvas().toDataURL('image/png');
            setPreviewUrl(dataUrl);
            onEnd(dataUrl);
            setIsOpen(false);
        } else {
            // If empty and confirmed, treat as clearing value
            setPreviewUrl(null);
            onEnd('');
            setIsOpen(false);
        }
    };

    const openModal = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission if inside form
        setIsOpen(true);
        // We need a timeout to let the modal render before accessing ref if needed, 
        // though react-signature-canvas handles resize well usually.
    };

    return (
        <div className="signature-pad-container">
            {label && <label>{label}</label>}

            {/* Preview Area (Click to Open) */}
            <div className="signature-preview" onClick={openModal}>
                {previewUrl ? (
                    <img src={previewUrl} alt="Firma" className="img-preview" />
                ) : (
                    <div className="placeholder-text">Toca para firmar</div>
                )}
            </div>

            {/* Full Screen Modal */}
            {isOpen && (
                <div className="signature-modal-overlay">
                    <div className="signature-modal-content">
                        <h3>Firmar aquí</h3>
                        <div className="modal-canvas-wrapper">
                            <SignatureCanvas
                                ref={sigCanvas}
                                canvasProps={{ className: 'modal-sigCanvas' }}
                                minWidth={1.5}
                                maxWidth={3.5}
                            />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setIsOpen(false)}>Cancelar</button>
                            <button type="button" className="btn-clear" onClick={clear}>Limpiar</button>
                            <button type="button" className="btn-confirm" onClick={handleConfirm}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignaturePad;
