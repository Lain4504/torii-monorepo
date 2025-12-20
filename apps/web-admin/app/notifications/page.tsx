export default function NotificationsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">Manage system notifications and announcements</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Sent</h3>
          <p className="text-3xl font-bold mt-2">12,345</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
          <p className="text-3xl font-bold mt-2">23</p>
          <p className="text-xs text-muted-foreground mt-1">In queue</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Delivery Rate</h3>
          <p className="text-3xl font-bold mt-2">98%</p>
          <p className="text-xs text-green-500 mt-1">Successfully delivered</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Read Rate</h3>
          <p className="text-3xl font-bold mt-2">76%</p>
          <p className="text-xs text-muted-foreground mt-1">User engagement</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Notification management features coming soon...</p>
      </div>
    </div>
  );
}
