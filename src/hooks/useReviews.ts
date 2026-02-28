import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MooringReview {
    id: string;
    mooring_id: string;
    user_id: string;
    booking_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles?: {
        full_name: string | null;
    };
}

export interface UserRating {
    id: string;
    booking_id: string;
    reviewer_id: string;
    reviewed_user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
}

export interface CreateMooringReviewInput {
    mooring_id: string;
    booking_id: string;
    rating: number;
    comment?: string;
}

export interface CreateUserRatingInput {
    booking_id: string;
    reviewed_user_id: string;
    rating: number;
    comment?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function handleDuplicateError(error: { code?: string; message: string }): never {
    if (error.code === '23505') {
        throw new Error('Već ste ostavili ocjenu za ovu rezervaciju.');
    }
    throw new Error(error.message);
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetch all reviews for a specific mooring, newest first. */
export function useMooringReviews(mooringId: string) {
    return useQuery<MooringReview[]>({
        queryKey: ['mooring-reviews', mooringId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select('*, profiles(full_name)')
                .eq('mooring_id', mooringId)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return (data as MooringReview[]) ?? [];
        },
        enabled: !!mooringId,
    });
}

/** Check if the current user already reviewed a specific booking. */
export function useHasReviewedBooking(bookingId: string) {
    const { user } = useAuth();

    return useQuery<boolean>({
        queryKey: ['has-reviewed', bookingId, user?.id],
        queryFn: async () => {
            if (!user || !bookingId) return false;

            const { data, error } = await supabase
                .from('reviews')
                .select('id')
                .eq('booking_id', bookingId)
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw new Error(error.message);
            return !!data;
        },
        enabled: !!user && !!bookingId,
    });
}

/** Fetch all user ratings (provider → guest) for a specific user. */
export function useUserRatings(userId: string) {
    return useQuery<UserRating[]>({
        queryKey: ['user-ratings', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_ratings')
                .select('*')
                .eq('reviewed_user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return (data as UserRating[]) ?? [];
        },
        enabled: !!userId,
    });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Guest submits a review for a mooring after a completed stay. */
export function useCreateMooringReview() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateMooringReviewInput) => {
            if (!user) throw new Error('Morate biti prijavljeni da biste ostavili recenziju.');

            const { data, error } = await supabase
                .from('reviews')
                .insert({
                    mooring_id: input.mooring_id,
                    booking_id: input.booking_id,
                    user_id: user.id,
                    rating: input.rating,
                    comment: input.comment ?? null,
                })
                .select()
                .single();

            if (error) handleDuplicateError(error);
            return data as MooringReview;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['mooring-reviews', data.mooring_id] });
            queryClient.invalidateQueries({ queryKey: ['has-reviewed', data.booking_id] });
            queryClient.invalidateQueries({ queryKey: ['moorings'] });
        },
    });
}

/** Provider submits a rating for a guest after checkout. */
export function useCreateUserRating() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateUserRatingInput) => {
            if (!user) throw new Error('Morate biti prijavljeni da biste ocijenili gosta.');

            const { data, error } = await supabase
                .from('user_ratings')
                .insert({
                    booking_id: input.booking_id,
                    reviewer_id: user.id,
                    reviewed_user_id: input.reviewed_user_id,
                    rating: input.rating,
                    comment: input.comment ?? null,
                })
                .select()
                .single();

            if (error) handleDuplicateError(error);
            return data as UserRating;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['user-ratings', data.reviewed_user_id] });
        },
    });
}
