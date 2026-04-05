import { Button } from '@workspace/ui/components/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@workspace/ui/components/accordion'

const faqs = [
    {
        question: 'Torii Nihongo la gi?',
        answer: 'Torii Nihongo la nen tang hoc tieng Nhat toan dien voi khoa hoc, AI assistant va he thong luyen tap thuc hanh.',
    },
    {
        question: 'Nguoi moi co the bat dau tu dau?',
        answer: 'Ban co the bat dau tu lo trinh N5 voi kien thuc nen tang, tu vung va ngu phap co ban.',
    },
    {
        question: 'Toi co the xem noi dung khi chua dang nhap khong?',
        answer: 'Co. Ban van co the xem dashboard va cac trang gioi thieu. Khi thao tac tinh nang hoc tap, he thong se yeu cau dang nhap.',
    },
    {
        question: 'Toi theo doi tien do hoc tap nhu the nao?',
        answer: 'Sau khi dang nhap, ban co the xem tien do, lich su hoc va thanh tich ngay trong dashboard.',
    },
]

export default function DashboardFAQPage() {
    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Câu hỏi thường gặp</h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    Tong hop thong tin nhanh ve lo trinh hoc, cach su dung va ho tro tren Torii Nihongo.
                </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 text-center">
                <p className="mb-4 text-sm text-muted-foreground">Can them ho tro? Dang nhap de tao yeu cau ho tro nhanh.</p>
                <Button data-requires-auth="true">Tao yeu cau ho tro</Button>
            </div>
        </div>
    )
}
