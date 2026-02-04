'use client'

import { useState } from 'react'
import { useLeaderboard } from '@/apis/services/gamification-api'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { useAppSelector } from '@/hooks/hooks'

// Import extracted components
import {
    LeaderboardHeader,
    PodiumCard,
    CurrentUserRank,
    LeaderboardTable
} from '@/components/dashboard/leaderboard'

export default function LeaderboardPage() {
    const [leaderboardType, setLeaderboardType] = useState<'global' | 'streak'>('global')
    const { data: leaderboard, isLoading } = useLeaderboard(leaderboardType)
    const { user: currentUser } = useAppSelector((state) => state.auth)

    if (isLoading) {
        return <PageLoading text="Đang tải bảng xếp hạng..." />
    }

    const topThree = leaderboard?.users?.slice(0, 3) || []
    const others = leaderboard?.users?.slice(3) || []

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500">
            <LeaderboardHeader
                type={leaderboardType}
                onTypeChange={setLeaderboardType}
            />

            {/* Podium Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12 relative h-[400px] md:h-auto">
                {topThree.length >= 2 && (
                    <PodiumCard
                        user={topThree[1]!}
                        rank={2}
                        isCurrentUser={topThree[1]!.id === currentUser?.id}
                        type={leaderboardType}
                    />
                )}
                {topThree.length >= 1 && (
                    <PodiumCard
                        user={topThree[0]!}
                        rank={1}
                        isCurrentUser={topThree[0]!.id === currentUser?.id}
                        type={leaderboardType}
                    />
                )}
                {topThree.length >= 3 && (
                    <PodiumCard
                        user={topThree[2]!}
                        rank={3}
                        isCurrentUser={topThree[2]!.id === currentUser?.id}
                        type={leaderboardType}
                    />
                )}
            </div>

            {/* Current User Summary Card */}
            {leaderboard?.currentUser && (
                <CurrentUserRank
                    user={leaderboard.currentUser}
                    type={leaderboardType}
                />
            )}

            {/* Leaderboard Table */}
            <LeaderboardTable
                users={others}
                currentUserId={currentUser?.id}
                type={leaderboardType}
            />
        </div>
    )
}
