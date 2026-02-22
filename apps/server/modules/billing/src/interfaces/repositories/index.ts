export type { IOrderRepository } from './i-order.repository';
export type { IUserBalanceRepository } from './i-user-balance.repository';

// Injection tokens for repositories
export const ORDER_REPOSITORY_TOKEN = Symbol('ORDER_REPOSITORY');
export const USER_BALANCE_REPOSITORY_TOKEN = Symbol('USER_BALANCE_REPOSITORY');
