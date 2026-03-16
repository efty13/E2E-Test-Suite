export type Theme = 'light' | 'dark';
export type Language = 'tr' | 'en';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface UserPreferences {
  theme: Theme;
  language: Language;
  notifications: NotificationPreferences;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'tr',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
};
