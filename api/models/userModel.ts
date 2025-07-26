export interface UserModel {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  sessionCookie: string;
  subscription: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  lastLogin: Date;
  
  // Quota-related fields
  dailyUsage?: number;
  weeklyUsage?: number;
  lastResetDaily?: string; // ISO date string (YYYY-MM-DD)
  lastResetWeekly?: string; // ISO date string (YYYY-MM-DD)
  quotaUpdatedAt?: Date;
}
