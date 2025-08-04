const localePrefix = 'as-needed' as const;

// Prepify Configuration - Ultimate FREE Digital SAT Question Bank
export const AppConfig = {
  name: 'Prepify',
  description: 'Ultimate FREE Digital SAT Question Bank',
  website: 'https://prepify.xyz',
  locales: [
    {
      id: 'en',
      name: 'English',
    },
    { id: 'fr', name: 'Français' },
  ],
  defaultLocale: 'en',
  localePrefix,
};

export const AllLocales = AppConfig.locales.map(locale => locale.id);

// Prepify is a free SAT question bank - no subscription plans needed
export const PLAN_ID = {
  FREE: 'free',
} as const;
