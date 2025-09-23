import { createClient } from 'npm:@supabase/supabase-js@2.47.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create regular client to verify user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;

    // Start deletion process - order matters due to foreign key constraints
    console.log(`Starting account deletion for user: ${userId}`);

    // 1. Delete project history entries
    const { error: projectHistoryError } = await supabaseAdmin
      .from('project_history')
      .delete()
      .eq('contributor_id', userId);

    if (projectHistoryError) {
      console.error('Error deleting project history:', projectHistoryError);
    }

    // 2. Delete project participants
    const { error: projectParticipantsError } = await supabaseAdmin
      .from('project_participants')
      .delete()
      .eq('user_id', userId);

    if (projectParticipantsError) {
      console.error('Error deleting project participants:', projectParticipantsError);
    }

    // 3. Delete projects created by user
    const { error: projectsError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('created_by', userId);

    if (projectsError) {
      console.error('Error deleting projects:', projectsError);
    }

    // 4. Delete transactions created by user
    const { error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('created_by', userId);

    if (transactionsError) {
      console.error('Error deleting transactions:', transactionsError);
    }

    // 5. Delete budgets created by user
    const { error: budgetsError } = await supabaseAdmin
      .from('budgets')
      .delete()
      .eq('created_by', userId);

    if (budgetsError) {
      console.error('Error deleting budgets:', budgetsError);
    }

    // 6. Delete user settings
    const { error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .delete()
      .eq('user_id', userId);

    if (settingsError) {
      console.error('Error deleting user settings:', settingsError);
    }

    // 7. Remove user from family memberships
    const { error: familyMembersError } = await supabaseAdmin
      .from('family_members')
      .delete()
      .eq('user_id', userId);

    if (familyMembersError) {
      console.error('Error deleting family memberships:', familyMembersError);
    }

    // 8. Delete families created by user (this will cascade to family_members)
    const { error: familiesError } = await supabaseAdmin
      .from('families')
      .delete()
      .eq('created_by', userId);

    if (familiesError) {
      console.error('Error deleting families:', familiesError);
    }

    // 9. Delete user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // 10. Finally, delete the user from auth.users
    const { error: userDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (userDeleteError) {
      console.error('Error deleting user from auth:', userDeleteError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to delete user account", 
          details: userDeleteError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Successfully deleted account for user: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account successfully deleted" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in delete-account function:', error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});