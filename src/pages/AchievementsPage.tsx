import { AchievementsPage as AchievementsComponent } from '../components/features/achievements/AchievementsPage';
import styles from './AchievementsPage.module.css';

interface AchievementsPageProps {
  userId?: string | null;
}

export const AchievementsPage = ({ userId = 'demo-user' }: AchievementsPageProps) => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>🏆 Logros y Medallas</h1>
        <p className={styles.pageDescription}>
          Completa actividades financieras para desbloquear logros y ganar puntos. 
          ¡Mejora tu salud financiera mientras coleccionas medallas!
        </p>
      </div>
      
      <AchievementsComponent userId={userId} />
    </div>
  );
};
