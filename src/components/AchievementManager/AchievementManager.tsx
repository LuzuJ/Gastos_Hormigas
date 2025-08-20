import { useState, useEffect } from 'react';
import { AchievementNotification } from '../AchievementNotification';
import { useAchievements } from '../../hooks/useAchievements';
import type { Achievement } from '../../types';

interface AchievementManagerProps {
  userId: string | null;
  children: React.ReactNode;
}

export const AchievementManager = ({ userId, children }: AchievementManagerProps) => {
  const { newlyUnlockedAchievements, markAchievementAsViewed } = useAchievements(userId);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);

  // Agregar nuevos logros desbloqueados a la cola
  useEffect(() => {
    if (newlyUnlockedAchievements.length > 0) {
      setNotificationQueue(prev => [...prev, ...newlyUnlockedAchievements]);
    }
  }, [newlyUnlockedAchievements]);

  // Mostrar la siguiente notificación en la cola
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const [nextNotification, ...remainingQueue] = notificationQueue;
      setCurrentNotification(nextNotification);
      setNotificationQueue(remainingQueue);
    }
  }, [currentNotification, notificationQueue]);

  const handleCloseNotification = () => {
    if (currentNotification) {
      markAchievementAsViewed(currentNotification.id);
      setCurrentNotification(null);
    }
  };

  return (
    <>
      {children}
      
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          isVisible={!!currentNotification}
          onClose={handleCloseNotification}
          autoCloseDelay={8000}
        />
      )}
    </>
  );
};
