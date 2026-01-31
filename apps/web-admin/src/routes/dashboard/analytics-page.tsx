import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { TrendingUp } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-sans font-bold italic uppercase tracking-wide">
          <TrendingUp className="size-3.5" />
          Thông tin Chi tiết
        </div>
        <h1 className="text-3xl md:text-5xl font-sans font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
          Phân tích <span className="text-primary not-italic">Nền tảng</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
          Chỉ số hiệu suất và sử dụng nền tảng chi tiết Torii
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl col-span-2">
          <CardHeader>
            <CardTitle>Lưu lượng Nền tảng</CardTitle>
            <CardDescription>Người dùng hoạt động hàng ngày trong 30 ngày qua</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-2xl border border-dashed border-muted text-muted-foreground">
              [Biểu đồ Lưu lượng]
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

