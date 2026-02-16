'use client'

import { useState } from 'react'
import { Feed } from '@/components/feed/feed'
import { FeedSidebar } from '@/components/feed/feed-sidebar'

export default function FeedPage() {
    const [activeTab, setActiveTab] = useState('ALL')
    const [followedTags] = useState<string[]>([])
    const [_showFollowingSelector, setShowFollowingSelector] = useState(false)
    const [sortBy, setSortBy] = useState<'likes' | 'comments' | undefined>(undefined)
    const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined)
    const [searchQuery, setSearchQuery] = useState<string>('')

    const handleSortChange = (sort: 'likes' | 'comments') => {
        setSortBy(sort)
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
    }

    const handleTagSelect = (tag: string | undefined) => {
        setSelectedTag(tag)
        setSearchQuery('')
        if (tag) {
            setActiveTab('ALL')
        }
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setShowFollowingSelector(tab === 'FOLLOWING')
        setSortBy(undefined)
        setSelectedTag(undefined)
        setSearchQuery('')
    }

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Cộng đồng Torii</h1>
                <p className="text-muted-foreground">
                    Chia sẻ kiến thức, đặt câu hỏi và kết nối với cộng đồng học viên Torii
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* Main Feed */}
                <div className="min-w-0">
                    <Feed
                        category={activeTab}
                        followedTags={activeTab === 'FOLLOWING' ? followedTags : undefined}
                        activeTab={activeTab}
                        sortBy={sortBy}
                        selectedTag={selectedTag}
                        searchQuery={searchQuery}
                        onTagSelect={handleTagSelect}
                        onTabChange={handleTabChange}
                    />
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block">
                    <FeedSidebar
                        activeCategory={activeTab}
                        onSortChange={handleSortChange}
                        onSearch={handleSearch}
                    />
                </div>
            </div>
        </div>
    )
}
