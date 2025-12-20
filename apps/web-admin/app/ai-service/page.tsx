export default function AIServicePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Service</h1>
        <p className="text-muted-foreground mt-1">Manage AI-powered features and content generation</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">AI Requests</h3>
          <p className="text-3xl font-bold mt-2">5,678</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Content Generated</h3>
          <p className="text-3xl font-bold mt-2">1,234</p>
          <p className="text-xs text-green-500 mt-1">Questions, summaries</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">API Status</h3>
          <p className="text-3xl font-bold mt-2 text-green-500">Online</p>
          <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Usage Cost</h3>
          <p className="text-3xl font-bold mt-2">$234</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">AI service management features coming soon...</p>
      </div>
    </div>
  );
}
