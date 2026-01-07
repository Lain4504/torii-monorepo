export default function RoomsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Virtual Rooms</h1>
        <p className="text-muted-foreground">Manage virtual classrooms and sessions.</p>
      </div>

      <div className="zen-card rounded-2xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Virtual room management interface is currently being optimized for the Zen UI.
          </p>
        </div>
      </div>
    </div>
  )
}
