import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import type { UserResponseDTO } from '@workspace/schemas';
import { Loader2, User, Mail, ShieldCheck, X, Activity, UserCog } from 'lucide-react';
import { userAdminUpdateDTOSchema, type UserAdminUpdateDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateUser } from "@/api/services/users.ts";
import { cn } from '@workspace/ui/lib/utils';

type UpdateUserFormData = UserAdminUpdateDTO;

interface EditUserSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserResponseDTO | null;
}

export function EditUserSheet({
    open,
    onOpenChange,
    user,
}: EditUserSheetProps) {
    const updateUser = useUpdateUser();
    const {
        control,
        handleSubmit,
    } = useForm<UpdateUserFormData>({
        resolver: zodResolver(userAdminUpdateDTOSchema),
        values: user ? {
            displayName: user.displayName,
            email: user.email,
            role: user.role as any,
        } : undefined,
    });

    const handleFormSubmit = async (data: UpdateUserFormData) => {
        if (!user) return;
        try {
            await updateUser.mutateAsync({
                id: user.id,
                user: data,
            });
            toast.success('User Updated', {
                description: `User details have been updated.`,
            });
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
            toast.error('Update Failed', {
                description: errorMessage,
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] p-0 flex flex-col overflow-hidden bg-background border-l border-border/50 shadow-2xl">
                {/* Header */}
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/10 bg-muted/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative flex items-center gap-4 z-10">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-inner">
                            <UserCog className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <SheetTitle className="text-2xl font-medium tracking-tight">
                                Edit <span className="text-primary italic">User</span>
                            </SheetTitle>
                            <SheetDescription className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
                                Update profile and access permissions
                            </SheetDescription>
                        </div>
                        <div className="p-2 bg-background rounded-full border border-border/40 text-muted-foreground">
                            <Activity className="size-4 animate-pulse text-primary" />
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden relative z-10" noValidate>
                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1">
                        <div className="px-8 py-10 space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                            {/* Section Header */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                        Basic Information
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Controller
                                    control={control}
                                    name="displayName"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-3 group">
                                            <FieldLabel htmlFor={field.name} className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-primary transition-colors">
                                                <User className="size-3" />
                                                Full Name
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="DISPLAY NAME"
                                                aria-invalid={fieldState.invalid}
                                                className={cn(
                                                    "h-14 px-5 rounded-lg bg-muted/10 border-border/40 hover:bg-muted/20 focus-visible:ring-primary/20",
                                                    "text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                                )}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-3 group">
                                            <FieldLabel htmlFor={field.name} className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-primary transition-colors">
                                                <Mail className="size-3" />
                                                Email Address
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="EMAIL ADDRESS"
                                                type="email"
                                                aria-invalid={fieldState.invalid}
                                                className={cn(
                                                    "h-14 px-5 rounded-lg bg-muted/10 border-border/40 hover:bg-muted/20 focus-visible:ring-primary/20",
                                                    "text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                                )}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="role"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid} className="space-y-3 group">
                                            <FieldLabel htmlFor={field.name} className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-primary transition-colors">
                                                <ShieldCheck className="size-3" />
                                                User Role
                                            </FieldLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger
                                                    id={field.name}
                                                    aria-invalid={fieldState.invalid}
                                                    className={cn(
                                                        "h-14 px-5 rounded-lg bg-muted/10 border-border/40 hover:bg-muted/20 focus:ring-primary/20",
                                                        "text-sm font-bold uppercase transition-all"
                                                    )}
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="border-border/40 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-lg overflow-hidden p-2">
                                                    <SelectItem value="learner" className="rounded-lg px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">LEARNER</SelectItem>
                                                    <SelectItem value="lecturer" className="rounded-lg px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">LECTURER</SelectItem>
                                                    <SelectItem value="staff" className="rounded-lg px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">STAFF</SelectItem>
                                                    <SelectItem value="staff-lms" className="rounded-lg px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">LMS STAFF</SelectItem>
                                                    <SelectItem value="staff-support" className="rounded-lg px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">SUPPORT STAFF</SelectItem>
                                                    <SelectItem value="staff-sales" className="rounded-lg px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">SALES STAFF</SelectItem>
                                                    <SelectItem value="admin" className="rounded-lg px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">ADMIN</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />}
                                        </Field>
                                    )}
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Fixed Footer */}
                    <div className="px-8 py-6 bg-background border-t border-border/10 flex items-center justify-between gap-4 relative z-20">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={updateUser.isPending}
                            className="rounded-lg h-12 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/20 group"
                        >
                            <X className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateUser.isPending}
                            className="rounded-lg h-12 px-8 bg-primary text-primary-foreground text-[11px] font-medium uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                        >
                            {updateUser.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
