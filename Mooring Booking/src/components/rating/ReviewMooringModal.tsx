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
import { useCreateMooringReview } from '@/hooks/useReviews';

const schema = z.object({
    rating: z.number().min(1, 'Odaberite ocjenu od 1 do 5.').max(5),
    comment: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ReviewMooringModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mooringId: string;
    bookingId: string;
    mooringName: string;
}

const ReviewMooringModal = ({
    open,
    onOpenChange,
    mooringId,
    bookingId,
    mooringName,
}: ReviewMooringModalProps) => {
    const { toast } = useToast();
    const createReview = useCreateMooringReview();

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
            await createReview.mutateAsync({
                mooring_id: mooringId,
                booking_id: bookingId,
                rating: values.rating,
                comment: values.comment || undefined,
            });
            toast({ title: 'Hvala na recenziji! ⭐' });
            reset();
            onOpenChange(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Greška pri slanju recenzije.';
            const isDuplicate = message.includes('Već ste');
            toast({
                title: isDuplicate ? 'Već ste ostavili recenziju' : 'Greška',
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
                    <DialogTitle>Ocijeni vez — {mooringName}</DialogTitle>
                    <DialogDescription>
                        Podijeli svoje iskustvo s ovim mjestom vezivanja. Tvoja ocjena pomaže ostalim mornarima.
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
                        <Label htmlFor="review-comment">Komentar (neobavezno)</Label>
                        <Textarea
                            id="review-comment"
                            placeholder="Opiši svoje iskustvo — lokacija, pristup, usluga..."
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
                            disabled={createReview.isPending}
                        >
                            {createReview.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
                            Pošalji recenziju
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewMooringModal;
