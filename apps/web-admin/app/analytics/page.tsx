export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform performance and insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
          <p className="text-3xl font-bold mt-2">1,234</p>
          <p className="text-xs text-green-500 mt-1">+18% this month</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Active Learners</h3>
          <p className="text-3xl font-bold mt-2">892</p>
          <p className="text-xs text-muted-foreground mt-1">72% engagement</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Course Completion</h3>
          <p className="text-3xl font-bold mt-2">68%</p>
          <p className="text-xs text-green-500 mt-1">+5% improvement</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Avg. Study Time</h3>
          <p className="text-3xl font-bold mt-2">2.5h</p>
          <p className="text-xs text-muted-foreground mt-1">Per user/day</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Advanced analytics dashboard coming soon...</p>
      </div>
    </div>
  );
}
