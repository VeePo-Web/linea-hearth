CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_terms_accepted_at timestamptz;
  v_account_security_ack_at timestamptz;
BEGIN
  BEGIN
    v_terms_accepted_at := NULLIF(NEW.raw_user_meta_data ->> 'terms_accepted_at', '')::timestamptz;
  EXCEPTION WHEN OTHERS THEN
    v_terms_accepted_at := NULL;
  END;
  BEGIN
    v_account_security_ack_at := NULLIF(NEW.raw_user_meta_data ->> 'account_security_ack_at', '')::timestamptz;
  EXCEPTION WHEN OTHERS THEN
    v_account_security_ack_at := NULL;
  END;

  INSERT INTO public.profiles (id, email, full_name, terms_accepted_at, account_security_ack_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    v_terms_accepted_at,
    v_account_security_ack_at
  )
  ON CONFLICT (id) DO UPDATE
    SET terms_accepted_at = COALESCE(public.profiles.terms_accepted_at, EXCLUDED.terms_accepted_at),
        account_security_ack_at = COALESCE(public.profiles.account_security_ack_at, EXCLUDED.account_security_ack_at);
  RETURN NEW;
END;
$function$;