// Gamification System - Badge Definitions and Streak Logic

export type BadgeCategory = 'achievement' | 'milestone' | 'challenge' | 'seasonal';

export interface Badge {
    id: string;
    name: string;
    emoji: string;
    description: string;
    category: BadgeCategory;
}

export interface GamificationState {
    earnedBadges: string[];  // Badge IDs
    currentStreak: number;
    longestStreak: number;
    lastStreakDate: string | null;  // ISO date string
}

export const DEFAULT_GAMIFICATION_STATE: GamificationState = {
    earnedBadges: [],
    currentStreak: 0,
    longestStreak: 0,
    lastStreakDate: null,
};

// All available badges
export const BADGES: Badge[] = [
    // Achievement Badges
    { id: 'first_saver', name: 'First Saver', emoji: '🌱', description: 'First day under budget', category: 'achievement' },
    { id: 'week_warrior', name: 'Week Warrior', emoji: '⚡', description: '7-day under-budget streak', category: 'achievement' },
    { id: 'fortnight_fighter', name: 'Fortnight Fighter', emoji: '🔥', description: '14-day streak', category: 'achievement' },
    { id: 'month_master', name: 'Month Master', emoji: '🏅', description: '30-day streak', category: 'achievement' },
    { id: 'quarter_champion', name: 'Quarter Champion', emoji: '💫', description: '90-day streak', category: 'achievement' },
    { id: 'goal_getter', name: 'Goal Getter', emoji: '🎯', description: 'Completed first savings goal', category: 'achievement' },
    { id: 'budget_boss', name: 'Budget Boss', emoji: '👑', description: 'Entire month under budget', category: 'achievement' },
    { id: 'early_bird', name: 'Early Bird', emoji: '🚀', description: 'Logged expense before 9 AM', category: 'achievement' },

    // Milestone Badges
    { id: 'bronze_saver', name: 'Bronze Saver', emoji: '🥉', description: '₹1,000 total saved', category: 'milestone' },
    { id: 'silver_saver', name: 'Silver Saver', emoji: '🥈', description: '₹5,000 total saved', category: 'milestone' },
    { id: 'gold_saver', name: 'Gold Saver', emoji: '🥇', description: '₹10,000 total saved', category: 'milestone' },
    { id: 'diamond_saver', name: 'Diamond Saver', emoji: '💎', description: '₹25,000 total saved', category: 'milestone' },
    { id: 'platinum_elite', name: 'Platinum Elite', emoji: '👑', description: '₹50,000 total saved', category: 'milestone' },
    { id: 'lakh_legend', name: 'Lakh Legend', emoji: '🏆', description: '₹1,00,000 total saved', category: 'milestone' },
    { id: 'ten_percent_club', name: '10% Club', emoji: '📈', description: 'Saved 10% of monthly income', category: 'milestone' },
    { id: 'twenty_percent_pro', name: '20% Pro', emoji: '📊', description: 'Saved 20% of monthly income', category: 'milestone' },
    { id: 'thirty_percent_champion', name: '30% Champion', emoji: '💪', description: 'Saved 30% of monthly income', category: 'milestone' },
    { id: 'emergency_ready', name: 'Emergency Ready', emoji: '🛡️', description: 'Emergency fund = 3 months expenses', category: 'milestone' },
    { id: 'fortress_built', name: 'Fortress Built', emoji: '🏰', description: 'Emergency fund = 6 months expenses', category: 'milestone' },

    // Challenge Badges
    { id: 'weekend_warrior', name: 'Weekend Warrior', emoji: '🌙', description: 'Under budget Sat + Sun', category: 'challenge' },
    { id: 'perfect_week', name: 'Perfect Week', emoji: '🏆', description: 'All 7 days under budget', category: 'challenge' },
    { id: 'no_takeout_champion', name: 'No Takeout Champion', emoji: '🍕', description: '7 days without food delivery', category: 'challenge' },
    { id: 'coffee_cutter', name: 'Coffee Cutter', emoji: '☕', description: '7 days without café spending', category: 'challenge' },
    { id: 'shopping_stopper', name: 'Shopping Stopper', emoji: '🛒', description: 'No impulse shopping for 14 days', category: 'challenge' },
    { id: 'entertainment_economist', name: 'Entertainment Economist', emoji: '🎬', description: 'Entertainment under ₹500 for a month', category: 'challenge' },
    { id: 'zero_day_hero', name: 'Zero Day Hero', emoji: '🚫', description: 'A day with ₹0 spent', category: 'challenge' },
    { id: 'triple_zero', name: 'Triple Zero', emoji: '🌟', description: '3 consecutive zero-spend days', category: 'challenge' },
    { id: 'first_week_finisher', name: 'First Week Finisher', emoji: '📅', description: 'Under budget first 7 days of month', category: 'challenge' },
    { id: 'month_end_master', name: 'Month End Master', emoji: '🎊', description: 'Under budget last 7 days of month', category: 'challenge' },
    { id: 'biggest_saver', name: 'Biggest Saver', emoji: '💸', description: 'Personal best daily savings', category: 'challenge' },
    { id: 'comeback_king', name: 'Comeback King', emoji: '🔄', description: 'Recovered from overspending day', category: 'challenge' },
    { id: 'financial_scholar', name: 'Financial Scholar', emoji: '🎓', description: 'Used the app for 30 days straight', category: 'challenge' },

    // Seasonal Badges
    { id: 'diwali_discipline', name: 'Diwali Discipline', emoji: '🪔', description: 'Under budget during Diwali week', category: 'seasonal' },
    { id: 'holiday_hero', name: 'Holiday Hero', emoji: '🎄', description: 'Under budget during December', category: 'seasonal' },
    { id: 'new_year_ninja', name: 'New Year Ninja', emoji: '🎉', description: 'Under budget first week of January', category: 'seasonal' },
    { id: 'valentine_saver', name: 'Valentine Saver', emoji: '💕', description: 'Under budget on Feb 14th', category: 'seasonal' },
];

export function getBadgeById(id: string): Badge | undefined {
    return BADGES.find(b => b.id === id);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
    return BADGES.filter(b => b.category === category);
}

// Context needed to evaluate badge eligibility
export interface BadgeCheckContext {
    currentStreak: number;
    longestStreak: number;
    totalSaved: number;  // Cumulative daily savings
    monthlyIncome: number;
    monthlySavings: number;
    emergencyFund: number;
    monthlyExpenses: number;
    hasCompletedGoal: boolean;
    hasZeroSpendDay: boolean;
    consecutiveZeroSpendDays: number;
    hasWeekendUnderBudget: boolean;
    earnedBadges: string[];
}

// Check which new badges the user is eligible for
export function checkBadgeEligibility(context: BadgeCheckContext): string[] {
    const newBadges: string[] = [];
    const { earnedBadges } = context;

    // Helper to check if already earned
    const notEarned = (id: string) => !earnedBadges.includes(id);

    // === ACHIEVEMENT BADGES ===

    // First Saver - First day under budget (streak >= 1)
    if (notEarned('first_saver') && context.currentStreak >= 1) {
        newBadges.push('first_saver');
    }

    // Week Warrior - 7-day streak
    if (notEarned('week_warrior') && context.currentStreak >= 7) {
        newBadges.push('week_warrior');
    }

    // Fortnight Fighter - 14-day streak
    if (notEarned('fortnight_fighter') && context.currentStreak >= 14) {
        newBadges.push('fortnight_fighter');
    }

    // Month Master - 30-day streak
    if (notEarned('month_master') && context.currentStreak >= 30) {
        newBadges.push('month_master');
    }

    // Quarter Champion - 90-day streak
    if (notEarned('quarter_champion') && context.currentStreak >= 90) {
        newBadges.push('quarter_champion');
    }

    // Goal Getter - Completed a savings goal
    if (notEarned('goal_getter') && context.hasCompletedGoal) {
        newBadges.push('goal_getter');
    }

    // === MILESTONE BADGES ===

    // Bronze Saver - ₹1,000 saved
    if (notEarned('bronze_saver') && context.totalSaved >= 1000) {
        newBadges.push('bronze_saver');
    }

    // Silver Saver - ₹5,000 saved
    if (notEarned('silver_saver') && context.totalSaved >= 5000) {
        newBadges.push('silver_saver');
    }

    // Gold Saver - ₹10,000 saved
    if (notEarned('gold_saver') && context.totalSaved >= 10000) {
        newBadges.push('gold_saver');
    }

    // Diamond Saver - ₹25,000 saved
    if (notEarned('diamond_saver') && context.totalSaved >= 25000) {
        newBadges.push('diamond_saver');
    }

    // Platinum Elite - ₹50,000 saved
    if (notEarned('platinum_elite') && context.totalSaved >= 50000) {
        newBadges.push('platinum_elite');
    }

    // Lakh Legend - ₹1,00,000 saved
    if (notEarned('lakh_legend') && context.totalSaved >= 100000) {
        newBadges.push('lakh_legend');
    }

    // 10% Club - Saved 10% of monthly income
    if (notEarned('ten_percent_club') && context.monthlySavings >= context.monthlyIncome * 0.1) {
        newBadges.push('ten_percent_club');
    }

    // 20% Pro - Saved 20% of monthly income
    if (notEarned('twenty_percent_pro') && context.monthlySavings >= context.monthlyIncome * 0.2) {
        newBadges.push('twenty_percent_pro');
    }

    // 30% Champion - Saved 30% of monthly income
    if (notEarned('thirty_percent_champion') && context.monthlySavings >= context.monthlyIncome * 0.3) {
        newBadges.push('thirty_percent_champion');
    }

    // Emergency Ready - 3 months expenses
    if (notEarned('emergency_ready') && context.emergencyFund >= context.monthlyExpenses * 3) {
        newBadges.push('emergency_ready');
    }

    // Fortress Built - 6 months expenses
    if (notEarned('fortress_built') && context.emergencyFund >= context.monthlyExpenses * 6) {
        newBadges.push('fortress_built');
    }

    // === CHALLENGE BADGES ===

    // Zero Day Hero - A day with ₹0 spent
    if (notEarned('zero_day_hero') && context.hasZeroSpendDay) {
        newBadges.push('zero_day_hero');
    }

    // Triple Zero - 3 consecutive zero-spend days
    if (notEarned('triple_zero') && context.consecutiveZeroSpendDays >= 3) {
        newBadges.push('triple_zero');
    }

    // Weekend Warrior - Under budget Sat + Sun
    if (notEarned('weekend_warrior') && context.hasWeekendUnderBudget) {
        newBadges.push('weekend_warrior');
    }

    // Perfect Week - 7 days under budget (same as week_warrior for now)
    if (notEarned('perfect_week') && context.currentStreak >= 7) {
        newBadges.push('perfect_week');
    }

    return newBadges;
}