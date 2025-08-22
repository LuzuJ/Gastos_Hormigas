import React, { useState } from 'react';
import { Mail, X, RefreshCw, Check } from 'lucide-react';
import { auth } from '../../../config/firebase';
import { sendVerificationEmail, reloadUserData } from '../../../utils/emailVerification';
import styles from './EmailVerificationBanner.module.css';

interface EmailVerificationBannerProps {
  onDismiss?: () => void;
  variant?: 'banner' | 'modal';
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ 
  onDismiss,
  variant = 'banner'
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleResendEmail = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const result = await sendVerificationEmail(user);
      
      if (result.success) {
        setMessage('Email de verificación enviado correctamente.');
        setMessageType('success');
      } else {
        setMessage(result.error || 'Error al enviar el email.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error inesperado al enviar el email.');
      setMessageType('error');
    }

    setLoading(false);
    
    // Limpiar mensaje después de 5 segundos
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      await reloadUserData();
      
      if (auth.currentUser?.emailVerified) {
        setMessage('¡Email verificado exitosamente!');
        setMessageType('success');
        
        // Recargar la página después de un momento para reflejar los cambios
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage('El email aún no ha sido verificado. Por favor, revisa tu bandeja de entrada.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error al verificar el estado del email.');
      setMessageType('error');
    }

    setLoading(false);
    
    // Limpiar mensaje si no fue exitoso
    if (messageType !== 'success') {
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  const containerClass = variant === 'modal' 
    ? `${styles.container} ${styles.modal}` 
    : `${styles.container} ${styles.banner}`;

  return (
    <div className={containerClass}>
      <div className={styles.content}>
        <div className={styles.iconSection}>
          <Mail className={styles.mailIcon} size={24} />
        </div>
        
        <div className={styles.textSection}>
          <h3 className={styles.title}>Verifica tu email</h3>
          <p className={styles.description}>
            Hemos enviado un email de verificación a <strong>{auth.currentUser?.email}</strong>. 
            Por favor, verifica tu email para acceder a todas las funciones.
          </p>
          
          {message && (
            <div className={`${styles.message} ${styles[messageType]}`}>
              {messageType === 'success' && <Check size={16} />}
              <span>{message}</span>
            </div>
          )}
        </div>

        {onDismiss && (
          <button 
            onClick={onDismiss}
            className={styles.dismissButton}
            aria-label="Cerrar notificación"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleResendEmail}
          disabled={loading}
          className={styles.secondaryButton}
        >
          {loading ? <RefreshCw className={styles.spinning} size={16} /> : <Mail size={16} />}
          {loading ? 'Enviando...' : 'Reenviar email'}
        </button>
        
        <button
          onClick={handleCheckVerification}
          disabled={loading}
          className={styles.primaryButton}
        >
          {loading ? <RefreshCw className={styles.spinning} size={16} /> : <RefreshCw size={16} />}
          {loading ? 'Verificando...' : 'Ya verifiqué'}
        </button>
      </div>
    </div>
  );
};
