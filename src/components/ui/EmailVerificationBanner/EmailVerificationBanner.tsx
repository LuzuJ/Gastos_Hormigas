import React, { useState, useEffect } from 'react';
import { Mail, X, RefreshCw, Check } from 'lucide-react';
import { supabase } from '../../../config/supabase';
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
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Obtener el email del usuario actual
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        setMessage('No se pudo obtener el email del usuario.');
        setMessageType('error');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) {
        setMessage(error.message || 'Error al enviar el email.');
        setMessageType('error');
      } else {
        setMessage('Email de verificación enviado correctamente.');
        setMessageType('success');
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
      // Refrescar el usuario actual para obtener el estado más reciente
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        setMessage('Error al verificar el estado del email.');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // En Supabase, si el email está confirmado, user.email_confirmed_at tendrá un valor
      if (user?.email_confirmed_at) {
        setMessage('¡Email verificado exitosamente!');
        setMessageType('success');
        
        // Recargar la página después de un momento para reflejar los cambios
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage('El email aún no ha sido verificado. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.');
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
            Hemos enviado un email de verificación a <strong>{userEmail}</strong>. 
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
