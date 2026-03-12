import { Button } from "@workspace/ui/components/button"
import { ChevronDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion"

export const metadata = {
  title: "FAQ | Torii Nihongo",
  description: "Câu hỏi thường gặp về Torii Nihongo",
}

const faqs = [
  {
    question: "Torii Nihongo là gì?",
    answer: "Torii Nihongo là nền tảng học tiếng Nhật toàn diện với các khóa học VOD, lớp học trực tuyến, AI assistant, và flashcard để giúp bạn đạt mục tiêu tiếng Nhật.",
  },
  {
    question: "Tôi có thể bắt đầu từ đâu nếu tôi là người mới?",
    answer: "Nếu bạn là người mới, chúng tôi khuyên bạn nên bắt đầu với khóa N5. Khóa này sẽ dạy bạn những kiến thức cơ bản về hiragana, katakana, và các từ vựng/ngữ pháp cơ bản.",
  },
  {
    question: "Các khóa học có bao lâu?",
    answer: "Thời gian hoàn thành khóa học tùy thuộc vào tốc độ học của bạn. Trung bình, học viên mất 3-6 tháng để hoàn thành một khóa học JLPT.",
  },
  {
    question: "Tôi có thể truy cập khóa học mãi mãi không?",
    answer: "Có, bất kỳ khóa VOD nào bạn mua đều có thể truy cập vô thời hạn. Bạn có thể bất cứ lúc nào quay lại ôn tập.",
  },
  {
    question: "Có hỗ trợ sau khi tôi mua khóa học không?",
    answer: "Có, chúng tôi cung cấp hỗ trợ qua email, chat, và có các lớp học trực tuyến hàng tuần nơi bạn có thể đặt câu hỏi với giáo viên.",
  },
  {
    question: "Tôi có cần có kiến thức tiếng Nhật trước không?",
    answer: "Không cần. Tất cả các khóa của chúng tôi đều được thiết kế cho người mới bắt đầu hoặc người có kiến thức cơ bản.",
  },
  {
    question: "Làm cách nào tôi có thể theo dõi tiến độ của mình?",
    answer: "Bạn có thể xem tiến độ học trong bảng điều khiển của mình. Chúng tôi cung cấp các bài kiểm tra, bài tập, và thống kê chi tiết.",
  },
  {
    question: "Có AI assistant tích hợp không?",
    answer: "Có! Torii AI là một Japanese language tutor AI được huấn luyện đặc biệt. Bạn có thể trò chuyện với nó bất cứ lúc nào để luyện tập tiếng Nhật.",
  },
]

export default function FAQPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground font-space">
              Câu Hỏi Thường Gặp
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Tìm câu trả lời cho những thắc mắc về Torii Nihongo
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                  <span className="text-base font-semibold text-foreground">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 bg-card rounded-lg p-8 text-center border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-3">Vẫn còn câu hỏi?</h3>
            <p className="text-muted-foreground mb-6">
              Hãy liên hệ với chúng tôi qua email hoặc chat trực tuyến
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-8">
              Liên Hệ Chúng Tôi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
