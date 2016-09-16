-- Function: public.login(text, text)

-- DROP FUNCTION public.login(text, text);

CREATE OR REPLACE FUNCTION public.login(
    email text,
    pass text)
  RETURNS basic_auth.jwt_claims AS
$BODY$
declare
  _role name;
  result basic_auth.jwt_claims;
  _person_id integer;
begin
  select basic_auth.user_role(email, pass) into _role;
  if _role is null then
    raise invalid_password using message = 'invalid user or password';
  end if;

  select id into _person_id from persons where persons.login_email = login.email limit 1;
  -- TODO; check verified flag if you care whether users
  -- have validated their emails
  select _role as role, login.email as email,null, _person_id as person_id into result;
  return result;
end;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION public.login(text, text)
  OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.login(text, text) TO public;
GRANT EXECUTE ON FUNCTION public.login(text, text) TO postgres;
GRANT EXECUTE ON FUNCTION public.login(text, text) TO anon;
