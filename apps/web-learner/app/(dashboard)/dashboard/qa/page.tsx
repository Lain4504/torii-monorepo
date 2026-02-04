'use client'

import { useState } from 'react'
import { QAFeed } from '@/components/qa/qa-feed'
import { QASidebar } from '@/components/qa/qa-sidebar'

export default function QAPage() {
    const [activeTab, setActiveTab] = useState('ALL')
    const [followedTags, setFollowedTags] = useState<string[]>([])
    const [showFollowingSelector, setShowFollowingSelector] = useState(false)
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
        setSearchQuery('') // Clear search when selecting tag
        // When a tag is selected, switch to ALL tab to show filtered results
        if (tag) {
            setActiveTab('ALL')
        }
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setShowFollowingSelector(tab === 'FOLLOWING')
        setSortBy(undefined) // Reset sort when changing tabs
        setSelectedTag(undefined) // Clear tag filter when changing tabs
        setSearchQuery('') // Clear search when changing tabs
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
                    <QAFeed
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
                    <QASidebar
                        activeCategory={activeTab}
                        onSortChange={handleSortChange}
                        onSearch={handleSearch}
                    />
                </div>
            </div>
        </div>
    )
}
