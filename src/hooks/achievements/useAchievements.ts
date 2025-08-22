import { useState, useEffect, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Achievement, UserStats } from '../../types';
import { DEFAULT_ACHIEVEMENTS, AchievementsService } from '../../services/achievements/achievementsService';
import { useExpenses } from '../expenses/useExpenses';
import { useCategories } from '../categories/useCategories';
import { useSavingsGoals } from '../savings/useSavingsGoals';
import { useNetWorth } from '../financials/useNetWorth';
import { useFinancials } from '../financials/useFinancials';

const STORAGE_KEY = 'gastos-hormigas-achievements';

interface UseAchievementsReturn {
  achievements: Achievement[];
  userStats: UserStats;
  newlyUnlockedAchievements: Achievement[];
  loading: boolean;
  refreshAchievements: () => void;
  markAchievementAsViewed: (achievementId: string) => void;
}

export const useAchievements = (userId: string | null): UseAchievementsReturn => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const { expenses } = useExpenses(userId);
  const { categories } = useCategories(userId);
  const { savingsGoals } = useSavingsGoals(userId);
  const { liabilities } = useNetWorth(userId);
  const { financials } = useFinancials(userId);

  // Obtener el ingreso mensual desde financials
  const monthlyIncome = financials?.monthlyIncome || 0;

  // Cargar logros desde localStorage
  const loadAchievements = useCallback((): Achievement[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedAchievements = JSON.parse(stored);
        
        // Convertir fechas de string/number a Timestamp si es necesario
        return storedAchievements.map((achievement: any) => {
          let unlockedAt = undefined;
          if (achievement.unlockedAt) {
            if (typeof achievement.unlockedAt === 'string' || typeof achievement.unlockedAt === 'number') {
              unlockedAt = Timestamp.fromDate(new Date(achievement.unlockedAt));
            } else {
              unlockedAt = achievement.unlockedAt;
            }
          }
          
          return {
            ...achievement,
            unlockedAt
          };
        });
      }
    } catch (error) {
      console.error('Error loading achievements from localStorage:', error);
    }
    
    // Si no hay datos almacenados, inicializar con logros por defecto
    return DEFAULT_ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      isUnlocked: false,
      unlockedAt: undefined,
      progress: 0
    }));
  }, []);

  // Guardar logros en localStorage
  const saveAchievements = useCallback((achievementsToSave: Achievement[]) => {
    try {
      // Convertir Timestamp a string para almacenamiento
      const achievementsForStorage = achievementsToSave.map(achievement => ({
        ...achievement,
        unlockedAt: achievement.unlockedAt ? achievement.unlockedAt.toDate().toISOString() : undefined
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(achievementsForStorage));
    } catch (error) {
      console.error('Error saving achievements to localStorage:', error);
    }
  }, []);

  // Actualizar progreso de logros
  const refreshAchievements = useCallback(() => {
    setLoading(true);
    
    const currentAchievements = loadAchievements();
    
    // Calcular progreso actualizado
    const updatedAchievements = AchievementsService.calculateAchievementProgress(
      currentAchievements,
      expenses,
      categories,
      savingsGoals,
      liabilities,
      monthlyIncome
    );

    // Identificar logros recién desbloqueados
    const newlyUnlocked = AchievementsService.getNewlyUnlockedAchievements(
      currentAchievements,
      updatedAchievements
    );

    // Actualizar estado
    setAchievements(updatedAchievements);
    setNewlyUnlockedAchievements(prev => [...prev, ...newlyUnlocked]);

    // Guardar en localStorage
    saveAchievements(updatedAchievements);
    
    setLoading(false);
  }, [expenses, categories, savingsGoals, liabilities, monthlyIncome, loadAchievements, saveAchievements]);

  // Marcar logro como visto (remover de la lista de nuevos)
  const markAchievementAsViewed = useCallback((achievementId: string) => {
    setNewlyUnlockedAchievements(prev => prev.filter(a => a.id !== achievementId));
  }, []);

  // Calcular estadísticas del usuario
  const userStats = AchievementsService.calculateUserStats(achievements);

  // Efecto para cargar y actualizar logros
  useEffect(() => {
    refreshAchievements();
  }, [refreshAchievements]);

  // Efecto para actualizar progreso cuando cambien los datos
  useEffect(() => {
    if (achievements.length > 0) {
      const timer = setTimeout(() => {
        refreshAchievements();
      }, 1000); // Debounce de 1 segundo

      return () => clearTimeout(timer);
    }
  }, [expenses, categories, savingsGoals, liabilities, monthlyIncome]);

  return {
    achievements,
    userStats,
    newlyUnlockedAchievements,
    loading,
    refreshAchievements,
    markAchievementAsViewed
  };
};
