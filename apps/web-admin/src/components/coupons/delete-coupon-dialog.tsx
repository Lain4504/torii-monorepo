import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import { Loader2, Trash } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteCoupon } from "@/api/services/coupons";
import { type CouponResponseDTO } from '@workspace/schemas';

interface DeleteCouponDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    coupon: CouponResponseDTO;
}

export function DeleteCouponDialog({ open, onOpenChange, coupon }: DeleteCouponDialogProps) {
    const deleteMutation = useDeleteCoupon();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(coupon.id);
            toast.success('Đã xóa coupon', {
                description: `Mã ${coupon.code} đã được xóa thành công.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Xóa thất bại', {
                description: 'Đã xảy ra lỗi khi xóa coupon. Vui lòng thử lại.',
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-2xl border-border/50 shadow-2xl bg-background max-w-sm">
                <AlertDialogHeader className="space-y-3">
                    <div className="size-12 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 text-rose-600 mb-2">
                        <Trash className="size-6" />
                    </div>
                    <AlertDialogTitle className="text-xl font-serif font-bold italic tracking-tight uppercase">
                        Xóa Coupon?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground/80 leading-relaxed font-medium">
                        Bạn có chắc chắn muốn xóa mã giảm giá <span className="font-bold text-foreground font-mono">{coupon.code}</span> không?
                        <br />
                        <span className="text-xs mt-2 block opacity-70">
                            Hành động này không thể hoàn tác nếu coupon chưa được sử dụng. Coupon đã sử dụng sẽ được lưu trữ.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel 
                        className="rounded-xl h-10 px-6 text-xs font-bold uppercase tracking-wider"
                        disabled={deleteMutation.isPending}
                    >
                        Hủy Bỏ
                    </AlertDialogCancel>
                    <Button 
                        variant="destructive"
                        className="rounded-xl h-10 px-6 text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xóa...
                            </>
                        ) : (
                            'Xóa Ngay'
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
