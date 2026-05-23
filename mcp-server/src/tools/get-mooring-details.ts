import { z } from 'zod';
import { supabase } from '../supabase.js';

export const getMooringDetailsSchema = z.object({
  mooringId: z.string().uuid().describe('UUID of the mooring'),
});

export type GetMooringDetailsInput = z.infer<typeof getMooringDetailsSchema>;

export async function getMooringDetails(input: GetMooringDetailsInput) {
  const { data: mooring, error } = await supabase
    .from('moorings')
    .select('*')
    .eq('id', input.mooringId)
    .single();

  if (error || !mooring) {
    throw new Error(`Mooring not found: ${input.mooringId}`);
  }

  return mooring;
}
