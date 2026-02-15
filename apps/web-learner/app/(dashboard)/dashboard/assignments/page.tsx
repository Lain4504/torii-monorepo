

export default function AssignmentsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bài tập của tôi</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và theo dõi tiến độ các bài tập được giao
          </p>
        </div>
        {/* TODO: Implement assignments list for all courses */}
        <div className="text-center py-20 border-2 border-dashed border-border/40 rounded-3xl bg-muted/5">
          <p className="text-muted-foreground">
            Trang này đang được phát triển. Vui lòng truy cập bài tập từ trang khóa học.
          </p>
        </div>
      </div>
    </div>
  );
}
