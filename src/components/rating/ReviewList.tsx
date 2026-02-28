import { Loader2, MessageSquare } from 'lucide-react';
import { useMooringReviews } from '@/hooks/useReviews';
import StarRating from './StarRating';

interface ReviewListProps {
    mooringId: string;
}

const ReviewList = ({ mooringId }: ReviewListProps) => {
    const { data: reviews, isLoading, error } = useMooringReviews(mooringId);

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary" size={24} />
            </div>
        );
    }

    if (error) {
        return (
            <p className="text-sm text-destructive py-4">Greška pri učitavanju recenzija.</p>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <MessageSquare size={32} className="opacity-40" />
                <p className="text-sm">Nema još recenzija.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div
                    key={review.id}
                    className="border border-border rounded-xl p-4 bg-background hover:shadow-sm transition-shadow"
                >
                    <div className="flex items-start justify-between gap-4">
                        {/* Reviewer info */}
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-ocean flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                                {(review.profiles?.full_name ?? 'G').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-sm leading-tight">
                                    {review.profiles?.full_name ?? 'Anonimni gost'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString('hr-HR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                        {/* Stars */}
                        <StarRating value={review.rating} readonly size="sm" />
                    </div>

                    {review.comment && (
                        <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
                            {review.comment}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
