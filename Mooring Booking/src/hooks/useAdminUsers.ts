import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface BetaUser {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  is_admin: boolean;
  created_at: string;
}

async function callAdminUserFn(body: Record<string, unknown>) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

export function useAdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<BetaUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await callAdminUserFn({ action: "list" });
      setUsers(data.users ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (email: string, password: string, full_name: string) => {
    setCreating(true);
    try {
      await callAdminUserFn({ email, password, full_name });
      toast({
        title: "✅ User created!",
        description: `${email} can now log in with the password you set.`,
      });
      await fetchUsers(); // refresh list
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      toast({ title: "Error", description: message, variant: "destructive" });
      return { success: false };
    } finally {
      setCreating(false);
    }
  };

  const deleteUser = async (userId: string, email: string) => {
    try {
      await callAdminUserFn({ action: "delete", user_id: userId });
      toast({ title: "User removed", description: `${email} has been deleted.` });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return { users, loading, creating, fetchUsers, createUser, deleteUser };
}
