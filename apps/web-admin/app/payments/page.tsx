export default function PaymentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Payments & Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Manage payments, subscriptions, and billing</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">$45,231</p>
          <p className="text-xs text-green-500 mt-1">+12% from last month</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
          <p className="text-3xl font-bold mt-2">892</p>
          <p className="text-xs text-muted-foreground mt-1">Current subscribers</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">This Month</h3>
          <p className="text-3xl font-bold mt-2">$12,450</p>
          <p className="text-xs text-muted-foreground mt-1">New transactions</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Failed Payments</h3>
          <p className="text-3xl font-bold mt-2">7</p>
          <p className="text-xs text-red-500 mt-1">Requires attention</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Payment management features coming soon...</p>
      </div>
    </div>
  );
}
