export default function AssessmentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <p className="text-muted-foreground mt-1">Manage quizzes, tests, and assignments</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Assessments</h3>
          <p className="text-3xl font-bold mt-2">156</p>
          <p className="text-xs text-muted-foreground mt-1">Across all courses</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
          <p className="text-3xl font-bold mt-2">89</p>
          <p className="text-xs text-green-500 mt-1">Currently available</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Submissions</h3>
          <p className="text-3xl font-bold mt-2">2,345</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Avg. Score</h3>
          <p className="text-3xl font-bold mt-2">78%</p>
          <p className="text-xs text-muted-foreground mt-1">Platform average</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Assessment management features coming soon...</p>
      </div>
    </div>
  );
}
