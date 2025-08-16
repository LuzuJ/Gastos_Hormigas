import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { authService } from '../services/authService';
import { ThemeToggler } from '../components/ThemeToggler/ThemeToggler';
import styles from './LoginPage.module.css'; // Crearemos este archivo a continuación

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false); // Para cambiar entre login y registro

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await authService.signInWithGoogle(auth.currentUser);
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    await authService.signInAsGuest();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = isSigningUp
        ? await authService.signUpWithEmail(email, password, auth.currentUser)
        : await authService.signInWithEmail(email, password);
      
      if (!result.success) {
        // Traducimos el error de Firebase a un mensaje más amigable
        const errorCode = (result.error as any)?.code || '';
        if (errorCode === 'auth/invalid-credential') {
          setError('El correo o la contraseña son incorrectos.');
        } else if (errorCode === 'auth/email-already-in-use') {
          setError('Este correo electrónico ya está registrado.');
        } else {
          setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
        }
      }
      // Si el login es exitoso, onAuthStateChanged en App.tsx se encarga del resto
      
    } catch (err) {
      // Este bloque es un seguro por si algo inesperado ocurre
      setError('Ocurrió un error inesperado.');
      console.error("Error en el formulario de login:", err);
    } finally {
      // Este bloque se ejecuta SIEMPRE, ya sea que haya éxito o error
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
        <div className={styles.togglerContainer}> {/* <-- 2. Añade este div contenedor */}
          <ThemeToggler />
        </div>
        <h1>{isSigningUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</h1>
        <p>Tu asistente para controlar tus finanzas personales.</p>

        {/* Formulario de Email y Contraseña */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.primaryButton} disabled={loading}>
            {buttonText}
          </button>
        </form>

        <div className={styles.divider}>o</div>

        {/* Botones de Google e Invitado */}
        <div className={styles.actions}>
          <button onClick={handleGoogleSignIn} className={styles.googleButton} disabled={loading}>
            Continuar con Google
          </button>
          <button onClick={handleGuestSignIn} className={styles.guestButton} disabled={loading}>
            Continuar como invitado
          </button>
        </div>

        {/* Enlace para cambiar entre Login y Registro */}
        <p className={styles.toggleText}>
          {isSigningUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
          <button onClick={() => setIsSigningUp(!isSigningUp)} className={styles.toggleButton}>
            {isSigningUp ? 'Inicia Sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  );
};