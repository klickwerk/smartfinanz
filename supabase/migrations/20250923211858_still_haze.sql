/*
  # Update invite_family_member function to support user invitations

  1. Function Updates
    - Add p_user_id parameter to accept the user ID directly
    - Remove user existence check (handled client-side)
    - Simplify function to focus on family membership creation
    - Update profile name if provided

  2. Security
    - Maintain admin permission checks
    - Validate role parameter
    - Prevent duplicate family memberships
*/

CREATE OR REPLACE FUNCTION public.invite_family_member(
  p_email text,
  p_family_id uuid,
  p_role text,
  p_name text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_id uuid;
  v_is_admin boolean := false;
  v_user_id uuid;
  v_existing_membership_id uuid;
BEGIN
  -- Get the authenticated user ID
  v_caller_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_caller_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Sie müssen angemeldet sein, um Mitglieder einzuladen.');
  END IF;
  
  -- Validate role parameter
  IF p_role NOT IN ('admin', 'member', 'viewer') THEN
    RETURN json_build_object('success', false, 'error', 'Ungültige Rolle. Erlaubte Rollen: admin, member, viewer.');
  END IF;
  
  -- Check if the caller is an admin of the specified family
  SELECT EXISTS(
    SELECT 1 FROM family_members 
    WHERE family_id = p_family_id 
    AND user_id = v_caller_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN json_build_object('success', false, 'error', 'Nur Administratoren können Familienmitglieder einladen.');
  END IF;
  
  -- Use provided user_id or try to find user by email
  IF p_user_id IS NOT NULL THEN
    v_user_id := p_user_id;
  ELSE
    -- Try to find user by email in profiles table
    SELECT id INTO v_user_id
    FROM profiles
    WHERE email = p_email
    LIMIT 1;
    
    -- If still no user found, return error
    IF v_user_id IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Benutzer nicht gefunden. Bitte stelle sicher, dass der Benutzer registriert ist.');
    END IF;
  END IF;
  
  -- Check if user is already a member of this family
  SELECT id INTO v_existing_membership_id
  FROM family_members
  WHERE family_id = p_family_id AND user_id = v_user_id
  LIMIT 1;
  
  IF v_existing_membership_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Dieser Benutzer ist bereits Mitglied der Familie.');
  END IF;
  
  -- Add user to family
  INSERT INTO family_members (family_id, user_id, role)
  VALUES (p_family_id, v_user_id, p_role);
  
  -- Update profile name if provided
  IF p_name IS NOT NULL AND trim(p_name) != '' THEN
    UPDATE profiles 
    SET full_name = trim(p_name)
    WHERE id = v_user_id;
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Familienmitglied erfolgreich hinzugefügt.',
    'user_id', v_user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Ein Fehler ist aufgetreten: ' || SQLERRM);
END;
$$;