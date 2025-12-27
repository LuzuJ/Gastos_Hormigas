// Base repository interface
export type { IRepository } from './IRepository';

// Entity-specific repository interfaces
export type { IUserRepository } from './IUserRepository';
export type { ICategoryRepository } from './ICategoryRepository';
export type { IExpenseRepository } from './IExpenseRepository';
export type { IIncomeRepository } from './IIncomeRepository';
export type { IFixedExpenseRepository } from './IFixedExpenseRepository';
export type { IFinancialsRepository } from './IFinancialsRepository';
export type { ISavingsGoalRepository } from './ISavingsGoalRepository';
export type { IAssetRepository } from './IAssetRepository';
export type { ILiabilityRepository } from './ILiabilityRepository';
export type { IPaymentSourceRepository } from './IPaymentSourceRepository';
export type { IUserStatsRepository, UserStats } from './IUserStatsRepository';

// Factory interface
export type { IRepositoryFactory } from './IRepositoryFactory';
