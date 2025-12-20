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
              <span className="text-muted-foreground">New course published:</span>
              <span className="font-medium">Introduction to React</span>
              <span className="text-muted-foreground text-xs ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">New user registered:</span>
              <span className="font-medium">John Doe</span>
              <span className="text-muted-foreground text-xs ml-auto">5 hours ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-muted-foreground">Assessment submitted:</span>
              <span className="font-medium">Midterm Exam - CS101</span>
              <span className="text-muted-foreground text-xs ml-auto">1 day ago</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-md hover:bg-accent transition-colors">
                + Create New Course
              </button>
              <button className="w-full text-left px-4 py-2 rounded-md hover:bg-accent transition-colors">
                + Add New User
              </button>
              <button className="w-full text-left px-4 py-2 rounded-md hover:bg-accent transition-colors">
                + Schedule Room Session
              </button>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auth Service</span>
                <span className="text-xs text-green-500 font-medium">● Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Course Service</span>
                <span className="text-xs text-green-500 font-medium">● Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Service</span>
                <span className="text-xs text-green-500 font-medium">● Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Service</span>
                <span className="text-xs text-green-500 font-medium">● Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
