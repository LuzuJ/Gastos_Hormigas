import { useEffect, useState } from 'react';
import type { Achievement } from '../../types';
import { Card } from '../common/Card/Card';
import { Button } from '../common/Button/Button';
import styles from './AchievementNotification.module.css';

interface AchievementNotificationProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

export const AchievementNotification = ({ 
  achievement, 
  isVisible, 
  onClose, 
  autoCloseDelay = 5000 
}: AchievementNotificationProps) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoCloseDelay, onClose]);

  const handleAnimationEnd = () => {
    if (!isVisible) {
      setShouldRender(false);
    }
  };

  const getTierColor = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#6B7280';
    }
  };

  const getTierLabel = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return 'Bronce';
      case 'silver': return 'Plata';
      case 'gold': return 'Oro';
      case 'platinum': return 'Platino';
      default: return '';
    }
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`${styles.notificationOverlay} ${isVisible ? styles.visible : styles.hidden}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <Card className={styles.notificationCard}>
        <div className={styles.header}>
          <div className={styles.celebrate}>🎉</div>
          <h2 className={styles.title}>¡Logro Desbloqueado!</h2>
          <Button
            onClick={onClose}
            variant="outline"
            size="small"
            className={styles.closeButton}
            aria-label="Cerrar notificación"
          >
            ✕
          </Button>
        </div>

        <div className={styles.content}>
          <div className={styles.achievementInfo}>
            <div className={styles.iconContainer}>
              <span className={styles.achievementIcon}>{achievement.icon}</span>
              <div 
                className={styles.tierBadge}
                style={{ backgroundColor: getTierColor(achievement.tier) }}
              >
                {getTierLabel(achievement.tier)}
              </div>
            </div>
            
            <div className={styles.details}>
              <h3 className={styles.achievementTitle}>{achievement.title}</h3>
              <p className={styles.achievementDescription}>{achievement.description}</p>
              
              <div className={styles.points}>
                <span className={styles.pointsIcon}>🏆</span>
                <span className={styles.pointsText}>+{achievement.points} puntos</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button 
            onClick={onClose}
            variant="primary"
            size="small"
            className={styles.continueButton}
          >
            ¡Genial!
          </Button>
        </div>
      </Card>
    </div>
  );
};
