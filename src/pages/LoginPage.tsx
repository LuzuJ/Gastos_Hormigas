import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth/authService';
import { ThemeToggler } from '../components/ui/ThemeToggler/ThemeToggler';
import { PasswordInput } from '../components/ui/PasswordInput/PasswordInput';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false); 
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Si el usuario ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.signInWithGoogle();
      
      if (!result.success && result.error) {
        setError(getFriendlyErrorMessage(result.error));
        setLoading(false);
      }
      // Si es exitoso, Supabase redirige automáticamente al proveedor OAuth
      // No necesitamos hacer nada más aquí, el loading se mantiene hasta el redirect
    } catch (error) {
      console.error('Error en autenticación con Google:', error);
      setError('Error al conectar con Google. Por favor, inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.signInAsGuest();
      
      if (!result.success && result.error) {
        setError(getFriendlyErrorMessage(result.error));
      }
    } catch (error) {
      console.error('Error en inicio de sesión como invitado:', error);
      setError('Error al iniciar sesión como invitado. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para traducir códigos de error a mensajes amigables
  const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return 'El correo electrónico o la contraseña son incorrectos.';
      case 'auth/email-not-confirmed':
        return 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada o contacta al administrador.';
      case 'auth/signup-disabled':
        return 'El registro está deshabilitado. Contacta al administrador.';
      case 'auth/user-not-found':
        return 'No se encontró ninguna cuenta con este correo electrónico.';
      case 'auth/user-not-registered':
        return 'Este usuario no está registrado en nuestro sistema. Por favor, regístrate primero.';
      case 'auth/email-already-in-use':
      case 'Email already registered':
        return 'Este correo electrónico ya está registrado. Intenta iniciar sesión.';
      case 'auth/weak-password':
      case 'Password should be at least 6 characters':
        return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      case 'auth/invalid-email':
      case 'Invalid email':
      case 'Invalid email format':
        return 'El formato del correo electrónico no es válido. Debe ser como: usuario@ejemplo.com';
      case 'Email username must be at least 3 characters':
        return 'El nombre de usuario del email debe tener al menos 3 caracteres antes del @';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta de nuevo más tarde.';
      case 'auth/network-request-failed':
      case 'Network error':
        return 'Error de conexión. Verifica tu conexión a internet.';
      default:
        // Si el error contiene información específica de Supabase, mostrarla
        if (errorCode.includes('Email address') && errorCode.includes('invalid')) {
          return 'El formato del email no es válido. Prueba con un email más largo como: usuario@ejemplo.com';
        }
        return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validación adicional para registro
    if (isSigningUp && !isPasswordValid) {
      setError('Por favor, ingresa una contraseña que cumpla con los requisitos de seguridad.');
      setLoading(false);
      return;
    }

    try {
      const result = isSigningUp
        ? await authService.signUpWithEmail(email, password)
        : await authService.signInWithEmail(email, password);

      if (!result.success) {
        setError(getFriendlyErrorMessage(result.error as string));
      } else if (isSigningUp) {
        // Mostrar mensaje de confirmación para nuevo registro
        setError('');
        
        // Verificar si Supabase requiere confirmación de email
        if (result.user && !result.user.email_confirmed_at) {
          alert('¡Cuenta creada exitosamente! Verifica tu email para completar el registro, o contacta al administrador si no recibes el correo.');
          setIsSigningUp(false);
        } else {
          // Usuario registrado y confirmado, redirigir automáticamente
          console.log('Usuario registrado y confirmado, redirigiendo...');
        }
      } else {
        // Éxito al iniciar sesión, la redirección la maneja el useEffect
        console.log('Usuario autenticado correctamente');
      }
    } catch (error: any) {
      console.error('Error inesperado:', error);
      setError(error.message || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  let buttonText = '';
  if (loading) {
    buttonText = 'Cargando...';
  } else if (isSigningUp) {
    buttonText = 'Registrarse';
  } else {
    buttonText = 'Iniciar Sesión';
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.togglerContainer}>
          <ThemeToggler />
        </div>
        <h1>{isSigningUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</h1>
        <p>Tu asistente para controlar tus finanzas personales.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="tu.email@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Contraseña"
            showValidation={isSigningUp}
            required
            className={styles.input}
            autoComplete={isSigningUp ? "new-password" : "current-password"}
            onValidationChange={setIsPasswordValid}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button 
            type="submit" 
            className={styles.primaryButton} 
            disabled={loading || (isSigningUp && !isPasswordValid)}
          >
            {buttonText}
          </button>
        </form>

        <div className={styles.divider}>o</div>

        <div className={styles.actions}>
          <button onClick={handleGoogleSignIn} className={styles.googleButton} disabled={loading}>
            Continuar con Google
          </button>
          <button onClick={handleGuestSignIn} className={styles.guestButton} disabled={loading}>
            Continuar como invitado
          </button>
        </div>

        <p className={styles.toggleText}>
          {isSigningUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
          <button onClick={() => { setIsSigningUp(!isSigningUp); setError(''); }} className={styles.toggleButton}>
            {isSigningUp ? 'Inicia Sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  );
};