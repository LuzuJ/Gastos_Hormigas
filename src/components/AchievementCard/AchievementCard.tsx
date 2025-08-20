import type { Achievement } from '../../types';
import { Card } from '../common/Card/Card';
import { ProgressBar } from '../common/ProgressBar/ProgressBar';
import styles from './AchievementCard.module.css';

interface AchievementCardProps {
  achievement: Achievement;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
  onAchievementClick?: (achievement: Achievement) => void;
}

export const AchievementCard = ({ 
  achievement, 
  showProgress = true, 
  size = 'medium',
  onAchievementClick 
}: AchievementCardProps) => {
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

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'budget': return '💰';
      case 'savings': return '🏦';
      case 'debt': return '💳';
      case 'income': return '📈';
      case 'general': return '⭐';
      default: return '🏆';
    }
  };

  const handleClick = () => {
    if (onAchievementClick) {
      onAchievementClick(achievement);
    }
  };

  const isCompleted = achievement.isUnlocked;
  const progressPercentage = Math.round(achievement.progress);

  return (
    <Card 
      className={`${styles.achievementCard} ${styles[size]} ${isCompleted ? styles.completed : styles.locked}`}
      onClick={onAchievementClick ? handleClick : undefined}
    >
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <span className={styles.achievementIcon} aria-label="achievement icon">
            {isCompleted ? achievement.icon : '🔒'}
          </span>
          <span className={styles.categoryIcon} aria-label="category icon">
            {getCategoryIcon(achievement.category)}
          </span>
        </div>
        
        <div 
          className={styles.tierBadge} 
          style={{ backgroundColor: getTierColor(achievement.tier) }}
        >
          {getTierLabel(achievement.tier)}
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{achievement.title}</h3>
        <p className={styles.description}>{achievement.description}</p>
        
        {showProgress && !isCompleted && (
          <div className={styles.progressSection}>
            <div className={styles.progressInfo}>
              <span className={styles.progressLabel}>Progreso</span>
              <span className={styles.progressValue}>{progressPercentage}%</span>
            </div>
            <ProgressBar 
              value={progressPercentage} 
              max={100} 
              className={styles.progressBar}
              showLabel={false}
              size="small"
              variant="primary"
            />
          </div>
        )}
        
        <div className={styles.footer}>
          <div className={styles.points}>
            <span className={styles.pointsIcon}>🏆</span>
            <span className={styles.pointsValue}>{achievement.points} pts</span>
          </div>
          
          {isCompleted && achievement.unlockedAt && (
            <div className={styles.unlockedDate}>
              Desbloqueado: {achievement.unlockedAt.toDate().toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      
      {isCompleted && (
        <div className={styles.completedOverlay}>
          <span className={styles.completedIcon}>✅</span>
        </div>
      )}
    </Card>
  );
};
