"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/hooks/use-app';
import { BADGES, Badge, BadgeCategory } from '@/lib/gamification';
import { Flame, Lock, CheckCircle2 } from 'lucide-react';
import { SmartDailyBriefing } from '@/components/ui/smart-daily-briefing';
import { RecentAchievements } from '@/components/ui/recent-achievements';

export default function BadgesPage() {
    const { profile, getCurrentStreak } = useApp();

    const earnedBadgeIds = profile?.gamification?.earnedBadges || [];
    const currentStreak = getCurrentStreak();
    const longestStreak = profile?.gamification?.longestStreak || 0;

    // Check if badge is earned from user's actual data
    const isBadgeEarned = (badgeId: string) => earnedBadgeIds.includes(badgeId);
    const displayEarnedCount = earnedBadgeIds.length;

    const getBadgesByCategory = (category: BadgeCategory) =>
        BADGES.filter(b => b.category === category);

    const categories: { key: BadgeCategory; label: string }[] = [
        { key: 'achievement', label: 'Achievements' },
        { key: 'milestone', label: 'Milestones' },
        { key: 'challenge', label: 'Challenges' },
        { key: 'seasonal', label: 'Seasonal' },
    ];

    return (
        <div className="space-y-6">
            {/* Header with title and streak stats in same row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Badges</h1>
                    <p className="text-muted-foreground">Your achievements and milestones</p>
                </div>
                <div className="flex gap-3">
                    <Card className="bg-orange-500/10 border-orange-500/20">
                        <CardContent className="py-3 px-4 flex items-center gap-3">
                            <Flame className="h-6 w-6 text-orange-500" />
                            <div className="text-center">
                                <p className="text-2xl font-bold text-orange-500">{currentStreak}</p>
                                <p className="text-xs text-muted-foreground whitespace-nowrap">Current Streak</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-primary/10 border-primary/20">
                        <CardContent className="py-3 px-4 flex items-center gap-3">
                            <Flame className="h-6 w-6 text-primary" />
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{longestStreak}</p>
                                <p className="text-xs text-muted-foreground whitespace-nowrap">Best Streak</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Progress summary */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="font-medium">
                                {displayEarnedCount} of {BADGES.length} badges earned
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {((displayEarnedCount / BADGES.length) * 100).toFixed(0)}% complete
                        </div>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all"
                            style={{ width: `${(displayEarnedCount / BADGES.length) * 100}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Badge categories */}
            <Tabs defaultValue="achievement" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    {categories.map(cat => (
                        <TabsTrigger key={cat.key} value={cat.key} className="text-xs md:text-sm">
                            {cat.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {categories.map(cat => (
                    <TabsContent key={cat.key} value={cat.key} className="mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {getBadgesByCategory(cat.key).map(badge => (
                                <BadgeCard
                                    key={badge.id}
                                    badge={badge}
                                    isEarned={isBadgeEarned(badge.id)}
                                />
                            ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

function BadgeCard({ badge, isEarned }: { badge: Badge; isEarned: boolean }) {
    return (
        <Card className={`transition-all h-full ${isEarned
            ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50'
            : 'bg-muted/30 border-muted grayscale opacity-60'
            }`}>
            <CardContent className="py-5 px-3 flex flex-col items-center text-center h-full justify-between">
                <div className="flex flex-col items-center">
                    <div className={`text-4xl mb-2 ${isEarned ? '' : 'opacity-50'}`}>
                        {isEarned ? badge.emoji : <Lock className="h-8 w-8 text-muted-foreground" />}
                    </div>
                    <h3 className={`font-semibold text-sm leading-tight ${isEarned ? '' : 'text-muted-foreground'}`}>
                        {badge.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                        {badge.description}
                    </p>
                </div>
                {isEarned && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-green-500 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        Earned
                    </div>
                )}
            </CardContent>
        </Card>
    );
}