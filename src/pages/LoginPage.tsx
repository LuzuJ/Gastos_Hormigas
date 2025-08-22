import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { authService } from '../services/auth/authService';
import { ThemeToggler } from '../components/ui/ThemeToggler/ThemeToggler';
import { PasswordInput } from '../components/ui/PasswordInput/PasswordInput';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false); 
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    await authService.signInWithGoogle(auth.currentUser);
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError('');
    await authService.signInAsGuest();
  };

  // Función para traducir códigos de error de Firebase a mensajes amigables
  const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'El correo electrónico o la contraseña son incorrectos.';
      case 'auth/user-not-found':
        return 'No se encontró ninguna cuenta con este correo electrónico.';
      case 'auth/user-not-registered':
        return 'Este usuario no está registrado en nuestro sistema. Por favor, regístrate primero.';
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado. Intenta iniciar sesión.';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta de nuevo más tarde.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu conexión a internet.';
      default:
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
        ? await authService.signUpWithEmail(email, password, auth.currentUser)
        : await authService.signInWithEmail(email, password);
      
      if (!result.success) {
        setError(getFriendlyErrorMessage(result.error as string));
        setLoading(false);
      }
      // Si el inicio de sesión es exitoso, onAuthStateChanged en App.tsx se encarga del resto.
      // No cambiamos setLoading(false) aquí para que se mantenga el estado de carga hasta la redirección
    } catch (error) {
      setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
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
            placeholder="Correo electrónico"
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