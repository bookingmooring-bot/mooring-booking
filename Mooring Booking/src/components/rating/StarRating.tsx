import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
    sm: 14,
    md: 20,
    lg: 28,
};

const StarRating = ({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) => {
    const [hovered, setHovered] = useState(0);
    const px = sizeMap[size];
    const effective = hovered || value;

    return (
        <div className="flex items-center gap-0.5" role={readonly ? undefined : 'group'} aria-label={readonly ? `Rating: ${value} out of 5` : 'Select rating'}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onChange?.(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    className={cn(
                        'transition-transform duration-100',
                        !readonly && 'cursor-pointer hover:scale-110',
                        readonly && 'cursor-default pointer-events-none',
                    )}
                    aria-label={readonly ? undefined : `${star} star${star !== 1 ? 's' : ''}`}
                >
                    <Star
                        size={px}
                        className={cn(
                            'transition-colors duration-100',
                            star <= effective
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-transparent text-muted-foreground/40',
                            !readonly && star <= (hovered || 0) && 'text-yellow-300',
                        )}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
