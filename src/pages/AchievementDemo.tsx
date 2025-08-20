import { useState } from 'react';
import { AchievementsPage } from '../components/AchievementsPage';
import { AchievementManager } from '../components/AchievementManager';
import { Card } from '../components/common/Card/Card';
import { Button } from '../components/common/Button/Button';
import styles from './AchievementDemo.module.css';

export const AchievementDemo = () => {
  const [showAchievements, setShowAchievements] = useState(false);
  const userId = 'demo-user';

  return (
    <AchievementManager userId={userId}>
      <div className={styles.container}>
        <Card className={styles.demoCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>🏆 Sistema de Logros - Gastos Hormigas</h1>
            <p className={styles.description}>
              Sistema completo de gamificación para motivar mejores hábitos financieros
            </p>
          </div>

          <div className={styles.content}>
            <div className={styles.features}>
              <h2>Características Implementadas</h2>
              <ul className={styles.featureList}>
                <li>✅ <strong>Sistema de Logros Completo:</strong> Medallas por categorías (Presupuesto, Ahorros, Deudas, Ingresos)</li>
                <li>✅ <strong>Niveles de Dificultad:</strong> Bronce, Plata, Oro y Platino</li>
                <li>✅ <strong>Sistema de Puntos:</strong> Acumulación de puntos y niveles de usuario</li>
                <li>✅ <strong>Progreso en Tiempo Real:</strong> Seguimiento automático del progreso</li>
                <li>✅ <strong>Notificaciones Animadas:</strong> Celebración cuando se desbloquean logros</li>
                <li>✅ <strong>Filtros y Ordenamiento:</strong> Por estado, categoría, nivel y progreso</li>
                <li>✅ <strong>Diseño Responsivo:</strong> Adaptado para móviles y desktop</li>
                <li>✅ <strong>Modo Oscuro/Claro:</strong> Soporte completo para ambos temas</li>
              </ul>
            </div>

            <div className={styles.logros}>
              <h2>Logros Disponibles</h2>
              <div className={styles.achievements}>
                <div className={styles.category}>
                  <h3>💰 Presupuesto</h3>
                  <ul>
                    <li>🥉 Primer Mes Controlado (100 pts)</li>
                    <li>🥈 Maestro del Presupuesto (300 pts)</li>
                    <li>🥇 Leyenda del Control (600 pts)</li>
                  </ul>
                </div>

                <div className={styles.category}>
                  <h3>🏦 Ahorros</h3>
                  <ul>
                    <li>🥉 Primera Meta Alcanzada (150 pts)</li>
                    <li>🥈 Ahorrador Profesional (400 pts)</li>
                    <li>🥇 Gurú del Ahorro (800 pts)</li>
                  </ul>
                </div>

                <div className={styles.category}>
                  <h3>💳 Deudas</h3>
                  <ul>
                    <li>🥉 Cazador de Deudas (200 pts)</li>
                    <li>🏆 Libre de Deudas (1000 pts)</li>
                  </ul>
                </div>

                <div className={styles.category}>
                  <h3>⭐ General</h3>
                  <ul>
                    <li>🥉 Cortador de Gastos (120 pts)</li>
                    <li>🥇 Optimizador Experto (500 pts)</li>
                    <li>🥈 Crecimiento Patrimonial (350 pts)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                onClick={() => setShowAchievements(!showAchievements)}
                variant="primary"
                size="large"
                className={styles.actionButton}
              >
                {showAchievements ? '📊 Ocultar Logros' : '🏆 Ver Sistema de Logros'}
              </Button>
            </div>
          </div>
        </Card>

        {showAchievements && (
          <div className={styles.achievementsContainer}>
            <AchievementsPage userId={userId} />
          </div>
        )}
      </div>
    </AchievementManager>
  );
};
