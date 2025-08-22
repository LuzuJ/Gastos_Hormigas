import { useState, useMemo } from 'react';
import { AchievementCard } from '../../features/achievements/AchievementCard/AchievementCard';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { useAchievements } from '../../../hooks/achievements/useAchievements';
import type { AchievementCategory, AchievementTier } from '../../../types';
import styles from './AchievementsPage.module.css';

type FilterType = 'all' | 'completed' | 'in-progress' | 'locked';
type SortType = 'title' | 'progress' | 'points' | 'tier';

interface AchievementsPageProps {
  userId?: string | null;
}

export const AchievementsPage = ({ userId = 'demo-user' }: AchievementsPageProps) => {
  const { achievements, userStats, loading, refreshAchievements } = useAchievements(userId);
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<AchievementTier | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortType>('progress');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedAchievements = useMemo(() => {
    let filtered = achievements.filter(achievement => {
      // Filtro por estado
      switch (filter) {
        case 'completed':
          return achievement.isUnlocked;
        case 'in-progress':
          return !achievement.isUnlocked && achievement.progress > 0;
        case 'locked':
          return !achievement.isUnlocked && achievement.progress === 0;
        default:
          return true;
      }
    });

    // Filtro por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(achievement => achievement.category === categoryFilter);
    }

    // Filtro por tier
    if (tierFilter !== 'all') {
      filtered = filtered.filter(achievement => achievement.tier === tierFilter);
    }

    // Ordenamiento
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'points':
          comparison = a.points - b.points;
          break;
        case 'tier': {
          const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
          comparison = tierOrder[a.tier] - tierOrder[b.tier];
          break;
        }
        default:
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [achievements, filter, categoryFilter, tierFilter, sortBy, sortOrder]);

  const getCategoryLabel = (category: AchievementCategory | 'all') => {
    switch (category) {
      case 'budget': return 'Presupuesto';
      case 'savings': return 'Ahorros';
      case 'debt': return 'Deudas';
      case 'income': return 'Ingresos';
      case 'general': return 'General';
      case 'all': return 'Todas';
      default: return category;
    }
  };

  const getTierLabel = (tier: AchievementTier | 'all') => {
    switch (tier) {
      case 'bronze': return 'Bronce';
      case 'silver': return 'Plata';
      case 'gold': return 'Oro';
      case 'platinum': return 'Platino';
      case 'all': return 'Todos';
      default: return tier;
    }
  };

  const getFilterLabel = (filterType: FilterType) => {
    switch (filterType) {
      case 'all': return 'Todos';
      case 'completed': return 'Completados';
      case 'in-progress': return 'En Progreso';
      case 'locked': return 'Bloqueados';
      default: return filterType;
    }
  };

  const handleSort = (newSortBy: SortType) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando logros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header con estadísticas del usuario */}
      <div className={styles.header}>
        <div className={styles.userStats}>
          <Card className={styles.statsCard}>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statIcon}>🏆</span>
                <div>
                  <div className={styles.statValue}>{userStats.totalPoints}</div>
                  <div className={styles.statLabel}>Puntos Totales</div>
                </div>
              </div>
              
              <div className={styles.statItem}>
                <span className={styles.statIcon}>⭐</span>
                <div>
                  <div className={styles.statValue}>Nivel {userStats.currentLevel}</div>
                  <div className={styles.statLabel}>{userStats.pointsToNextLevel} pts para siguiente nivel</div>
                </div>
              </div>
              
              <div className={styles.statItem}>
                <span className={styles.statIcon}>🎯</span>
                <div>
                  <div className={styles.statValue}>
                    {userStats.achievementsUnlocked}/{userStats.totalAchievements}
                  </div>
                  <div className={styles.statLabel}>Logros Desbloqueados</div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={refreshAchievements}
              variant="secondary"
              size="small"
              className={styles.refreshButton}
            >
              🔄 Actualizar Progreso
            </Button>
          </Card>
        </div>
      </div>

      {/* Filtros y ordenamiento */}
      <div className={styles.controls}>
        <div className={styles.filterSection}>
          <h3>Filtros</h3>
          <div className={styles.filterGroup}>
            <label htmlFor="status-filter">Estado:</label>
            <select 
              id="status-filter"
              value={filter} 
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className={styles.select}
            >
              {(['all', 'completed', 'in-progress', 'locked'] as FilterType[]).map(filterType => (
                <option key={filterType} value={filterType}>
                  {getFilterLabel(filterType)}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="category-filter">Categoría:</label>
            <select 
              id="category-filter"
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value as AchievementCategory | 'all')}
              className={styles.select}
            >
              {(['all', 'budget', 'savings', 'debt', 'income', 'general'] as (AchievementCategory | 'all')[]).map(category => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="tier-filter">Nivel:</label>
            <select 
              id="tier-filter"
              value={tierFilter} 
              onChange={(e) => setTierFilter(e.target.value as AchievementTier | 'all')}
              className={styles.select}
            >
              {(['all', 'bronze', 'silver', 'gold', 'platinum'] as (AchievementTier | 'all')[]).map(tier => (
                <option key={tier} value={tier}>
                  {getTierLabel(tier)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={styles.sortSection}>
          <h3>Ordenar por</h3>
          <div className={styles.sortButtons}>
            {(['title', 'progress', 'points', 'tier'] as SortType[]).map(sortType => (
              <Button
                key={sortType}
                onClick={() => handleSort(sortType)}
                variant={sortBy === sortType ? 'primary' : 'secondary'}
                size="small"
                className={styles.sortButton}
              >
                {sortType === 'title' && 'Nombre'}
                {sortType === 'progress' && 'Progreso'}
                {sortType === 'points' && 'Puntos'}
                {sortType === 'tier' && 'Nivel'}
                {sortBy === sortType && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de logros */}
      <div className={styles.achievementsGrid}>
        {filteredAndSortedAchievements.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎯</span>
            <h3>No se encontraron logros</h3>
            <p>Prueba ajustando los filtros o completando más actividades para desbloquear nuevos logros.</p>
          </div>
        ) : (
          filteredAndSortedAchievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              showProgress={true}
              size="medium"
            />
          ))
        )}
      </div>
    </div>
  );
};
