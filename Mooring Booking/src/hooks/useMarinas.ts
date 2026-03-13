import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface MarinaApplication {
  id: string;
  marina_name: string;
  location: string;
  contact_name: string;
  email: string;
  phone: string;
  number_of_berths: number;
  current_system?: string;
  website?: string;
  white_label?: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at?: string;
  user_id?: string;
}

export function useMarinaApplications() {
  return useQuery({
    queryKey: ["marina-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marina_applications")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MarinaApplication[];
    },
  });
}

export function useUpdateMarinaStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => {
      const { error } = await supabase
        .from("marina_applications")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marina-applications"] });
    },
  });
}
