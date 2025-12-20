export default function RoomsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Virtual Rooms</h1>
        <p className="text-muted-foreground mt-1">Manage virtual classrooms and live sessions</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Rooms</h3>
          <p className="text-3xl font-bold mt-2">28</p>
          <p className="text-xs text-muted-foreground mt-1">Active rooms</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Live Now</h3>
          <p className="text-3xl font-bold mt-2">5</p>
          <p className="text-xs text-green-500 mt-1">Sessions in progress</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Scheduled</h3>
          <p className="text-3xl font-bold mt-2">12</p>
          <p className="text-xs text-muted-foreground mt-1">Upcoming sessions</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Participants</h3>
          <p className="text-3xl font-bold mt-2">234</p>
          <p className="text-xs text-muted-foreground mt-1">Currently online</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Room management features coming soon...</p>
      </div>
    </div>
  );
}
