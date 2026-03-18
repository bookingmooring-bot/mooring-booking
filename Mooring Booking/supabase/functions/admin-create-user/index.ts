import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Auth: only admins can call this ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a regular client to verify the caller is an admin
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller }, error: callerErr } = await supabaseClient.auth.getUser();
    if (callerErr || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if caller has admin role in profiles table
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role, is_admin")
      .eq("id", caller.id)
      .single();

    if (!profile || (profile.role !== "admin" && !profile.is_admin)) {
      return new Response(JSON.stringify({ error: "Forbidden: Admins only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Parse body ---
    const body = await req.json();
    const { email, password, full_name, action, user_id } = body;

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- Handle different actions ---
    if (action === "delete" && user_id) {
      // Delete/ban a user
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, message: "User deleted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      // List all users from profiles
      const { data: users, error } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, role, is_admin, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: create a new user
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "email and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation for invite users
      user_metadata: { full_name: full_name || "" },
    });

    if (createError) throw createError;

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: newUser.user?.id, email: newUser.user?.email },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
