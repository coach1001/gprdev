-- schemaType: FUNCTION
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
-- This function is different so we'll recreate it:
-- STATEMENT-BEGIN
CREATE OR REPLACE FUNCTION public.log_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
  BEGIN
    NEW.created_at = NOW();
    NEW.created_by = basic_auth.current_email();
    RETURN NEW;
  END;
$function$

-- STATEMENT-END
-- This function is different so we'll recreate it:
-- STATEMENT-BEGIN
CREATE OR REPLACE FUNCTION public.log_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
  BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = basic_auth.current_email();
    RETURN NEW;
  END;
$function$

-- STATEMENT-END
