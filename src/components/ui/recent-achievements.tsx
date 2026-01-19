"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/hooks/use-app';
import { getBadgeById } from '@/lib/gamification';
import { Trophy, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function RecentAchievements() {
    const { profile } = useApp();

    const earnedBadges = profile?.gamification?.earnedBadges || [];

    // Get last 3 earned badges
    const recentBadges = earnedBadges
        .slice(-3)
        .reverse()
        .map(id => getBadgeById(id))
        .filter(Boolean);

    if (recentBadges.length === 0) {
        return null; // Don't show if no badges earned
    }

    return (
        <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/20 overflow-hidden">
            <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500/20 rounded-lg">
                            <Trophy className="h-4 w-4 text-amber-500" />
                        </div>
                        <h3 className="font-semibold text-sm">Recent Achievements</h3>
                        <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                    </div>
                    <Link href="/badges">
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                            View All <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                    </Link>
                </div>

                <div className="flex gap-3">
                    {recentBadges.map((badge) => badge && (
                        <div
                            key={badge.id}
                            className="flex-1 p-3 rounded-lg bg-background/50 border border-border/50 flex flex-col items-center text-center"
                        >
                            <span className="text-2xl mb-1">{badge.emoji}</span>
                            <span className="text-xs font-medium leading-tight">{badge.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}