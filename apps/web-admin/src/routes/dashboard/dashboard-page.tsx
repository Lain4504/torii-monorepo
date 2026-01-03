export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Torii Learning Management System</p>
        </div>
        
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">+18%</span>
            </div>
            <p className="text-3xl font-bold mt-2">1,234</p>
            <p className="text-xs text-muted-foreground mt-1">892 active learners</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Courses</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">45 total</span>
            </div>
            <p className="text-3xl font-bold mt-2">38</p>
            <p className="text-xs text-muted-foreground mt-1">Published courses</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">+12%</span>
            </div>
            <p className="text-3xl font-bold mt-2">$45,231</p>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">System Status</h3>
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <p className="text-3xl font-bold mt-2 text-green-500">Healthy</p>
            <p className="text-xs text-muted-foreground mt-1">All services online</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground">New user registered:</span>
              <span className="font-medium">John Doe</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Course published:</span>
              <span className="font-medium">Advanced React Patterns</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-muted-foreground">Payment received:</span>
              <span className="font-medium">$149.99</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <button className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors">
              <span className="text-2xl">👤</span>
              <span className="text-sm font-medium">Add New User</span>
            </button>
            <button className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors">
              <span className="text-2xl">📚</span>
              <span className="text-sm font-medium">Create Course</span>
            </button>
            <button className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors">
              <span className="text-2xl">📊</span>
              <span className="text-sm font-medium">View Analytics</span>
            </button>
            <button className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors">
              <span className="text-2xl">📝</span>
              <span className="text-sm font-medium">Manage Blog</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
