import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium'
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div
                ref={modalRef}
                className={`${styles.modal} ${styles[size]}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className={styles.header}>
                    <h2 id="modal-title" className={styles.title}>{title}</h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
};
