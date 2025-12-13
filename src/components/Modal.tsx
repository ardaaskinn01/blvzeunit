
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
    } as React.CSSProperties,
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    } as React.CSSProperties,
    header: {
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as React.CSSProperties,
    title: {
        fontSize: '1.25rem',
        fontWeight: 600,
        margin: 0,
    } as React.CSSProperties,
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#666',
        padding: '0.25rem',
    } as React.CSSProperties,
    content: {
        padding: '1.5rem',
        overflowY: 'auto',
    } as React.CSSProperties,
};

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    // Prevent scrolling on body when modal is open
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>{title}</h2>
                    <button style={styles.closeBtn} onClick={onClose}>×</button>
                </div>
                <div style={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}
