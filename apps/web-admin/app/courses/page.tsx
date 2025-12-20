export default function CoursesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground mt-1">Manage courses and learning content</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Courses</h3>
          <p className="text-3xl font-bold mt-2">45</p>
          <p className="text-xs text-muted-foreground mt-1">+3 from last month</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Published</h3>
          <p className="text-3xl font-bold mt-2">38</p>
          <p className="text-xs text-green-500 mt-1">84% active</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Draft</h3>
          <p className="text-3xl font-bold mt-2">7</p>
          <p className="text-xs text-muted-foreground mt-1">Pending review</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Enrollments</h3>
          <p className="text-3xl font-bold mt-2">1,234</p>
          <p className="text-xs text-muted-foreground mt-1">Across all courses</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Course management features coming soon...</p>
      </div>
    </div>
  );
}
