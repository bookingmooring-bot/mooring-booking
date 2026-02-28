import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StarRating from './StarRating';
import { useCreateUserRating } from '@/hooks/useReviews';

const schema = z.object({
    rating: z.number().min(1, 'Odaberite ocjenu od 1 do 5.').max(5),
    comment: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RateGuestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingId: string;
    guestUserId: string;
    guestName: string;
}

const RateGuestModal = ({
    open,
    onOpenChange,
    bookingId,
    guestUserId,
    guestName,
}: RateGuestModalProps) => {
    const { toast } = useToast();
    const createRating = useCreateUserRating();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { rating: 0, comment: '' },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            await createRating.mutateAsync({
                booking_id: bookingId,
                reviewed_user_id: guestUserId,
                rating: values.rating,
                comment: values.comment || undefined,
            });
            toast({ title: 'Ocjena gosta je zabilježena! ⭐' });
            reset();
            onOpenChange(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Greška pri ocjenjivanju.';
            const isDuplicate = message.includes('Već ste');
            toast({
                title: isDuplicate ? 'Već ste ocijenili gosta' : 'Greška',
                description: isDuplicate
                    ? 'Već ste ostavili ocjenu za ovu rezervaciju.'
                    : message,
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ocijeni gosta — {guestName}</DialogTitle>
                    <DialogDescription>
                        Kako ocjenjuješ gosta koji je boravio kod tebe? Tvoja ocjena pomaže izgradi pouzdanu zajednicu.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    {/* Star picker */}
                    <div className="space-y-2">
                        <Label>Ocjena *</Label>
                        <Controller
                            name="rating"
                            control={control}
                            render={({ field }) => (
                                <StarRating value={field.value} onChange={field.onChange} size="lg" />
                            )}
                        />
                        {errors.rating && (
                            <p className="text-sm text-destructive">{errors.rating.message}</p>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="guest-comment">Komentar (neobavezno)</Label>
                        <Textarea
                            id="guest-comment"
                            placeholder="Opiši kako se gost ponašao, briga o vezu, komunikacija..."
                            rows={4}
                            {...register('comment')}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Odustani
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-ocean"
                            disabled={createRating.isPending}
                        >
                            {createRating.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
                            Pošalji ocjenu
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RateGuestModal;
