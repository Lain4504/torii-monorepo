import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Analytics</h2>
        <p className="text-muted-foreground">Detailed platform performance and utilization metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl col-span-2">
          <CardHeader>
            <CardTitle>Platform Traffic</CardTitle>
            <CardDescription>Daily active users over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-2xl border border-dashed border-muted text-muted-foreground">
              [Traffic Chart Placeholder]
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

