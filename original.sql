--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.10
-- Dumped by pg_dump version 9.5.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: basic_auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA basic_auth;


ALTER SCHEMA basic_auth OWNER TO postgres;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: json_build; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS json_build WITH SCHEMA public;


--
-- Name: EXTENSION json_build; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION json_build IS 'json_build extension';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET search_path = basic_auth, pg_catalog;

--
-- Name: jwt_claims; Type: TYPE; Schema: basic_auth; Owner: postgres
--

CREATE TYPE jwt_claims AS (
	role text,
	email text,
	exp integer,
	person_id integer
);


ALTER TYPE jwt_claims OWNER TO postgres;

SET search_path = public, pg_catalog;

--
-- Name: token_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE token_type_enum AS ENUM (
    'validation',
    'reset'
);


ALTER TYPE token_type_enum OWNER TO postgres;

SET search_path = basic_auth, pg_catalog;

--
-- Name: check_role_exists(); Type: FUNCTION; Schema: basic_auth; Owner: postgres
--

CREATE FUNCTION check_role_exists() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if not exists (select 1 from pg_roles as r where r.rolname = new.role) then
    raise foreign_key_violation using message =
      'unknown database role: ' || new.role;
    return null;
  end if;
  return new;
end
$$;


ALTER FUNCTION basic_auth.check_role_exists() OWNER TO postgres;

--
-- Name: clearance_for_role(name); Type: FUNCTION; Schema: basic_auth; Owner: postgres
--

CREATE FUNCTION clearance_for_role(u name) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  ok boolean;
begin
  select exists (
    select rolname
      from pg_authid
     where pg_has_role(current_user, oid, 'member')
       and rolname = u
  ) into ok;
  if not ok then
    raise invalid_password using message =
      'current user not member of role ' || u;
  end if;
end
$$;


ALTER FUNCTION basic_auth.clearance_for_role(u name) OWNER TO postgres;

--
-- Name: current_email(); Type: FUNCTION; Schema: basic_auth; Owner: postgres
--

CREATE FUNCTION current_email() RETURNS text
    LANGUAGE plpgsql
    AS $$
begin
  return current_setting('postgrest.claims.email');
exception
  -- handle unrecognized configuration parameter error
  when undefined_object then return '';
end;
$$;


ALTER FUNCTION basic_auth.current_email() OWNER TO postgres;

--
-- Name: encrypt_pass(); Type: FUNCTION; Schema: basic_auth; Owner: postgres
--

CREATE FUNCTION encrypt_pass() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if tg_op = 'INSERT' or new.pass <> old.pass then
    new.pass = crypt(new.pass, gen_salt('bf'));
  end if;
  return new;
end
$$;


ALTER FUNCTION basic_auth.encrypt_pass() OWNER TO postgres;

--
-- Name: send_validation(); Type: FUNCTION; Schema: basic_auth; Owner: postgres
--

CREATE FUNCTION send_validation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  tok uuid;
begin
  select uuid_generate_v4() into tok;

  insert into basic_auth.tokens (token, token_type, email)
         values (tok, 'validation', new.email);

  insert into public.email_notifications 
		(email_to, subject, body, token_email, token, token_type)
         values (new.email,'New User Validation','Follow Link Below to Validate New Account:',true,tok,'validation');
 		
  --perform pg_notify('validate',
    --json_build_object(
      --'email', new.email,
      --'token', tok,
      --'token_type', 'validation'
    --)::text
  --);
  return new;
end
$$;


ALTER FUNCTION basic_auth.send_validation() OWNER TO postgres;

--
-- Name: user_role(text, text); Type: FUNCTION; Schema: basic_auth; Owner: postgres
--

CREATE FUNCTION user_role(email text, pass text) RETURNS name
    LANGUAGE plpgsql
    AS $$
begin
  return (
  select role from basic_auth.users
   where users.email = user_role.email
     and users.pass = crypt(user_role.pass, users.pass)
     and users.verified = true
     and users.ldap_user = false
  );
end;
$$;


ALTER FUNCTION basic_auth.user_role(email text, pass text) OWNER TO postgres;

SET search_path = public, pg_catalog;

--
-- Name: call_application_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE call_application_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE call_application_statuses_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: call_application_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE call_application_statuses (
    id integer DEFAULT nextval('call_application_statuses_id_seq'::regclass) NOT NULL,
    status character varying(255) NOT NULL,
    description text NOT NULL
);


ALTER TABLE call_application_statuses OWNER TO postgres;

--
-- Name: TABLE call_application_statuses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE call_application_statuses IS 'The status of a call application.';


--
-- Name: call_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE call_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE call_applications_id_seq OWNER TO postgres;

--
-- Name: call_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE call_applications (
    id integer DEFAULT nextval('call_applications_id_seq'::regclass) NOT NULL,
    call integer,
    amount numeric(20,2),
    applicant integer,
    place integer,
    comments text,
    application_status integer,
    score integer,
    title text,
    pmu_advisory text
);


ALTER TABLE call_applications OWNER TO postgres;

--
-- Name: TABLE call_applications; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE call_applications IS 'A call application is a response to a call from an organisation.';


--
-- Name: rpc_alfresco_change_application_status; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_change_application_status AS
 SELECT call_applications.id AS "projectId",
    call_applications.id AS "projectCode",
    call_applications.title AS "projectTitle",
    call_application_statuses.status AS "projectStatusCode"
   FROM (call_applications
     LEFT JOIN call_application_statuses ON ((call_applications.application_status = call_application_statuses.id)));


ALTER TABLE rpc_alfresco_change_application_status OWNER TO postgres;

--
-- Name: alfresco_change_application_status(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_change_application_status("projectCode" text, "newStatusCode" text) RETURNS SETOF rpc_alfresco_change_application_status
    LANGUAGE plpgsql COST 1
    AS $$
--#variable_conflict use_variable  
DECLARE project_code INTEGER;
BEGIN	
	SET ROLE postgres;
	
        SELECT call_applications.id INTO project_code
        FROM call_applications
        WHERE call_applications.id = alfresco_change_application_status."projectCode"::int;


        IF project_code IS NULL THEN
		RAISE EXCEPTION 'Application does not Exist!';
        END IF;


        UPDATE call_applications SET (application_status) = (alfresco_change_application_status."newStatusCode"::int)
        WHERE call_applications.id = project_code;         

        RETURN QUERY SELECT * FROM rpc_alfresco_change_application_status 
	WHERE  rpc_alfresco_change_application_status."projectId" = project_code;
		       
	--EXCEPTION WHEN OTHERS THEN /*Catch all*/
	--RAISE EXCEPTION 'Something went wrong';	
END;$$;


ALTER FUNCTION public.alfresco_change_application_status("projectCode" text, "newStatusCode" text) OWNER TO postgres;

--
-- Name: rpc_alfresco_create_application_code; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_create_application_code AS
 SELECT call_applications.id AS "projectCode"
   FROM call_applications;


ALTER TABLE rpc_alfresco_create_application_code OWNER TO postgres;

--
-- Name: alfresco_create_application_code(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_create_application_code("callCode" text) RETURNS SETOF rpc_alfresco_create_application_code
    LANGUAGE plpgsql COST 1
    AS $$
DECLARE project_code INTEGER;
DECLARE call_id INTEGER;
BEGIN	
	SET ROLE postgres;
	
        SELECT calls.id INTO call_id
        FROM calls
        WHERE calls.call_reference = "callCode";

        IF call_id IS NULL THEN
		RAISE EXCEPTION 'Call Code Invalid';
        END IF;
 
        INSERT INTO call_applications (call) VALUES (call_id) 
        RETURNING call_applications.id INTO project_code;

        RETURN QUERY SELECT * FROM rpc_alfresco_create_application_code 
	WHERE  rpc_alfresco_create_application_code."projectCode" = project_code;
		       
	--EXCEPTION WHEN OTHERS THEN /*Catch all*/
	--RAISE EXCEPTION 'Something went wrong';	
END;$$;


ALTER FUNCTION public.alfresco_create_application_code("callCode" text) OWNER TO postgres;

--
-- Name: organisations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE organisations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE organisations_id_seq OWNER TO postgres;

--
-- Name: organisations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE organisations (
    id integer DEFAULT nextval('organisations_id_seq'::regclass) NOT NULL,
    code character varying(50),
    name character varying(255) NOT NULL,
    web_site character varying(255),
    vat_no character varying(255),
    npo_no character varying(255),
    cell_phone character varying(255),
    work_phone character varying(255),
    email_address character varying(255),
    fax_no character varying(255),
    street_first_line character varying(255),
    street_second_line character varying(255),
    postal_first_line character varying(255),
    postal_second_line character varying(255),
    suburb integer,
    place integer,
    province integer,
    referee integer,
    auditor integer,
    organisation_type integer,
    organisation_status integer,
    pts_assocode text,
    contact_person character varying(50)
);


ALTER TABLE organisations OWNER TO postgres;

--
-- Name: TABLE organisations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE organisations IS 'An organisation is an institution that operates in the sector.';


--
-- Name: suburbs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE suburbs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE suburbs_id_seq OWNER TO postgres;

--
-- Name: suburbs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE suburbs (
    id integer DEFAULT nextval('suburbs_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    po_box_code character varying(50),
    street_code character varying(50),
    latitude real,
    longitude real,
    province integer,
    place integer
);


ALTER TABLE suburbs OWNER TO postgres;

--
-- Name: TABLE suburbs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE suburbs IS 'A suburb is part of a place with a Street and PO Box code, as defined by SAPO.';


--
-- Name: rpc_alfresco_get_organisations; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_get_organisations AS
 SELECT organisations.id AS "organisationId",
    organisations.code AS "organisationCode",
    organisations.name AS "organisationName",
    organisations.npo_no AS "organisationNPONumber",
    organisations.contact_person AS "organisationContactFullName",
    organisations.cell_phone AS "organisationContactCellphoneNumber",
    organisations.email_address AS "organisationEmailAddress",
    organisations.work_phone AS "organisationTelephoneNumber",
    organisations.fax_no AS "organisationFaxNumber",
    organisations.street_first_line AS "organisationPhysicalAddressLine1",
    organisations.street_second_line AS "organisationPhysicalAddressLine2",
    (organisations.suburb)::text AS "organisationPhysicalAddressSuburbCode",
    (organisations.place)::text AS "organisationPhysicalAddressCityCode",
    (organisations.province)::text AS "organisationPhysicalAddressProvinceCode",
    organisations.postal_first_line AS "organisationPostalAddressLine1",
    organisations.postal_second_line AS "organisationPostalAddressLine2"
   FROM (organisations
     LEFT JOIN suburbs ON ((organisations.suburb = suburbs.id)))
  ORDER BY organisations.name;


ALTER TABLE rpc_alfresco_get_organisations OWNER TO postgres;

--
-- Name: alfresco_create_organisation(text, text, text, text, text, text, text, text, text, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_create_organisation("organisationName" text, "organisationNPONumber" text DEFAULT NULL::text, "organisationContactFullName" text DEFAULT NULL::text, "organisationContactCellphoneNumber" text DEFAULT NULL::text, "organisationEmailAddress" text DEFAULT NULL::text, "organisationTelephoneNumber" text DEFAULT NULL::text, "organisationFaxNumber" text DEFAULT NULL::text, "organisationPhysicalAddressLine1" text DEFAULT NULL::text, "organisationPhysicalAddressLine2" text DEFAULT NULL::text, "organisationPhysicalAddressSuburbCode" text DEFAULT NULL::text, "organisationPhysicalAddressCityCode" text DEFAULT NULL::text, "organisationPhysicalAddressProvinceCode" text DEFAULT NULL::text, "organisationPostalAddressLine1" text DEFAULT NULL::text, "organisationPostalAddressLine2" text DEFAULT NULL::text) RETURNS SETOF rpc_alfresco_get_organisations
    LANGUAGE plpgsql COST 1
    AS $$
--#variable_conflict use_variable
DECLARE organisation_id INTEGER;
DECLARE province_id INTEGER;  
BEGIN	
   
SET ROLE postgres;
province_id := id from provinces where code = alfresco_create_organisation."organisationPhysicalAddressCityCode";

INSERT INTO organisations(
	name,
	npo_no,
	contact_person,
	cell_phone,
	email_address,
	work_phone,
	fax_no,
	street_first_line,
	street_second_line,
	suburb,
	place,
	province,
	postal_first_line,
	postal_second_line
) VALUES (
	alfresco_create_organisation."organisationName",
	alfresco_create_organisation."organisationNPONumber",
	alfresco_create_organisation."organisationContactFullName",
	alfresco_create_organisation."organisationContactCellphoneNumber",
	alfresco_create_organisation."organisationEmailAddress",
	alfresco_create_organisation."organisationTelephoneNumber" ,
	alfresco_create_organisation."organisationFaxNumber",
	alfresco_create_organisation."organisationPhysicalAddressLine1",
	alfresco_create_organisation."organisationPhysicalAddressLine2",
	alfresco_create_organisation."organisationPhysicalAddressSuburbCode"::int,
	alfresco_create_organisation."organisationPhysicalAddressCityCode"::int,
	province_id,
	alfresco_create_organisation."organisationPostalAddressLine1",
	alfresco_create_organisation."organisationPostalAddressLine2"
)
RETURNING organisations.id INTO organisation_id; 

    RETURN QUERY SELECT * FROM rpc_alfresco_get_organisations 
	WHERE  rpc_alfresco_get_organisations."organisationId" = organisation_id;
	
	--EXCEPTION WHEN OTHERS THEN /*Catch all*/
	--RAISE EXCEPTION 'Something went wrong';	
END;$$;


ALTER FUNCTION public.alfresco_create_organisation("organisationName" text, "organisationNPONumber" text, "organisationContactFullName" text, "organisationContactCellphoneNumber" text, "organisationEmailAddress" text, "organisationTelephoneNumber" text, "organisationFaxNumber" text, "organisationPhysicalAddressLine1" text, "organisationPhysicalAddressLine2" text, "organisationPhysicalAddressSuburbCode" text, "organisationPhysicalAddressCityCode" text, "organisationPhysicalAddressProvinceCode" text, "organisationPostalAddressLine1" text, "organisationPostalAddressLine2" text) OWNER TO postgres;

--
-- Name: calls_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE calls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE calls_id_seq OWNER TO postgres;

--
-- Name: calls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE calls (
    id integer DEFAULT nextval('calls_id_seq'::regclass) NOT NULL,
    call_reference character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    call_date date,
    evaluation_date date,
    key_performance_indicator integer,
    admin_compliance_template integer,
    relevance_compliance_template integer,
    assessment_compliance_template integer,
    due_diligence_compliance_template integer
);


ALTER TABLE calls OWNER TO postgres;

--
-- Name: TABLE calls; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE calls IS 'A call is a request for project proposals to support a KPI.';


--
-- Name: key_performance_indicators_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE key_performance_indicators_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE key_performance_indicators_id_seq OWNER TO postgres;

--
-- Name: key_performance_indicators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE key_performance_indicators (
    id integer DEFAULT nextval('key_performance_indicators_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    reporting_period text,
    baseline text,
    remarks text,
    status text,
    key_result_area integer
);


ALTER TABLE key_performance_indicators OWNER TO postgres;

--
-- Name: TABLE key_performance_indicators; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE key_performance_indicators IS 'A key performance indicator (KPI) is a measure of progress in a KRA.';


--
-- Name: key_result_areas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE key_result_areas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE key_result_areas_id_seq OWNER TO postgres;

--
-- Name: key_result_areas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE key_result_areas (
    id integer DEFAULT nextval('key_result_areas_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    programme integer
);


ALTER TABLE key_result_areas OWNER TO postgres;

--
-- Name: TABLE key_result_areas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE key_result_areas IS 'A key result area (KRA) is a component of a programme.';


--
-- Name: programmes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE programmes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE programmes_id_seq OWNER TO postgres;

--
-- Name: programmes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE programmes (
    id integer DEFAULT nextval('programmes_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    start_date date,
    end_date date
);


ALTER TABLE programmes OWNER TO postgres;

--
-- Name: TABLE programmes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE programmes IS 'A programme is a group of projects that have a common outcome.';


--
-- Name: rpc_alfresco_create_application; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_create_application AS
 SELECT call_applications.id AS "projectId",
    call_applications.id AS "projectCode",
    call_applications.title AS "projectTitle",
    programmes.id AS "programmeId",
    programmes.code AS "programmeCode",
    programmes.name AS "programmeName",
    calls.id AS "callId",
    calls.call_reference AS "callCode",
    calls.name AS "callName",
    rpc_alfresco_get_organisations."organisationId",
    rpc_alfresco_get_organisations."organisationCode",
    rpc_alfresco_get_organisations."organisationName",
    rpc_alfresco_get_organisations."organisationContactFullName",
    rpc_alfresco_get_organisations."organisationContactCellphoneNumber",
    rpc_alfresco_get_organisations."organisationEmailAddress",
    rpc_alfresco_get_organisations."organisationTelephoneNumber",
    rpc_alfresco_get_organisations."organisationFaxNumber",
    rpc_alfresco_get_organisations."organisationPhysicalAddressLine1",
    rpc_alfresco_get_organisations."organisationPhysicalAddressLine2",
    rpc_alfresco_get_organisations."organisationPhysicalAddressProvinceCode",
    rpc_alfresco_get_organisations."organisationPhysicalAddressCityCode",
    rpc_alfresco_get_organisations."organisationPhysicalAddressSuburbCode",
    rpc_alfresco_get_organisations."organisationPostalAddressLine1",
    rpc_alfresco_get_organisations."organisationPostalAddressLine2"
   FROM (((((call_applications
     LEFT JOIN calls ON ((call_applications.call = calls.id)))
     LEFT JOIN key_performance_indicators ON ((key_performance_indicators.id = calls.key_performance_indicator)))
     LEFT JOIN key_result_areas ON ((key_performance_indicators.key_result_area = key_result_areas.id)))
     LEFT JOIN programmes ON ((key_result_areas.programme = programmes.id)))
     JOIN rpc_alfresco_get_organisations ON ((call_applications.applicant = rpc_alfresco_get_organisations."organisationId")));


ALTER TABLE rpc_alfresco_create_application OWNER TO postgres;

--
-- Name: alfresco_create_project(text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_create_project("projectCode" text DEFAULT NULL::text, "projectTitle" text DEFAULT NULL::text, "callCode" text DEFAULT NULL::text, "organisationCode" text DEFAULT NULL::text, "projectStatusCode" text DEFAULT NULL::text) RETURNS SETOF rpc_alfresco_create_application
    LANGUAGE plpgsql COST 1
    AS $$
--#variable_conflict use_variable  
DECLARE project_code INTEGER;
DECLARE organisation_id INTEGER;
BEGIN
	SET ROLE postgres;
	
        SELECT call_applications.id INTO project_code
        FROM   call_applications
        WHERE  call_applications.id = alfresco_create_project."projectCode"::int;
	
        organisation_id := id from organisations where code = alfresco_create_project."organisationCode";
	
        IF project_code IS NULL THEN
		--RAISE EXCEPTION 'Application does not Exist!';
		select alfresco_create_application_code."projectCode"::int into project_code
		from alfresco_create_application_code(alfresco_create_project."callCode");
        END IF;
	
        UPDATE call_applications
        SET (
		title,
		applicant
	) = (
		alfresco_create_project."projectTitle",
		organisation_id
	)
	
        WHERE  call_applications.id = project_code;
        RETURN QUERY SELECT * FROM rpc_alfresco_create_application
	WHERE  rpc_alfresco_create_application."projectId" = project_code;
	
	--EXCEPTION WHEN OTHERS THEN /*Catch all*/
	--RAISE EXCEPTION 'Something went wrong';	
END;$$;


ALTER FUNCTION public.alfresco_create_project("projectCode" text, "projectTitle" text, "callCode" text, "organisationCode" text, "projectStatusCode" text) OWNER TO postgres;

--
-- Name: rpc_alfresco_get_calls; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_get_calls AS
 SELECT calls.id AS "callId",
    calls.call_reference AS "callCode",
    calls.name AS "callName",
    key_performance_indicators.id AS "keyPerformanceIndicatorId",
    key_performance_indicators.code AS "keyPerformanceIndicatorCode",
    key_performance_indicators.name AS "keyPerformanceIndicatorName",
    key_result_areas.id AS "keyResultAreaId",
    key_result_areas.code AS "keyResultAreaCode",
    key_result_areas.name AS "keyResultAreaName",
    programmes.id AS "programmeId",
    programmes.code AS "programmeCode",
    programmes.name AS "programmeName"
   FROM (((calls
     LEFT JOIN key_performance_indicators ON ((calls.key_performance_indicator = key_performance_indicators.id)))
     LEFT JOIN key_result_areas ON ((key_result_areas.id = key_performance_indicators.key_result_area)))
     LEFT JOIN programmes ON ((key_result_areas.programme = programmes.id)));


ALTER TABLE rpc_alfresco_get_calls OWNER TO postgres;

--
-- Name: alfresco_get_calls(integer, text, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_get_calls("callId" integer DEFAULT NULL::integer, "callCode" text DEFAULT NULL::text, "programmeId" integer DEFAULT NULL::integer, "programmeCode" text DEFAULT NULL::text) RETURNS SETOF rpc_alfresco_get_calls
    LANGUAGE plpgsql COST 1 ROWS 50
    AS $$
--#variable_conflict use_variable   
BEGIN
	SET ROLE postgres;
	
        RETURN QUERY SELECT * FROM rpc_alfresco_get_calls 
	WHERE 
		rpc_alfresco_get_calls."callId" = COALESCE(alfresco_get_calls."callId",rpc_alfresco_get_calls."callId")
	AND 	rpc_alfresco_get_calls."callCode" = COALESCE(alfresco_get_calls."callCode",rpc_alfresco_get_calls."callCode")
	AND 	rpc_alfresco_get_calls."programmeId" = COALESCE(alfresco_get_calls."programmeId",rpc_alfresco_get_calls."programmeId")
	AND 	rpc_alfresco_get_calls."programmeCode" = COALESCE(alfresco_get_calls."programmeCode",rpc_alfresco_get_calls."programmeCode")
	ORDER BY rpc_alfresco_get_calls."callId";
        

	--EXCEPTION WHEN OTHERS THEN 
	--RAISE EXCEPTION 'Something went wrong';	
END;
$$;


ALTER FUNCTION public.alfresco_get_calls("callId" integer, "callCode" text, "programmeId" integer, "programmeCode" text) OWNER TO postgres;

--
-- Name: places_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE places_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE places_id_seq OWNER TO postgres;

--
-- Name: places; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE places (
    id integer DEFAULT nextval('places_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    province integer
);


ALTER TABLE places OWNER TO postgres;

--
-- Name: TABLE places; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE places IS 'A place is a city or town, as defined by SAPO.';


--
-- Name: provinces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE provinces_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE provinces_id_seq OWNER TO postgres;

--
-- Name: provinces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE provinces (
    id integer DEFAULT nextval('provinces_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE provinces OWNER TO postgres;

--
-- Name: TABLE provinces; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE provinces IS 'A province is one of the 9 provinces in the country.';


--
-- Name: rpc_alfresco_get_places; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_get_places AS
 SELECT places.id AS "placesId",
    places.name AS "placesName",
    provinces.id AS "provinceId",
    provinces.code AS "provinceCode",
    provinces.name AS "provinceName"
   FROM (places
     JOIN provinces ON ((places.province = provinces.id)))
  ORDER BY places.name;


ALTER TABLE rpc_alfresco_get_places OWNER TO postgres;

--
-- Name: rpc_alfresco_get_cities; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_get_cities AS
 SELECT rpc_alfresco_get_places."placesId" AS "cityId",
    (rpc_alfresco_get_places."placesId")::text AS "cityCode",
    rpc_alfresco_get_places."placesName" AS "cityName",
    rpc_alfresco_get_places."provinceId",
    rpc_alfresco_get_places."provinceCode",
    rpc_alfresco_get_places."provinceName"
   FROM rpc_alfresco_get_places
  ORDER BY rpc_alfresco_get_places."placesName";


ALTER TABLE rpc_alfresco_get_cities OWNER TO postgres;

--
-- Name: alfresco_get_cities(integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_get_cities("provinceId" integer DEFAULT NULL::integer, "provinceCode" text DEFAULT NULL::text) RETURNS SETOF rpc_alfresco_get_cities
    LANGUAGE plpgsql COST 1 ROWS 50
    AS $$
--#variable_conflict use_variable   
BEGIN
	SET ROLE postgres;
		
        RETURN QUERY SELECT * FROM rpc_alfresco_get_cities 
	WHERE 
	 	rpc_alfresco_get_cities."provinceId" = COALESCE(alfresco_get_cities."provinceId",rpc_alfresco_get_cities."provinceId")
	AND 	rpc_alfresco_get_cities."provinceCode" = COALESCE(alfresco_get_cities."provinceCode",rpc_alfresco_get_cities."provinceCode")
	ORDER BY rpc_alfresco_get_cities."provinceCode";
        
	--EXCEPTION WHEN OTHERS THEN /*Catch all*/
	--RAISE EXCEPTION 'Something went wrong';	
END;
$$;


ALTER FUNCTION public.alfresco_get_cities("provinceId" integer, "provinceCode" text) OWNER TO postgres;

--
-- Name: alfresco_get_organisations(integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_get_organisations("organisationId" integer DEFAULT NULL::integer, "organisationCode" text DEFAULT NULL::text) RETURNS SETOF rpc_alfresco_get_organisations
    LANGUAGE plpgsql COST 1 ROWS 50
    AS $$
--#variable_conflict use_variable   
BEGIN
	SET ROLE postgres;
	
        RETURN QUERY SELECT * FROM rpc_alfresco_get_organisations 
	WHERE 
	rpc_alfresco_get_organisations."organisationId" = COALESCE(alfresco_get_organisations."organisationId",rpc_alfresco_get_organisations."organisationId")
	AND rpc_alfresco_get_organisations."organisationCode" = COALESCE(alfresco_get_organisations."organisationCode",rpc_alfresco_get_organisations."organisationCode")
	ORDER BY rpc_alfresco_get_organisations."organisationName";
        

--	EXCEPTION WHEN OTHERS THEN /*Catch all*/
--	RAISE EXCEPTION 'Something went wrong';	
END;
$$;


ALTER FUNCTION public.alfresco_get_organisations("organisationId" integer, "organisationCode" text) OWNER TO postgres;

--
-- Name: alfresco_get_places(integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_get_places("provinceId" integer DEFAULT NULL::integer, "provinceCode" text DEFAULT NULL::text) RETURNS SETOF rpc_alfresco_get_places
    LANGUAGE plpgsql COST 1 ROWS 50
    AS $$
--#variable_conflict use_variable   
BEGIN
	SET ROLE postgres;
		
        RETURN QUERY SELECT * FROM rpc_alfresco_get_places 
	WHERE 
	 	rpc_alfresco_get_places."provinceId" = COALESCE(alfresco_get_places."provinceId",rpc_alfresco_get_places."provinceId")
	AND 	rpc_alfresco_get_places."provinceCode" = COALESCE(alfresco_get_places."provinceCode",rpc_alfresco_get_places."provinceCode")
	ORDER BY rpc_alfresco_get_places."provinceCode";
        
	--EXCEPTION WHEN OTHERS THEN /*Catch all*/
	--RAISE EXCEPTION 'Something went wrong';	
END;
$$;


ALTER FUNCTION public.alfresco_get_places("provinceId" integer, "provinceCode" text) OWNER TO postgres;

--
-- Name: rpc_alfresco_get_programmes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_get_programmes AS
 SELECT programmes.id AS "programmeId",
    programmes.code AS "programmeCode",
    programmes.name AS "programmeName"
   FROM programmes;


ALTER TABLE rpc_alfresco_get_programmes OWNER TO postgres;

--
-- Name: alfresco_get_programmes(integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_get_programmes("programmeId" integer DEFAULT NULL::integer, "programmeCode" text DEFAULT NULL::text) RETURNS SETOF rpc_alfresco_get_programmes
    LANGUAGE plpgsql COST 1 ROWS 50
    AS $$
--#variable_conflict use_variable   
BEGIN
	SET ROLE postgres;
	
        RETURN QUERY SELECT * FROM rpc_alfresco_get_programmes 
	WHERE 
	 	rpc_alfresco_get_programmes."programmeId" = COALESCE(alfresco_get_programmes."programmeId",rpc_alfresco_get_programmes."programmeId")
	AND 	rpc_alfresco_get_programmes."programmeCode" = COALESCE(alfresco_get_programmes."programmeCode",rpc_alfresco_get_programmes."programmeCode")
	ORDER BY rpc_alfresco_get_programmes."programmeCode";
        

	--EXCEPTION WHEN OTHERS THEN /*Catch all*/
	--RAISE EXCEPTION 'Something went wrong';	
END;
$$;


ALTER FUNCTION public.alfresco_get_programmes("programmeId" integer, "programmeCode" text) OWNER TO postgres;

--
-- Name: rpc_alfresco_get_project_statuses; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_get_project_statuses AS
 SELECT call_application_statuses.id AS "projectStatusId",
    (call_application_statuses.status)::character varying(50) AS "projectStatusCode",
    call_application_statuses.description AS "projectStatusName"
   FROM call_application_statuses
  ORDER BY call_application_statuses.id;


ALTER TABLE rpc_alfresco_get_project_statuses OWNER TO postgres;

--
-- Name: alfresco_get_project_statuses(integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_get_project_statuses("projectStatusId" integer DEFAULT NULL::integer, "projectStatusCode" text DEFAULT NULL::text) RETURNS SETOF rpc_alfresco_get_project_statuses
    LANGUAGE plpgsql COST 1 ROWS 50
    AS $$
--#variable_conflict use_variable   
BEGIN
	SET ROLE postgres;
	
        RETURN QUERY SELECT * FROM rpc_alfresco_get_project_statuses 
	WHERE 
	rpc_alfresco_get_project_statuses."projectStatusId" = COALESCE(alfresco_get_project_statuses."projectStatusId",rpc_alfresco_get_project_statuses."projectStatusId")
	AND rpc_alfresco_get_project_statuses."projectStatusCode" = COALESCE(alfresco_get_project_statuses."projectStatusCode",rpc_alfresco_get_project_statuses."projectStatusCode")
	ORDER BY rpc_alfresco_get_project_statuses."projectStatusId";
        

--	EXCEPTION WHEN OTHERS THEN /*Catch all*/
--	RAISE EXCEPTION 'Something went wrong';	
END;
$$;


ALTER FUNCTION public.alfresco_get_project_statuses("projectStatusId" integer, "projectStatusCode" text) OWNER TO postgres;

--
-- Name: rpc_alfresco_get_projects; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_get_projects AS
 SELECT call_applications.id AS "projectId",
    (call_applications.id)::text AS "projectCode",
    call_applications.title AS "projectTitle",
    rpc_alfresco_get_calls."programmeId",
    rpc_alfresco_get_calls."programmeCode",
    rpc_alfresco_get_calls."programmeName",
    rpc_alfresco_get_calls."callId",
    rpc_alfresco_get_calls."callCode",
    rpc_alfresco_get_calls."callName",
    rpc_alfresco_get_organisations."organisationId",
    rpc_alfresco_get_organisations."organisationCode",
    rpc_alfresco_get_organisations."organisationName",
    rpc_alfresco_get_organisations."organisationContactFullName",
    rpc_alfresco_get_organisations."organisationContactCellphoneNumber",
    rpc_alfresco_get_organisations."organisationEmailAddress",
    rpc_alfresco_get_organisations."organisationTelephoneNumber",
    rpc_alfresco_get_organisations."organisationFaxNumber",
    rpc_alfresco_get_organisations."organisationPhysicalAddressLine1",
    rpc_alfresco_get_organisations."organisationPhysicalAddressLine2",
    rpc_alfresco_get_organisations."organisationPhysicalAddressProvinceCode",
    rpc_alfresco_get_organisations."organisationPhysicalAddressCityCode",
    rpc_alfresco_get_organisations."organisationPhysicalAddressSuburbCode",
    rpc_alfresco_get_organisations."organisationPostalAddressLine1",
    rpc_alfresco_get_organisations."organisationPostalAddressLine2",
    call_application_statuses.id AS "projectStatusId",
    call_application_statuses.status AS "projectStatusCode",
    call_application_statuses.description AS "projectStatusName"
   FROM (((call_applications
     LEFT JOIN rpc_alfresco_get_calls ON ((call_applications.call = rpc_alfresco_get_calls."callId")))
     LEFT JOIN rpc_alfresco_get_organisations ON ((call_applications.applicant = rpc_alfresco_get_organisations."organisationId")))
     LEFT JOIN call_application_statuses ON ((call_applications.application_status = call_application_statuses.id)))
  ORDER BY rpc_alfresco_get_calls."programmeName", call_applications.id;


ALTER TABLE rpc_alfresco_get_projects OWNER TO postgres;

--
-- Name: alfresco_get_projects(integer, text, integer, text, integer, text, integer, text, integer, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_get_projects("projectId" integer DEFAULT NULL::integer, "projectCode" text DEFAULT NULL::text, "programmeId" integer DEFAULT NULL::integer, "programmeCode" text DEFAULT NULL::text, "callId" integer DEFAULT NULL::integer, "callCode" text DEFAULT NULL::text, "organisationId" integer DEFAULT NULL::integer, "organisationCode" text DEFAULT NULL::text, "projectStatusId" integer DEFAULT NULL::integer, "projectStatusCode" text DEFAULT NULL::text, "projectStatusName" text DEFAULT NULL::text) RETURNS SETOF rpc_alfresco_get_projects
    LANGUAGE plpgsql COST 1
    AS $$
--#variable_conflict use_variable   
BEGIN

	SET ROLE postgres;
	
        RETURN QUERY SELECT * FROM rpc_alfresco_get_projects 
	WHERE 
		rpc_alfresco_get_projects."projectId" = COALESCE(alfresco_get_projects."projectId",rpc_alfresco_get_projects."projectId")
	AND 	rpc_alfresco_get_projects."projectCode" = COALESCE(alfresco_get_projects."projectCode",rpc_alfresco_get_projects."projectCode")
	
	AND 	rpc_alfresco_get_projects."programmeId" = COALESCE(alfresco_get_projects."programmeId",rpc_alfresco_get_projects."programmeId")
	AND 	rpc_alfresco_get_projects."programmeCode" = COALESCE(alfresco_get_projects."programmeCode",rpc_alfresco_get_projects."programmeCode")

	AND 	rpc_alfresco_get_projects."callId" = COALESCE(alfresco_get_projects."callId",rpc_alfresco_get_projects."callId")
	AND 	rpc_alfresco_get_projects."callCode" = COALESCE(alfresco_get_projects."callCode",rpc_alfresco_get_projects."callCode")

	AND 	rpc_alfresco_get_projects."organisationId" = COALESCE(alfresco_get_projects."organisationId",rpc_alfresco_get_projects."organisationId")
	AND 	rpc_alfresco_get_projects."organisationCode" = COALESCE(alfresco_get_projects."organisationCode",rpc_alfresco_get_projects."organisationCode")

	AND 	rpc_alfresco_get_projects."projectStatusId" = COALESCE(alfresco_get_projects."projectStatusId",rpc_alfresco_get_projects."projectStatusId")
	AND 	rpc_alfresco_get_projects."projectStatusCode" = COALESCE(alfresco_get_projects."projectStatusCode",rpc_alfresco_get_projects."projectStatusCode")
	AND 	rpc_alfresco_get_projects."projectStatusName" = COALESCE(alfresco_get_projects."projectStatusName",rpc_alfresco_get_projects."projectStatusName");
	
	--EXCEPTION WHEN OTHERS THEN /*Catch all*/
	--RAISE EXCEPTION 'Something went wrong';	
END;
$$;


ALTER FUNCTION public.alfresco_get_projects("projectId" integer, "projectCode" text, "programmeId" integer, "programmeCode" text, "callId" integer, "callCode" text, "organisationId" integer, "organisationCode" text, "projectStatusId" integer, "projectStatusCode" text, "projectStatusName" text) OWNER TO postgres;

--
-- Name: rpc_alfresco_get_provinces; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_get_provinces AS
 SELECT provinces.id AS "provinceId",
    provinces.code AS "provinceCode",
    provinces.name AS "provinceName"
   FROM provinces
  ORDER BY provinces.code;


ALTER TABLE rpc_alfresco_get_provinces OWNER TO postgres;

--
-- Name: alfresco_get_provinces(integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_get_provinces("provinceId" integer DEFAULT NULL::integer, "provinceCode" text DEFAULT NULL::text) RETURNS SETOF rpc_alfresco_get_provinces
    LANGUAGE plpgsql COST 1 ROWS 50
    AS $$
--#variable_conflict use_variable   
BEGIN
	SET ROLE postgres;
	
        RETURN QUERY SELECT * FROM rpc_alfresco_get_provinces 
	WHERE 
	 	rpc_alfresco_get_provinces."provinceId" = COALESCE(alfresco_get_provinces."provinceId",rpc_alfresco_get_provinces."provinceId")
	AND 	rpc_alfresco_get_provinces."provinceCode" = COALESCE(alfresco_get_provinces."provinceCode",rpc_alfresco_get_provinces."provinceCode")
	ORDER BY rpc_alfresco_get_provinces."provinceCode";
        

	--EXCEPTION WHEN OTHERS THEN /*Catch all*/
	--RAISE EXCEPTION 'Something went wrong';	
END;
$$;


ALTER FUNCTION public.alfresco_get_provinces("provinceId" integer, "provinceCode" text) OWNER TO postgres;

--
-- Name: submission_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE submission_types_id_seq
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE submission_types_id_seq OWNER TO postgres;

--
-- Name: submission_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE submission_types (
    id integer DEFAULT nextval('submission_types_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    type character varying(255) NOT NULL,
    description text NOT NULL
);


ALTER TABLE submission_types OWNER TO postgres;

--
-- Name: TABLE submission_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE submission_types IS 'A submission type is one of Email, Physical, etc.';


--
-- Name: rpc_alfresco_get_submission_types; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_get_submission_types AS
 SELECT submission_types.id AS "submissionTypeId",
    submission_types.code AS "submissionTypeCode",
    submission_types.type AS "submissionTypeName"
   FROM submission_types;


ALTER TABLE rpc_alfresco_get_submission_types OWNER TO postgres;

--
-- Name: alfresco_get_submission_types(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_get_submission_types() RETURNS SETOF rpc_alfresco_get_submission_types
    LANGUAGE plpgsql COST 1 ROWS 50
    AS $$
--#variable_conflict use_variable   
BEGIN
	SET ROLE postgres;
        RETURN QUERY SELECT * FROM rpc_alfresco_get_submission_types 
	ORDER BY
		rpc_alfresco_get_submission_types."submissionTypeName";
        

	--EXCEPTION WHEN OTHERS THEN 
	--RAISE EXCEPTION 'Something went wrong';	
END;
$$;


ALTER FUNCTION public.alfresco_get_submission_types() OWNER TO postgres;

--
-- Name: rpc_alfresco_get_suburbs; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW rpc_alfresco_get_suburbs AS
 SELECT suburbs.id AS "suburbId",
    suburbs.name AS "suburbName",
    (suburbs.id)::text AS "suburbCode",
    places.id AS "placeId",
    places.name AS "placeName",
    suburbs.po_box_code AS "suburbPOBoxCode",
    suburbs.street_code AS "suburbStreetCode",
    suburbs.latitude AS "suburbLatitude",
    suburbs.longitude AS "subutbLongitude"
   FROM (suburbs
     JOIN places ON ((suburbs.place = places.id)))
  ORDER BY suburbs.name;


ALTER TABLE rpc_alfresco_get_suburbs OWNER TO postgres;

--
-- Name: alfresco_get_suburbs(integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION alfresco_get_suburbs("cityId" integer DEFAULT NULL::integer, "cityCode" text DEFAULT NULL::text) RETURNS SETOF rpc_alfresco_get_suburbs
    LANGUAGE plpgsql COST 1 ROWS 50
    AS $$
--#variable_conflict use_variable   
BEGIN
	SET ROLE postgres;
	RETURN QUERY SELECT * FROM rpc_alfresco_get_suburbs 
	WHERE 
	 	rpc_alfresco_get_suburbs."placeId" = COALESCE(alfresco_get_suburbs."cityId"                   , rpc_alfresco_get_suburbs."placeId")
	AND 	rpc_alfresco_get_suburbs."placeId" = COALESCE(CAST(alfresco_get_suburbs."cityCode" as integer), rpc_alfresco_get_suburbs."placeId")
	ORDER BY rpc_alfresco_get_suburbs."suburbName"; 
        

--	EXCEPTION WHEN OTHERS THEN /*Catch all*/
--	RAISE EXCEPTION 'Something went wrong';	
END;
$$;


ALTER FUNCTION public.alfresco_get_suburbs("cityId" integer, "cityCode" text) OWNER TO postgres;

--
-- Name: assign_compliance_officer(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION assign_compliance_officer() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  app_officer_id integer; 
  app_officer_row application_compliance_officers;
begin  
  IF NEW.compliance_section = 2 THEN
	IF NEW.lead THEN
		RAISE EXCEPTION 'Section Does not Have Lead';
	ELSE
		SELECT * FROM application_compliance_officers WHERE		
		application_compliance_officers.application = NEW.application AND
		application_compliance_officers.compliance_section = NEW.compliance_section
		INTO app_officer_row;
		
		IF app_officer_row is null THEN
		ELSE
			IF TG_OP = 'INSERT' THEN
				RAISE EXCEPTION 'Only one Officer Allowed for this Section';
			ELSE 
			END IF;
		END IF;			
	END IF;	
  ELSIF NEW.compliance_section = 3  THEN
	IF NEW.lead THEN
		RAISE EXCEPTION 'Section Does not Have Lead';
	ELSE 
		SELECT * FROM application_compliance_officers WHERE		
		application_compliance_officers.application = NEW.application AND
		application_compliance_officers.compliance_section = NEW.compliance_section
		INTO app_officer_row;
		
		IF app_officer_row is null THEN
		ELSE
			IF TG_OP = 'INSERT' THEN
				RAISE EXCEPTION 'Only one Officer Allowed for this Section';
			ELSE 
			END IF;
		END IF;			
	END IF;		
  ELSIF NEW.compliance_section = 4  THEN
	IF NEW.lead THEN
		SELECT * FROM application_compliance_officers WHERE		
		application_compliance_officers.application = NEW.application AND
		application_compliance_officers.compliance_section = NEW.compliance_section AND
		application_compliance_officers.lead = True INTO app_officer_row;
				
		IF app_officer_row is null THEN
		ELSE
			RAISE EXCEPTION 'Assessor Lead already Assigned';
		END IF;
	ELSE
	END IF;		
  ELSIF NEW.compliance_section = 5  THEN
	IF NEW.lead THEN
	RAISE EXCEPTION 'Section Does not Have Lead';
	ELSE
		SELECT * FROM application_compliance_officers WHERE		
		application_compliance_officers.application = NEW.application AND
		application_compliance_officers.compliance_section = NEW.compliance_section
		INTO app_officer_row;
		
		IF app_officer_row is null THEN
		ELSE
			IF TG_OP = 'INSERT' THEN
				RAISE EXCEPTION 'Only one Officer Allowed for this Section';
			ELSE 				
			END IF;
		END IF;			
	END IF;	
  END IF;
	
  RETURN NEW;
end;
$$;


ALTER FUNCTION public.assign_compliance_officer() OWNER TO postgres;

--
-- Name: create_ldap_user(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION create_ldap_user(email text) RETURNS void
    LANGUAGE sql
    AS $$
  insert into basic_auth.users (email, pass, role,ldap_user,verified) values
    (create_ldap_user.email,'', 'anon',true,true);
$$;


ALTER FUNCTION public.create_ldap_user(email text) OWNER TO postgres;

--
-- Name: genorgcode(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION genorgcode() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if tg_op = 'INSERT' then
    new.code = 'ORG'::text || to_char(new.id , 'FM00000'::text); 
  end if;
  return new;
end
$$;


ALTER FUNCTION public.genorgcode() OWNER TO postgres;

--
-- Name: login(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION login(email text, pass text) RETURNS basic_auth.jwt_claims
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.login(email text, pass text) OWNER TO postgres;

--
-- Name: request_password_reset(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION request_password_reset(email text) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  tok uuid;
begin
  delete from basic_auth.tokens
   where token_type = 'reset'
     and tokens.email = request_password_reset.email;

  select uuid_generate_v4() into tok;
  insert into basic_auth.tokens (token, token_type, email)
         values (tok, 'reset', request_password_reset.email);
  perform pg_notify('reset',
    json_build_object(
      'email', request_password_reset.email,
      'token', tok,
      'token_type', 'reset'
    )::text
  );
end;
$$;


ALTER FUNCTION public.request_password_reset(email text) OWNER TO postgres;

--
-- Name: reset_password(text, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION reset_password(email text, token uuid, pass text) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  tok uuid;
begin
  if exists(select 1 from basic_auth.tokens
             where tokens.email = reset_password.email
               and tokens.token = reset_password.token
               and token_type = 'reset') then
    update basic_auth.users set pass=reset_password.pass
     where users.email = reset_password.email;

    delete from basic_auth.tokens
     where tokens.email = reset_password.email
       and tokens.token = reset_password.token
       and token_type = 'reset';
  else
    raise invalid_password using message =
      'invalid user or token';
  end if;
  delete from basic_auth.tokens
   where token_type = 'reset'
     and tokens.email = reset_password.email;

  select uuid_generate_v4() into tok;
  insert into basic_auth.tokens (token, token_type, email)
         values (tok, 'reset', reset_password.email);
  perform pg_notify('reset',
    json_build_object(
      'email', reset_password.email,
      'token', tok
    )::text
  );
end;
$$;


ALTER FUNCTION public.reset_password(email text, token uuid, pass text) OWNER TO postgres;

--
-- Name: signup(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION signup(email text, pass text) RETURNS void
    LANGUAGE sql
    AS $$
  insert into basic_auth.users (email, pass, role) values
    (signup.email, signup.pass, 'anon');
$$;


ALTER FUNCTION public.signup(email text, pass text) OWNER TO postgres;

--
-- Name: update_users(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION update_users() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if tg_op = 'INSERT' then
    perform basic_auth.clearance_for_role(new.role);

    insert into basic_auth.users
      (role, pass, email, verified) values
      (coalesce(new.role, 'anon'), new.pass,
        new.email, coalesce(new.verified, false));
    return new;
  elsif tg_op = 'UPDATE' then
    -- no need to check clearance for old.role because
    -- an ineligible row would not even available to update (http 404)
    perform basic_auth.clearance_for_role(new.role);

    update basic_auth.users set
      email  = new.email,
      role   = new.role,
      pass   = new.pass,
      verified = coalesce(new.verified, old.verified, false)
      where email = old.email;
    return new;
  elsif tg_op = 'DELETE' then
    -- no need to check clearance for old.role (see previous case)

    delete from basic_auth.users
     where basic_auth.email = old.email;
    return null;
  end if;
end
$$;


ALTER FUNCTION public.update_users() OWNER TO postgres;

--
-- Name: validate_user(text, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION validate_user(email text, token uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  tok uuid;
begin
  if exists(select 1 from basic_auth.tokens
             where tokens.email = validate_user.email
               and tokens.token = validate_user.token
               and token_type = 'validation') then

    update basic_auth.users set verified=true
     where users.email = validate_user.email;

    delete from basic_auth.tokens
     where tokens.email = validate_user.email
       and tokens.token = validate_user.token
       and token_type = 'validation';
  else
    raise invalid_password using message =
      'invalid user or token';
  end if;

end;
$$;


ALTER FUNCTION public.validate_user(email text, token uuid) OWNER TO postgres;

SET search_path = basic_auth, pg_catalog;

--
-- Name: tokens; Type: TABLE; Schema: basic_auth; Owner: postgres
--

CREATE TABLE tokens (
    token uuid NOT NULL,
    token_type public.token_type_enum NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
);


ALTER TABLE tokens OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: basic_auth; Owner: postgres
--

CREATE TABLE users (
    email text NOT NULL,
    pass text NOT NULL,
    role name NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    ldap_user boolean DEFAULT false,
    CONSTRAINT users_email_check CHECK ((email ~* '^.+@.+\..+$'::text)),
    CONSTRAINT users_pass_check CHECK ((length(pass) < 512)),
    CONSTRAINT users_role_check CHECK ((length((role)::text) < 512))
);


ALTER TABLE users OWNER TO postgres;

SET search_path = public, pg_catalog;

--
-- Name: application_compliance_officers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE application_compliance_officers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE application_compliance_officers_id_seq OWNER TO postgres;

--
-- Name: application_compliance_officers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE application_compliance_officers (
    id integer DEFAULT nextval('application_compliance_officers_id_seq'::regclass) NOT NULL,
    application integer,
    compliance_officer integer,
    lead boolean DEFAULT false NOT NULL,
    complete boolean DEFAULT false,
    compliance_section integer,
    reviewed boolean DEFAULT false NOT NULL
);


ALTER TABLE application_compliance_officers OWNER TO postgres;

--
-- Name: applicationid_with_email; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW applicationid_with_email AS
 SELECT call_applications.id,
    call_applications.id AS code,
    organisations.email_address AS organisation_email_address
   FROM (call_applications
     LEFT JOIN organisations ON ((call_applications.applicant = organisations.id)));


ALTER TABLE applicationid_with_email OWNER TO postgres;

--
-- Name: bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE bank_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE bank_accounts_id_seq OWNER TO postgres;

--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE bank_accounts (
    id integer DEFAULT nextval('bank_accounts_id_seq'::regclass) NOT NULL,
    account_number text NOT NULL,
    account_name text,
    account_type text,
    branch_name text,
    branch_code text,
    bank integer NOT NULL
);


ALTER TABLE bank_accounts OWNER TO postgres;

--
-- Name: TABLE bank_accounts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE bank_accounts IS 'Bank account details of an organisation.';


--
-- Name: beneficiaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE beneficiaries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE beneficiaries_id_seq OWNER TO postgres;

--
-- Name: beneficiaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE beneficiaries (
    id integer DEFAULT nextval('beneficiaries_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    type character varying(255) NOT NULL,
    description text NOT NULL
);


ALTER TABLE beneficiaries OWNER TO postgres;

--
-- Name: TABLE beneficiaries; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE beneficiaries IS 'A milestone type is a stage in the life-cycle of a project.';


--
-- Name: call_evaluations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE call_evaluations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE call_evaluations_id_seq OWNER TO postgres;

--
-- Name: call_evaluations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE call_evaluations (
    id integer DEFAULT nextval('call_evaluations_id_seq'::regclass) NOT NULL,
    call_application integer,
    score integer,
    remarks text,
    evaluator integer,
    evaluation_date date
);


ALTER TABLE call_evaluations OWNER TO postgres;

--
-- Name: TABLE call_evaluations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE call_evaluations IS 'A call evaluation is a score given by an evaluator for a project proposal.';


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE categories_id_seq OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE categories (
    id integer DEFAULT nextval('categories_id_seq'::regclass) NOT NULL,
    template integer,
    name text NOT NULL,
    title text NOT NULL,
    subtitle text
);


ALTER TABLE categories OWNER TO postgres;

--
-- Name: compliance_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE compliance_answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE compliance_answers_id_seq OWNER TO postgres;

--
-- Name: compliance_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE compliance_answers (
    id integer DEFAULT nextval('compliance_answers_id_seq'::regclass) NOT NULL,
    answer text NOT NULL,
    application_compliance_officer integer,
    question integer,
    motivation text
);


ALTER TABLE compliance_answers OWNER TO postgres;

--
-- Name: compliance_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE compliance_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE compliance_templates_id_seq OWNER TO postgres;

--
-- Name: compliance_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE compliance_templates (
    id integer DEFAULT nextval('compliance_templates_id_seq'::regclass) NOT NULL,
    name character varying(255),
    title character varying(255),
    subtitle text
);


ALTER TABLE compliance_templates OWNER TO postgres;

--
-- Name: contract_budget_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE contract_budget_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE contract_budget_items_id_seq OWNER TO postgres;

--
-- Name: contract_budget_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE contract_budget_items (
    id integer DEFAULT nextval('contract_budget_items_id_seq'::regclass) NOT NULL,
    item character varying(255),
    description text,
    amount numeric(20,2),
    contract integer
);


ALTER TABLE contract_budget_items OWNER TO postgres;

--
-- Name: contract_implementation_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE contract_implementation_plan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE contract_implementation_plan_id_seq OWNER TO postgres;

--
-- Name: contract_implementation_plan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE contract_implementation_plan (
    id integer DEFAULT nextval('contract_implementation_plan_id_seq'::regclass) NOT NULL,
    description text,
    contract integer
);


ALTER TABLE contract_implementation_plan OWNER TO postgres;

--
-- Name: contract_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE contract_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE contract_types_id_seq OWNER TO postgres;

--
-- Name: contract_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE contract_types (
    id integer DEFAULT nextval('contract_types_id_seq'::regclass) NOT NULL,
    code character varying(50),
    type character varying(255)
);


ALTER TABLE contract_types OWNER TO postgres;

--
-- Name: email_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE email_notifications (
    id integer NOT NULL,
    email_to character varying(50) NOT NULL,
    subject text,
    body text,
    sent boolean DEFAULT false NOT NULL,
    retries smallint DEFAULT 0 NOT NULL,
    failed boolean DEFAULT false NOT NULL,
    token_email boolean DEFAULT false NOT NULL,
    token text,
    token_type text,
    status_message character varying(100)
);


ALTER TABLE email_notifications OWNER TO postgres;

--
-- Name: email_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE email_notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE email_notifications_id_seq OWNER TO postgres;

--
-- Name: email_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE email_notifications_id_seq OWNED BY email_notifications.id;


--
-- Name: email_notifications_not_sent; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW email_notifications_not_sent AS
 SELECT email_notifications.id,
    email_notifications.email_to,
    email_notifications.subject,
    email_notifications.body,
    email_notifications.sent,
    email_notifications.retries,
    email_notifications.failed,
    email_notifications.token_email,
    email_notifications.token,
    email_notifications.token_type
   FROM email_notifications
  WHERE ((email_notifications.failed = false) AND (email_notifications.sent = false));


ALTER TABLE email_notifications_not_sent OWNER TO postgres;

--
-- Name: email_notifications_to_json; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW email_notifications_to_json AS
 SELECT row_to_json(t.*) AS row_to_json
   FROM ( SELECT email_notifications.id,
            email_notifications.email_to,
            email_notifications.subject,
            email_notifications.body,
            email_notifications.sent,
            email_notifications.retries,
            email_notifications.failed,
            email_notifications.token_email,
            email_notifications.token,
            email_notifications.token_type
           FROM email_notifications
          WHERE ((email_notifications.failed = false) AND (email_notifications.sent = false))) t;


ALTER TABLE email_notifications_to_json OWNER TO postgres;

--
-- Name: evaluation_committee_meeting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE evaluation_committee_meeting (
    id integer NOT NULL,
    meeting_date timestamp without time zone NOT NULL,
    name text
);


ALTER TABLE evaluation_committee_meeting OWNER TO postgres;

--
-- Name: evaluation_committee_meeting_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE evaluation_committee_meeting_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE evaluation_committee_meeting_id_seq OWNER TO postgres;

--
-- Name: evaluation_committee_meeting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE evaluation_committee_meeting_id_seq OWNED BY evaluation_committee_meeting.id;


--
-- Name: evc_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE evc_applications (
    id integer NOT NULL,
    application integer,
    evc integer,
    decision_narrative text,
    decision_timestamp timestamp without time zone,
    amount_approved numeric(20,2),
    approved boolean DEFAULT false NOT NULL
);


ALTER TABLE evc_applications OWNER TO postgres;

--
-- Name: evc_attendees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE evc_attendees (
    id integer NOT NULL,
    attendee integer,
    evc integer
);


ALTER TABLE evc_attendees OWNER TO postgres;

--
-- Name: evc_attendees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE evc_attendees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE evc_attendees_id_seq OWNER TO postgres;

--
-- Name: evc_attendees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE evc_attendees_id_seq OWNED BY evc_attendees.id;


--
-- Name: evc_has_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE evc_has_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE evc_has_applications_id_seq OWNER TO postgres;

--
-- Name: evc_has_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE evc_has_applications_id_seq OWNED BY evc_applications.id;


--
-- Name: grid_applications; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_applications AS
 SELECT call_applications.id,
    calls.call_reference,
    organisations.name,
    organisations.email_address,
    call_applications.pmu_advisory,
    call_application_statuses.description,
    call_applications.application_status
   FROM (((call_applications
     LEFT JOIN organisations ON ((call_applications.applicant = organisations.id)))
     LEFT JOIN calls ON ((call_applications.call = calls.id)))
     LEFT JOIN call_application_statuses ON ((call_applications.application_status = call_application_statuses.id)))
  WHERE (call_applications.application_status > 0);


ALTER TABLE grid_applications OWNER TO postgres;

--
-- Name: persons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE persons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE persons_id_seq OWNER TO postgres;

--
-- Name: persons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE persons (
    id integer DEFAULT nextval('persons_id_seq'::regclass) NOT NULL,
    id_no character varying(255),
    last_name character varying(255) NOT NULL,
    first_names character varying(255),
    cell_phone character varying(255),
    work_phone character varying(255),
    email_address character varying(255),
    job_title integer,
    personal_title integer,
    employer integer,
    application_user boolean DEFAULT false NOT NULL,
    login_email character varying(255)
);


ALTER TABLE persons OWNER TO postgres;

--
-- Name: TABLE persons; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE persons IS 'A person is a member of staff or contact person in an organisation.';


--
-- Name: grid_assigned_applications; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_assigned_applications AS
 SELECT call_applications.id AS application,
    application_compliance_officers.id,
    application_compliance_officers.compliance_officer,
    persons.first_names,
    persons.last_name,
    persons.email_address,
    calls.call_reference,
    organisations.name,
    provinces.name AS province,
    application_compliance_officers.lead,
    calls.admin_compliance_template,
    calls.relevance_compliance_template,
    calls.assessment_compliance_template,
    application_compliance_officers.complete,
    application_compliance_officers.compliance_section,
    call_application_statuses.status AS application_status,
    call_application_statuses.description AS application_status_description
   FROM ((((((application_compliance_officers
     LEFT JOIN call_applications ON ((application_compliance_officers.application = call_applications.id)))
     LEFT JOIN organisations ON ((call_applications.applicant = organisations.id)))
     LEFT JOIN calls ON ((call_applications.call = calls.id)))
     LEFT JOIN persons ON ((application_compliance_officers.compliance_officer = persons.id)))
     LEFT JOIN provinces ON ((organisations.province = provinces.id)))
     JOIN call_application_statuses ON ((call_applications.application_status = call_application_statuses.id)));


ALTER TABLE grid_assigned_applications OWNER TO postgres;

--
-- Name: grid_calls; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_calls AS
 SELECT calls.id,
    calls.call_reference,
    calls.name,
    key_performance_indicators.code AS programme_code,
    key_result_areas.code AS kra_code,
    programmes.code AS kpi_code
   FROM (((calls
     LEFT JOIN key_performance_indicators ON ((calls.key_performance_indicator = key_performance_indicators.id)))
     LEFT JOIN key_result_areas ON ((key_performance_indicators.key_result_area = key_result_areas.id)))
     LEFT JOIN programmes ON ((key_result_areas.programme = programmes.id)));


ALTER TABLE grid_calls OWNER TO postgres;

--
-- Name: grid_compliance_applications; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_compliance_applications AS
 SELECT application_compliance_officers.id,
    application_compliance_officers.application,
    application_compliance_officers.compliance_officer,
    persons.first_names,
    persons.last_name,
    persons.email_address,
    calls.call_reference,
    organisations.name,
    provinces.name AS province,
    application_compliance_officers.lead,
    calls.admin_compliance_template,
    calls.relevance_compliance_template,
    calls.assessment_compliance_template,
    application_compliance_officers.complete,
    application_compliance_officers.compliance_section,
    call_applications.application_status,
    call_application_statuses.description AS application_status_description
   FROM ((((((application_compliance_officers
     JOIN call_applications ON ((application_compliance_officers.application = call_applications.id)))
     JOIN organisations ON ((call_applications.applicant = organisations.id)))
     JOIN calls ON ((call_applications.call = calls.id)))
     JOIN persons ON ((application_compliance_officers.compliance_officer = persons.id)))
     LEFT JOIN provinces ON ((organisations.province = provinces.id)))
     JOIN call_application_statuses ON ((call_applications.application_status = call_application_statuses.id)));


ALTER TABLE grid_compliance_applications OWNER TO postgres;

--
-- Name: grid_evc; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_evc AS
 SELECT evaluation_committee_meeting.id,
    evaluation_committee_meeting.meeting_date,
    evaluation_committee_meeting.name
   FROM evaluation_committee_meeting;


ALTER TABLE grid_evc OWNER TO postgres;

--
-- Name: grid_evc_applications; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_evc_applications AS
 SELECT evc_applications.id,
    evc_applications.application,
    evc_applications.decision_timestamp,
    evc_applications.amount_approved,
    evc_applications.approved,
    organisations.name AS organisation,
    evc_applications.evc
   FROM ((evc_applications
     JOIN call_applications ON ((evc_applications.application = call_applications.id)))
     JOIN organisations ON ((call_applications.applicant = organisations.id)));


ALTER TABLE grid_evc_applications OWNER TO postgres;

--
-- Name: grid_evc_attendees; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_evc_attendees AS
 SELECT evc_attendees.id,
    persons.first_names,
    persons.last_name,
    persons.email_address,
    persons.employer,
    evc_attendees.evc
   FROM (evc_attendees
     JOIN persons ON ((evc_attendees.attendee = persons.id)));


ALTER TABLE grid_evc_attendees OWNER TO postgres;

--
-- Name: grid_kpis; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_kpis AS
 SELECT key_performance_indicators.id,
    programmes.code AS programme_code,
    key_result_areas.code AS kra_code,
    key_performance_indicators.code,
    key_performance_indicators.name,
    key_performance_indicators.description
   FROM ((key_performance_indicators
     LEFT JOIN key_result_areas ON ((key_performance_indicators.key_result_area = key_result_areas.id)))
     JOIN programmes ON ((key_result_areas.programme = programmes.id)));


ALTER TABLE grid_kpis OWNER TO postgres;

--
-- Name: grid_kras; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_kras AS
 SELECT key_result_areas.id,
    programmes.code AS programme_code,
    key_result_areas.code,
    key_result_areas.name,
    key_result_areas.description
   FROM (programmes
     RIGHT JOIN key_result_areas ON ((key_result_areas.programme = programmes.id)));


ALTER TABLE grid_kras OWNER TO postgres;

--
-- Name: organisation_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE organisation_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE organisation_statuses_id_seq OWNER TO postgres;

--
-- Name: organisation_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE organisation_statuses (
    id integer DEFAULT nextval('organisation_statuses_id_seq'::regclass) NOT NULL,
    status character varying(255) NOT NULL,
    description text NOT NULL
);


ALTER TABLE organisation_statuses OWNER TO postgres;

--
-- Name: TABLE organisation_statuses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE organisation_statuses IS 'The status of an organisation.';


--
-- Name: grid_org_statuses; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_org_statuses AS
 SELECT organisation_statuses.id,
    organisation_statuses.status,
    organisation_statuses.description
   FROM organisation_statuses;


ALTER TABLE grid_org_statuses OWNER TO postgres;

--
-- Name: organisation_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE organisation_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE organisation_types_id_seq OWNER TO postgres;

--
-- Name: organisation_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE organisation_types (
    id integer DEFAULT nextval('organisation_types_id_seq'::regclass) NOT NULL,
    type text NOT NULL,
    description text NOT NULL
);


ALTER TABLE organisation_types OWNER TO postgres;

--
-- Name: TABLE organisation_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE organisation_types IS 'An organisation type describes nature of the institution, such as Funder, Grantee, Partner, Government Department and so on.';


--
-- Name: grid_org_types; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_org_types AS
 SELECT organisation_types.id,
    organisation_types.type,
    organisation_types.description
   FROM organisation_types;


ALTER TABLE grid_org_types OWNER TO postgres;

--
-- Name: grid_organisations; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_organisations AS
 SELECT organisations.id,
    organisations.code,
    organisations.name,
    organisations.web_site,
    organisations.email_address,
    organisations1.name AS referee,
    organisations2.name AS auditor,
    organisation_types.type AS organisation_type,
    provinces.name AS province
   FROM ((((organisations
     LEFT JOIN organisations organisations1 ON ((organisations.referee = organisations1.id)))
     LEFT JOIN organisations organisations2 ON ((organisations.auditor = organisations2.id)))
     LEFT JOIN organisation_types ON ((organisations.organisation_type = organisation_types.id)))
     LEFT JOIN provinces ON ((organisations.province = provinces.id)))
  ORDER BY organisations.name;


ALTER TABLE grid_organisations OWNER TO postgres;

--
-- Name: users; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW users AS
 SELECT actual.role,
    '***'::text AS pass,
    actual.email,
    actual.verified
   FROM basic_auth.users actual,
    ( SELECT pg_authid.rolname
           FROM pg_authid
          WHERE pg_has_role("current_user"(), pg_authid.oid, 'member'::text)) member_of
  WHERE ((actual.role = member_of.rolname) AND ((actual.role <> 'anon'::name) OR (actual.email = basic_auth.current_email())));


ALTER TABLE users OWNER TO postgres;

--
-- Name: grid_persons; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_persons AS
 SELECT persons.id,
    persons.id_no,
    persons.last_name,
    persons.first_names,
    persons.cell_phone,
    persons.work_phone,
    persons.email_address,
    persons.job_title,
    persons.personal_title,
    persons.employer,
    persons.application_user,
    users.email AS user_login,
    users.role
   FROM (persons
     LEFT JOIN users ON (((persons.login_email)::text = users.email)));


ALTER TABLE grid_persons OWNER TO postgres;

--
-- Name: grid_places; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_places AS
 SELECT places.id,
    places.name,
    provinces.name AS province
   FROM (places
     LEFT JOIN provinces ON ((places.province = provinces.id)));


ALTER TABLE grid_places OWNER TO postgres;

--
-- Name: grid_pmu_applications; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_pmu_applications AS
 SELECT call_applications.id,
    calls.call_reference,
    organisations.name,
    organisations.email_address,
    call_applications.pmu_advisory,
    call_applications.application_status,
    call_application_statuses.description AS application_status_description
   FROM (((call_applications
     LEFT JOIN organisations ON ((call_applications.applicant = organisations.id)))
     LEFT JOIN calls ON ((call_applications.call = calls.id)))
     JOIN call_application_statuses ON ((call_applications.application_status = call_application_statuses.id)))
  WHERE (call_applications.application_status = 5);


ALTER TABLE grid_pmu_applications OWNER TO postgres;

--
-- Name: grid_programmes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_programmes AS
 SELECT programmes.id,
    programmes.code,
    programmes.name,
    programmes.description,
    programmes.start_date,
    programmes.end_date
   FROM programmes;


ALTER TABLE grid_programmes OWNER TO postgres;

--
-- Name: grid_provinces; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_provinces AS
 SELECT provinces.id,
    provinces.code,
    provinces.name
   FROM provinces;


ALTER TABLE grid_provinces OWNER TO postgres;

--
-- Name: grid_suburbs; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW grid_suburbs AS
 SELECT suburbs.id,
    suburbs.name,
    places.name AS place,
    provinces.name AS province,
    suburbs.street_code,
    suburbs.po_box_code
   FROM ((suburbs
     LEFT JOIN places ON ((suburbs.place = places.id)))
     LEFT JOIN provinces ON ((suburbs.province = provinces.id)));


ALTER TABLE grid_suburbs OWNER TO postgres;

--
-- Name: job_titles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE job_titles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE job_titles_id_seq OWNER TO postgres;

--
-- Name: job_titles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE job_titles (
    id integer DEFAULT nextval('job_titles_id_seq'::regclass) NOT NULL,
    title text NOT NULL,
    description text NOT NULL
);


ALTER TABLE job_titles OWNER TO postgres;

--
-- Name: TABLE job_titles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE job_titles IS 'The job title of a person.';


--
-- Name: key_performance_indicators_targets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE key_performance_indicators_targets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE key_performance_indicators_targets_id_seq OWNER TO postgres;

--
-- Name: key_performance_indicators_targets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE key_performance_indicators_targets (
    id integer DEFAULT nextval('key_performance_indicators_targets_id_seq'::regclass) NOT NULL,
    month date NOT NULL,
    target text,
    actual text,
    key_performance_indicator integer
);


ALTER TABLE key_performance_indicators_targets OWNER TO postgres;

--
-- Name: kpi_next_call_reference; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW kpi_next_call_reference AS
 SELECT m.kpi_id,
    ((m.next_call_reference || '/'::text) || to_char((m.count_kpi_calls + 1), 'FM00'::text)) AS next_call_reference
   FROM ( SELECT key_performance_indicators.id AS kpi_id,
            (((((programmes.code)::text || '/'::text) || (key_result_areas.code)::text) || '/'::text) || (key_performance_indicators.code)::text) AS next_call_reference,
            count(calls.id) AS count_kpi_calls
           FROM (((key_performance_indicators
             LEFT JOIN calls ON ((key_performance_indicators.id = calls.key_performance_indicator)))
             LEFT JOIN key_result_areas ON ((key_performance_indicators.key_result_area = key_result_areas.id)))
             LEFT JOIN programmes ON ((key_result_areas.programme = programmes.id)))
          GROUP BY (((((programmes.code)::text || '/'::text) || (key_result_areas.code)::text) || '/'::text) || (key_performance_indicators.code)::text), key_performance_indicators.id) m;


ALTER TABLE kpi_next_call_reference OWNER TO postgres;

--
-- Name: ldap_users; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW ldap_users AS
 SELECT users.email,
    users.role,
    users.verified,
    users.ldap_user,
    persons.id AS person_id
   FROM (basic_auth.users
     LEFT JOIN persons ON ((users.email = (persons.login_email)::text)))
  WHERE ((users.verified = true) AND (users.ldap_user = true));


ALTER TABLE ldap_users OWNER TO postgres;

--
-- Name: lookup_banks; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW lookup_banks AS
 SELECT organisations.id,
    organisations.name,
    organisation_types.type
   FROM (organisations
     JOIN organisation_types ON ((organisations.organisation_type = organisation_types.id)))
  WHERE (organisation_types.type = 'Bank'::text)
  ORDER BY organisations.name;


ALTER TABLE lookup_banks OWNER TO postgres;

--
-- Name: lookup_calls; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW lookup_calls AS
 SELECT calls.id,
    calls.call_reference AS code,
    calls.name
   FROM calls;


ALTER TABLE lookup_calls OWNER TO postgres;

--
-- Name: lookup_evc_applications; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW lookup_evc_applications AS
 SELECT call_applications.id AS application,
    calls.call_reference,
    call_applications.amount AS amount_applied,
    organisations.name
   FROM ((call_applications
     JOIN organisations ON ((call_applications.applicant = organisations.id)))
     JOIN calls ON ((call_applications.call = calls.id)));


ALTER TABLE lookup_evc_applications OWNER TO postgres;

--
-- Name: lookup_organisations; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW lookup_organisations AS
 SELECT organisations.id,
    organisations.code,
    organisations.name,
    organisations.web_site,
    organisations.email_address,
    organisations1.name AS referee,
    organisations2.name AS auditor,
    organisation_types.type AS organisation_type,
    provinces.name AS province
   FROM ((((organisations
     LEFT JOIN organisations organisations1 ON ((organisations.referee = organisations1.id)))
     LEFT JOIN organisations organisations2 ON ((organisations.auditor = organisations2.id)))
     LEFT JOIN organisation_types ON ((organisations.organisation_type = organisation_types.id)))
     LEFT JOIN provinces ON ((organisations.province = provinces.id)));


ALTER TABLE lookup_organisations OWNER TO postgres;

--
-- Name: lookup_programmes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW lookup_programmes AS
 SELECT programmes.id,
    programmes.code,
    programmes.name
   FROM programmes;


ALTER TABLE lookup_programmes OWNER TO postgres;

--
-- Name: lookup_roles; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW lookup_roles AS
 SELECT pg_roles.rolname
   FROM pg_roles
  WHERE (pg_roles.rolname <> 'postgres'::name);


ALTER TABLE lookup_roles OWNER TO postgres;

--
-- Name: milestone_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE milestone_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE milestone_types_id_seq OWNER TO postgres;

--
-- Name: milestone_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE milestone_types (
    id integer DEFAULT nextval('milestone_types_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    type character varying(255) NOT NULL,
    description text NOT NULL
);


ALTER TABLE milestone_types OWNER TO postgres;

--
-- Name: TABLE milestone_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE milestone_types IS 'A milestone type is a stage in the life-cycle of a project.';


--
-- Name: organisation_bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE organisation_bank_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE organisation_bank_accounts_id_seq OWNER TO postgres;

--
-- Name: organisation_bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE organisation_bank_accounts (
    id integer DEFAULT nextval('organisation_bank_accounts_id_seq'::regclass) NOT NULL,
    ogranisation integer,
    bankaccount integer
);


ALTER TABLE organisation_bank_accounts OWNER TO postgres;

--
-- Name: payment_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE payment_schedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE payment_schedule_id_seq OWNER TO postgres;

--
-- Name: payment_schedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE payment_schedule (
    id integer DEFAULT nextval('payment_schedule_id_seq'::regclass) NOT NULL,
    tranche integer NOT NULL,
    amount numeric(20,2) NOT NULL,
    payment_date date NOT NULL,
    contract integer
);


ALTER TABLE payment_schedule OWNER TO postgres;

--
-- Name: payment_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE payment_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE payment_types_id_seq OWNER TO postgres;

--
-- Name: payment_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE payment_types (
    id integer DEFAULT nextval('payment_types_id_seq'::regclass) NOT NULL,
    code character varying(50),
    type character varying(255)
);


ALTER TABLE payment_types OWNER TO postgres;

--
-- Name: person_bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE person_bank_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE person_bank_accounts_id_seq OWNER TO postgres;

--
-- Name: person_bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE person_bank_accounts (
    id integer DEFAULT nextval('person_bank_accounts_id_seq'::regclass) NOT NULL,
    bankaccount integer,
    person integer
);


ALTER TABLE person_bank_accounts OWNER TO postgres;

--
-- Name: personal_titles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE personal_titles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE personal_titles_id_seq OWNER TO postgres;

--
-- Name: personal_titles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE personal_titles (
    id integer DEFAULT nextval('personal_titles_id_seq'::regclass) NOT NULL,
    title text NOT NULL,
    description text NOT NULL
);


ALTER TABLE personal_titles OWNER TO postgres;

--
-- Name: TABLE personal_titles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE personal_titles IS 'The title of a person used in the salutation.';


--
-- Name: project_beneficiaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE project_beneficiaries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE project_beneficiaries_id_seq OWNER TO postgres;

--
-- Name: project_beneficiaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE project_beneficiaries (
    id integer DEFAULT nextval('project_beneficiaries_id_seq'::regclass) NOT NULL,
    beneficiary integer,
    project integer
);


ALTER TABLE project_beneficiaries OWNER TO postgres;

--
-- Name: project_contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE project_contracts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE project_contracts_id_seq OWNER TO postgres;

--
-- Name: project_contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE project_contracts (
    id integer DEFAULT nextval('project_contracts_id_seq'::regclass) NOT NULL,
    project integer,
    contract_type integer,
    person integer
);


ALTER TABLE project_contracts OWNER TO postgres;

--
-- Name: project_expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE project_expenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE project_expenses_id_seq OWNER TO postgres;

--
-- Name: project_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE project_expenses (
    id integer DEFAULT nextval('project_expenses_id_seq'::regclass) NOT NULL,
    project integer NOT NULL,
    payment_reference character varying(255) NOT NULL,
    description text,
    amount numeric(20,2),
    payment_type integer,
    organisation integer,
    person integer,
    payment_schedule integer
);


ALTER TABLE project_expenses OWNER TO postgres;

--
-- Name: TABLE project_expenses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE project_expenses IS 'Project expenses are incurred by project activities';


--
-- Name: project_milestones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE project_milestones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE project_milestones_id_seq OWNER TO postgres;

--
-- Name: project_milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE project_milestones (
    id integer DEFAULT nextval('project_milestones_id_seq'::regclass) NOT NULL,
    project integer NOT NULL,
    milestone_type integer NOT NULL,
    milestone_date date
);


ALTER TABLE project_milestones OWNER TO postgres;

--
-- Name: TABLE project_milestones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE project_milestones IS 'A project milestone is a record of the milestones of a project.';


--
-- Name: project_outputs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE project_outputs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE project_outputs_id_seq OWNER TO postgres;

--
-- Name: project_outputs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE project_outputs (
    id integer DEFAULT nextval('project_outputs_id_seq'::regclass) NOT NULL,
    project integer NOT NULL,
    key_performance_indicator integer,
    description text
);


ALTER TABLE project_outputs OWNER TO postgres;

--
-- Name: TABLE project_outputs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE project_outputs IS 'Project outputs are produced by project activities and may support a KPI';


--
-- Name: project_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE project_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE project_statuses_id_seq OWNER TO postgres;

--
-- Name: project_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE project_statuses (
    id integer DEFAULT nextval('project_statuses_id_seq'::regclass) NOT NULL,
    status character varying(255) NOT NULL,
    description text NOT NULL
);


ALTER TABLE project_statuses OWNER TO postgres;

--
-- Name: TABLE project_statuses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE project_statuses IS 'The status of a project.';


--
-- Name: project_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE project_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE project_types_id_seq OWNER TO postgres;

--
-- Name: project_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE project_types (
    id integer DEFAULT nextval('project_types_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    type character varying(255) NOT NULL,
    description text NOT NULL
);


ALTER TABLE project_types OWNER TO postgres;

--
-- Name: TABLE project_types; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE project_types IS 'A project type is one of Discretionary, Own, etc.';


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE projects_id_seq OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE projects (
    id integer DEFAULT nextval('projects_id_seq'::regclass) NOT NULL,
    project_code text NOT NULL,
    name text NOT NULL,
    description text,
    project_officer integer NOT NULL,
    start_date date,
    end_date date,
    overall_budget numeric(20,2),
    call_application integer,
    key_performance_indicator integer,
    place integer,
    partner integer,
    latest_milestone integer,
    project_type integer NOT NULL,
    project_status integer NOT NULL
);


ALTER TABLE projects OWNER TO postgres;

--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE projects IS 'A project is a set of activities that may contribute to a KPI, or other objective.';


--
-- Name: question_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE question_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE question_options_id_seq OWNER TO postgres;

--
-- Name: question_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE question_options (
    id integer DEFAULT nextval('question_options_id_seq'::regclass) NOT NULL,
    option text,
    question integer
);


ALTER TABLE question_options OWNER TO postgres;

--
-- Name: question_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE question_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE question_types_id_seq OWNER TO postgres;

--
-- Name: question_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE question_types (
    id integer DEFAULT nextval('question_types_id_seq'::regclass) NOT NULL,
    code character varying(50),
    type character varying(255),
    angular_control character varying(50)
);


ALTER TABLE question_types OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE questions_id_seq OWNER TO postgres;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE questions (
    id integer DEFAULT nextval('questions_id_seq'::regclass) NOT NULL,
    question text,
    weight real DEFAULT 0.01 NOT NULL,
    has_options boolean DEFAULT false NOT NULL,
    catergory integer,
    type integer,
    lead_question boolean DEFAULT false NOT NULL,
    has_motivation boolean DEFAULT false NOT NULL,
    is_scoring boolean DEFAULT false NOT NULL,
    max_scoring real DEFAULT 0 NOT NULL,
    description text
);


ALTER TABLE questions OWNER TO postgres;

--
-- Name: reporting_assessment; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW reporting_assessment AS
 SELECT compliance_templates.name AS "comName",
    compliance_templates.title AS "comTitle",
    compliance_templates.subtitle AS "comSubTitle",
    categories.name AS "catName",
    categories.title AS "catTitle",
    categories.subtitle AS "catSubTitle",
    questions.question,
    questions.weight,
    questions.has_options,
    questions.catergory,
    questions.type,
    questions.lead_question,
    questions.has_motivation,
    questions.is_scoring,
    questions.max_scoring,
    questions.description,
    compliance_answers.answer,
    compliance_answers.motivation,
    persons.id AS "officerId",
    persons.first_names,
    persons.last_name,
    application_compliance_officers.id AS "appComplianceOfficerId"
   FROM (((((categories
     LEFT JOIN compliance_templates ON ((categories.template = compliance_templates.id)))
     LEFT JOIN questions ON ((questions.catergory = categories.id)))
     LEFT JOIN compliance_answers ON ((compliance_answers.question = questions.id)))
     LEFT JOIN application_compliance_officers ON ((compliance_answers.application_compliance_officer = application_compliance_officers.id)))
     LEFT JOIN persons ON ((application_compliance_officers.compliance_officer = persons.id)));


ALTER TABLE reporting_assessment OWNER TO postgres;

--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY email_notifications ALTER COLUMN id SET DEFAULT nextval('email_notifications_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY evaluation_committee_meeting ALTER COLUMN id SET DEFAULT nextval('evaluation_committee_meeting_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY evc_applications ALTER COLUMN id SET DEFAULT nextval('evc_has_applications_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY evc_attendees ALTER COLUMN id SET DEFAULT nextval('evc_attendees_id_seq'::regclass);


SET search_path = basic_auth, pg_catalog;

--
-- Name: tokens_pkey; Type: CONSTRAINT; Schema: basic_auth; Owner: postgres
--

ALTER TABLE ONLY tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (token);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: basic_auth; Owner: postgres
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (email);


SET search_path = public, pg_catalog;

--
-- Name: activities_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY contract_implementation_plan
    ADD CONSTRAINT activities_pk PRIMARY KEY (id);


--
-- Name: application_compliance_officers_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY application_compliance_officers
    ADD CONSTRAINT application_compliance_officers_pk PRIMARY KEY (id);


--
-- Name: bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: beneficiaries_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY beneficiaries
    ADD CONSTRAINT beneficiaries_code_uq UNIQUE (code);


--
-- Name: beneficiaries_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY beneficiaries
    ADD CONSTRAINT beneficiaries_pk PRIMARY KEY (id);


--
-- Name: beneficiaries_types_type_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY beneficiaries
    ADD CONSTRAINT beneficiaries_types_type_uq UNIQUE (type);


--
-- Name: budget_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY contract_budget_items
    ADD CONSTRAINT budget_pk PRIMARY KEY (id);


--
-- Name: call_application_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY call_application_statuses
    ADD CONSTRAINT call_application_statuses_pkey PRIMARY KEY (id);


--
-- Name: call_application_statuses_status_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY call_application_statuses
    ADD CONSTRAINT call_application_statuses_status_uq UNIQUE (status);


--
-- Name: call_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY call_applications
    ADD CONSTRAINT call_applications_pkey PRIMARY KEY (id);


--
-- Name: call_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY call_evaluations
    ADD CONSTRAINT call_evaluations_pkey PRIMARY KEY (id);


--
-- Name: calls_call_reference_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY calls
    ADD CONSTRAINT calls_call_reference_uq UNIQUE (call_reference);


--
-- Name: calls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY calls
    ADD CONSTRAINT calls_pkey PRIMARY KEY (id);


--
-- Name: categories_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY categories
    ADD CONSTRAINT categories_pk PRIMARY KEY (id);


--
-- Name: compliance_answers_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY compliance_answers
    ADD CONSTRAINT compliance_answers_pk PRIMARY KEY (id);


--
-- Name: compliance_answers_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY compliance_answers
    ADD CONSTRAINT compliance_answers_uq UNIQUE (application_compliance_officer, question);


--
-- Name: compliance_templates_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY compliance_templates
    ADD CONSTRAINT compliance_templates_pk PRIMARY KEY (id);


--
-- Name: contract_types_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY contract_types
    ADD CONSTRAINT contract_types_code_uq UNIQUE (code);


--
-- Name: contract_types_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY contract_types
    ADD CONSTRAINT contract_types_pk PRIMARY KEY (id);


--
-- Name: contract_types_type_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY contract_types
    ADD CONSTRAINT contract_types_type_uq UNIQUE (type);


--
-- Name: email_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY email_notifications
    ADD CONSTRAINT email_notifications_pkey PRIMARY KEY (id);


--
-- Name: evaluation_committee_meeting_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY evaluation_committee_meeting
    ADD CONSTRAINT evaluation_committee_meeting_pk PRIMARY KEY (id);


--
-- Name: evc_attendees_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY evc_attendees
    ADD CONSTRAINT evc_attendees_pk PRIMARY KEY (id);


--
-- Name: evc_has_applications_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY evc_applications
    ADD CONSTRAINT evc_has_applications_pk PRIMARY KEY (id);


--
-- Name: evc_has_applications_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY evc_applications
    ADD CONSTRAINT evc_has_applications_uq UNIQUE (application, evc);


--
-- Name: job_titles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY job_titles
    ADD CONSTRAINT job_titles_pkey PRIMARY KEY (id);


--
-- Name: job_titles_title_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY job_titles
    ADD CONSTRAINT job_titles_title_uq UNIQUE (title);


--
-- Name: key_performance_indicators_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY key_performance_indicators
    ADD CONSTRAINT key_performance_indicators_code_uq UNIQUE (code, key_result_area);


--
-- Name: key_performance_indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY key_performance_indicators
    ADD CONSTRAINT key_performance_indicators_pkey PRIMARY KEY (id);


--
-- Name: key_performance_indicators_targets_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY key_performance_indicators_targets
    ADD CONSTRAINT key_performance_indicators_targets_pk PRIMARY KEY (id);


--
-- Name: key_performance_indicators_targets_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY key_performance_indicators_targets
    ADD CONSTRAINT key_performance_indicators_targets_uq UNIQUE (key_performance_indicator, month);


--
-- Name: key_result_areas_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY key_result_areas
    ADD CONSTRAINT key_result_areas_code_uq UNIQUE (code, programme);


--
-- Name: key_result_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY key_result_areas
    ADD CONSTRAINT key_result_areas_pkey PRIMARY KEY (id);


--
-- Name: milestone_types_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY milestone_types
    ADD CONSTRAINT milestone_types_code_uq UNIQUE (code);


--
-- Name: milestone_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY milestone_types
    ADD CONSTRAINT milestone_types_pkey PRIMARY KEY (id);


--
-- Name: milestone_types_type_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY milestone_types
    ADD CONSTRAINT milestone_types_type_uq UNIQUE (type);


--
-- Name: officer_application_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY application_compliance_officers
    ADD CONSTRAINT officer_application_uq UNIQUE (application, compliance_officer, compliance_section);


--
-- Name: organisation_bank_accounts_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisation_bank_accounts
    ADD CONSTRAINT organisation_bank_accounts_pk PRIMARY KEY (id);


--
-- Name: organisation_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisations
    ADD CONSTRAINT organisation_code_uq UNIQUE (code);


--
-- Name: organisation_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisation_statuses
    ADD CONSTRAINT organisation_statuses_pkey PRIMARY KEY (id);


--
-- Name: organisation_statuses_status_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisation_statuses
    ADD CONSTRAINT organisation_statuses_status_uq UNIQUE (status);


--
-- Name: organisation_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisation_types
    ADD CONSTRAINT organisation_types_pkey PRIMARY KEY (id);


--
-- Name: organisation_types_type_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisation_types
    ADD CONSTRAINT organisation_types_type_uq UNIQUE (type);


--
-- Name: organisations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisations
    ADD CONSTRAINT organisations_pkey PRIMARY KEY (id);


--
-- Name: payment_schedule_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY payment_schedule
    ADD CONSTRAINT payment_schedule_pk PRIMARY KEY (id);


--
-- Name: payment_types_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY payment_types
    ADD CONSTRAINT payment_types_code_uq UNIQUE (code);


--
-- Name: payment_types_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY payment_types
    ADD CONSTRAINT payment_types_pk PRIMARY KEY (id);


--
-- Name: payment_types_type_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY payment_types
    ADD CONSTRAINT payment_types_type_uq UNIQUE (type);


--
-- Name: person_bank_accounts_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY person_bank_accounts
    ADD CONSTRAINT person_bank_accounts_pk PRIMARY KEY (id);


--
-- Name: personal_titles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY personal_titles
    ADD CONSTRAINT personal_titles_pkey PRIMARY KEY (id);


--
-- Name: personal_titles_title_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY personal_titles
    ADD CONSTRAINT personal_titles_title_key UNIQUE (title);


--
-- Name: persons_email_uq0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY persons
    ADD CONSTRAINT persons_email_uq0 UNIQUE (login_email);


--
-- Name: persons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY persons
    ADD CONSTRAINT persons_pkey PRIMARY KEY (id);


--
-- Name: places_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY places
    ADD CONSTRAINT places_pkey PRIMARY KEY (id);


--
-- Name: programmes_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY programmes
    ADD CONSTRAINT programmes_code_uq UNIQUE (code);


--
-- Name: programmes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY programmes
    ADD CONSTRAINT programmes_pkey PRIMARY KEY (id);


--
-- Name: project_beneficiaries_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_beneficiaries
    ADD CONSTRAINT project_beneficiaries_pk PRIMARY KEY (id);


--
-- Name: project_beneficiaries_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_beneficiaries
    ADD CONSTRAINT project_beneficiaries_uq UNIQUE (beneficiary, project);


--
-- Name: project_contracts_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_contracts
    ADD CONSTRAINT project_contracts_pk PRIMARY KEY (id);


--
-- Name: project_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT project_expenses_pkey PRIMARY KEY (id);


--
-- Name: project_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_milestones
    ADD CONSTRAINT project_milestones_pkey PRIMARY KEY (id);


--
-- Name: project_outputs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_outputs
    ADD CONSTRAINT project_outputs_pkey PRIMARY KEY (id);


--
-- Name: project_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_statuses
    ADD CONSTRAINT project_statuses_pkey PRIMARY KEY (id);


--
-- Name: project_statuses_status_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_statuses
    ADD CONSTRAINT project_statuses_status_uq UNIQUE (status);


--
-- Name: project_types_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_types
    ADD CONSTRAINT project_types_code_uq UNIQUE (code);


--
-- Name: project_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_types
    ADD CONSTRAINT project_types_pkey PRIMARY KEY (id);


--
-- Name: project_types_type_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_types
    ADD CONSTRAINT project_types_type_uq UNIQUE (type);


--
-- Name: projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: projects_project_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_project_code_uq UNIQUE (project_code);


--
-- Name: provinces_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY provinces
    ADD CONSTRAINT provinces_code_uq UNIQUE (code);


--
-- Name: provinces_name_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY provinces
    ADD CONSTRAINT provinces_name_uq UNIQUE (name);


--
-- Name: provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (id);


--
-- Name: question_options_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY question_options
    ADD CONSTRAINT question_options_pk PRIMARY KEY (id);


--
-- Name: question_types_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY question_types
    ADD CONSTRAINT question_types_code_uq UNIQUE (code);


--
-- Name: question_types_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY question_types
    ADD CONSTRAINT question_types_pk PRIMARY KEY (id);


--
-- Name: question_types_type_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY question_types
    ADD CONSTRAINT question_types_type_uq UNIQUE (type);


--
-- Name: questions_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_pk PRIMARY KEY (id);


--
-- Name: submission_types_code_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY submission_types
    ADD CONSTRAINT submission_types_code_uq UNIQUE (code);


--
-- Name: submission_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY submission_types
    ADD CONSTRAINT submission_types_pkey PRIMARY KEY (id);


--
-- Name: submission_types_type_uq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY submission_types
    ADD CONSTRAINT submission_types_type_uq UNIQUE (type);


--
-- Name: suburbs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY suburbs
    ADD CONSTRAINT suburbs_pkey PRIMARY KEY (id);


--
-- Name: organisation_code_ix; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organisation_code_ix ON organisations USING btree (code) WITH (fillfactor=90);


--
-- Name: person_id_no_ix; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX person_id_no_ix ON persons USING btree (id_no) WITH (fillfactor=90);


--
-- Name: place_name_ix; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX place_name_ix ON places USING btree (name) WITH (fillfactor=90);


--
-- Name: province_code_ix; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX province_code_ix ON provinces USING btree (code) WITH (fillfactor=90);


SET search_path = basic_auth, pg_catalog;

--
-- Name: encrypt_pass; Type: TRIGGER; Schema: basic_auth; Owner: postgres
--

CREATE TRIGGER encrypt_pass BEFORE INSERT OR UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE encrypt_pass();


--
-- Name: ensure_user_role_exists; Type: TRIGGER; Schema: basic_auth; Owner: postgres
--

CREATE CONSTRAINT TRIGGER ensure_user_role_exists AFTER INSERT OR UPDATE ON users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE PROCEDURE check_role_exists();


--
-- Name: send_validation; Type: TRIGGER; Schema: basic_auth; Owner: postgres
--

CREATE TRIGGER send_validation AFTER INSERT ON users FOR EACH ROW EXECUTE PROCEDURE send_validation();


SET search_path = public, pg_catalog;

--
-- Name: assign_compliance_officer; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER assign_compliance_officer BEFORE INSERT OR UPDATE ON application_compliance_officers FOR EACH ROW EXECUTE PROCEDURE assign_compliance_officer();


--
-- Name: genorgcode; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER genorgcode BEFORE INSERT ON organisations FOR EACH ROW EXECUTE PROCEDURE genorgcode();


--
-- Name: update_users; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users INSTEAD OF INSERT OR DELETE OR UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_users();


SET search_path = basic_auth, pg_catalog;

--
-- Name: tokens_email_fkey; Type: FK CONSTRAINT; Schema: basic_auth; Owner: postgres
--

ALTER TABLE ONLY tokens
    ADD CONSTRAINT tokens_email_fkey FOREIGN KEY (email) REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE;


SET search_path = public, pg_catalog;

--
-- Name: admin_template_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY calls
    ADD CONSTRAINT admin_template_fk FOREIGN KEY (admin_compliance_template) REFERENCES compliance_templates(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: application_compliance_officers_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY compliance_answers
    ADD CONSTRAINT application_compliance_officers_fk FOREIGN KEY (application_compliance_officer) REFERENCES application_compliance_officers(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assessment_template_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY calls
    ADD CONSTRAINT assessment_template_fk FOREIGN KEY (assessment_compliance_template) REFERENCES compliance_templates(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: auditor_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisations
    ADD CONSTRAINT auditor_fk FOREIGN KEY (auditor) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bank_accounts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisation_bank_accounts
    ADD CONSTRAINT bank_accounts_fk FOREIGN KEY (bankaccount) REFERENCES bank_accounts(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bank_accounts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY person_bank_accounts
    ADD CONSTRAINT bank_accounts_fk FOREIGN KEY (person) REFERENCES bank_accounts(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bank_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY bank_accounts
    ADD CONSTRAINT bank_fk FOREIGN KEY (bank) REFERENCES organisations(id) MATCH FULL;


--
-- Name: beneficiaries_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_beneficiaries
    ADD CONSTRAINT beneficiaries_fk FOREIGN KEY (beneficiary) REFERENCES beneficiaries(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: call_application_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT call_application_fk FOREIGN KEY (call_application) REFERENCES call_applications(id) MATCH FULL;


--
-- Name: call_application_statuses_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY call_applications
    ADD CONSTRAINT call_application_statuses_fk FOREIGN KEY (application_status) REFERENCES call_application_statuses(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: call_applications_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY application_compliance_officers
    ADD CONSTRAINT call_applications_fk FOREIGN KEY (application) REFERENCES call_applications(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: call_applications_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY call_evaluations
    ADD CONSTRAINT call_applications_fk0 FOREIGN KEY (call_application) REFERENCES call_applications(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: calls_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY call_applications
    ADD CONSTRAINT calls_fk FOREIGN KEY (call) REFERENCES calls(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT categories_fk FOREIGN KEY (catergory) REFERENCES categories(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: compliance_templates_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY categories
    ADD CONSTRAINT compliance_templates_fk FOREIGN KEY (template) REFERENCES compliance_templates(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: contract_types_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_contracts
    ADD CONSTRAINT contract_types_fk FOREIGN KEY (contract_type) REFERENCES contract_types(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: due_diligence_template_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY calls
    ADD CONSTRAINT due_diligence_template_fk FOREIGN KEY (due_diligence_compliance_template) REFERENCES compliance_templates(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: evc_attendees_attendee_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY evc_attendees
    ADD CONSTRAINT evc_attendees_attendee_fk FOREIGN KEY (attendee) REFERENCES persons(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evc_attendees_evc_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY evc_attendees
    ADD CONSTRAINT evc_attendees_evc_fk FOREIGN KEY (evc) REFERENCES evaluation_committee_meeting(id) MATCH FULL;


--
-- Name: evc_has_applications_application_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY evc_applications
    ADD CONSTRAINT evc_has_applications_application_fk FOREIGN KEY (application) REFERENCES call_applications(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evc_has_applications_evc_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY evc_applications
    ADD CONSTRAINT evc_has_applications_evc_fk FOREIGN KEY (evc) REFERENCES evaluation_committee_meeting(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_titles_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY persons
    ADD CONSTRAINT job_titles_fk FOREIGN KEY (job_title) REFERENCES job_titles(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: key_performance_indicator_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_outputs
    ADD CONSTRAINT key_performance_indicator_fk FOREIGN KEY (key_performance_indicator) REFERENCES key_performance_indicators(id) MATCH FULL;


--
-- Name: key_performance_indicator_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT key_performance_indicator_fk FOREIGN KEY (key_performance_indicator) REFERENCES key_performance_indicators(id) MATCH FULL;


--
-- Name: key_performance_indicators_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY calls
    ADD CONSTRAINT key_performance_indicators_fk FOREIGN KEY (key_performance_indicator) REFERENCES key_performance_indicators(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: key_performance_indicators_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY key_performance_indicators_targets
    ADD CONSTRAINT key_performance_indicators_fk FOREIGN KEY (key_performance_indicator) REFERENCES key_performance_indicators(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: key_result_areas_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY key_performance_indicators
    ADD CONSTRAINT key_result_areas_fk FOREIGN KEY (key_result_area) REFERENCES key_result_areas(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: latest_milestone_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT latest_milestone_fk FOREIGN KEY (latest_milestone) REFERENCES project_milestones(id) MATCH FULL;


--
-- Name: milestone_of; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_outputs
    ADD CONSTRAINT milestone_of FOREIGN KEY (project) REFERENCES projects(id);


--
-- Name: milestone_type_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_milestones
    ADD CONSTRAINT milestone_type_fk FOREIGN KEY (milestone_type) REFERENCES milestone_types(id) MATCH FULL;


--
-- Name: organisation_statuses_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisations
    ADD CONSTRAINT organisation_statuses_fk FOREIGN KEY (organisation_status) REFERENCES organisation_statuses(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: organisation_types_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisations
    ADD CONSTRAINT organisation_types_fk FOREIGN KEY (organisation_type) REFERENCES organisation_types(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: organisations_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisation_bank_accounts
    ADD CONSTRAINT organisations_fk FOREIGN KEY (ogranisation) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: organisations_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT organisations_fk FOREIGN KEY (organisation) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: organisations_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY call_applications
    ADD CONSTRAINT organisations_fk0 FOREIGN KEY (applicant) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: organisations_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY persons
    ADD CONSTRAINT organisations_fk1 FOREIGN KEY (employer) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: partner_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT partner_fk FOREIGN KEY (partner) REFERENCES organisations(id) MATCH FULL;


--
-- Name: payment_reference_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT payment_reference_fk FOREIGN KEY (project) REFERENCES projects(id) MATCH FULL;


--
-- Name: payment_schedule_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT payment_schedule_fk FOREIGN KEY (payment_schedule) REFERENCES payment_schedule(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payment_types_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT payment_types_fk FOREIGN KEY (payment_type) REFERENCES payment_types(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: personal_titles_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY persons
    ADD CONSTRAINT personal_titles_fk FOREIGN KEY (personal_title) REFERENCES personal_titles(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: persons_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY application_compliance_officers
    ADD CONSTRAINT persons_fk FOREIGN KEY (compliance_officer) REFERENCES persons(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: persons_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY call_evaluations
    ADD CONSTRAINT persons_fk FOREIGN KEY (evaluator) REFERENCES persons(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: persons_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY person_bank_accounts
    ADD CONSTRAINT persons_fk FOREIGN KEY (bankaccount) REFERENCES persons(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: persons_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_contracts
    ADD CONSTRAINT persons_fk FOREIGN KEY (person) REFERENCES persons(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: persons_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT persons_fk FOREIGN KEY (person) REFERENCES persons(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: place_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT place_fk FOREIGN KEY (place) REFERENCES places(id) MATCH FULL;


--
-- Name: places_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY suburbs
    ADD CONSTRAINT places_fk0 FOREIGN KEY (place) REFERENCES places(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: places_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisations
    ADD CONSTRAINT places_fk1 FOREIGN KEY (place) REFERENCES places(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: places_fk2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY call_applications
    ADD CONSTRAINT places_fk2 FOREIGN KEY (place) REFERENCES places(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: programmes_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY key_result_areas
    ADD CONSTRAINT programmes_fk FOREIGN KEY (programme) REFERENCES programmes(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: project_contracts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY contract_budget_items
    ADD CONSTRAINT project_contracts_fk FOREIGN KEY (contract) REFERENCES project_contracts(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: project_contracts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY contract_implementation_plan
    ADD CONSTRAINT project_contracts_fk FOREIGN KEY (contract) REFERENCES project_contracts(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: project_contracts_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY payment_schedule
    ADD CONSTRAINT project_contracts_fk FOREIGN KEY (contract) REFERENCES project_contracts(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: project_pk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_milestones
    ADD CONSTRAINT project_pk FOREIGN KEY (project) REFERENCES projects(id) MATCH FULL;


--
-- Name: project_status_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT project_status_fk FOREIGN KEY (project_status) REFERENCES project_statuses(id) MATCH FULL;


--
-- Name: project_type_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT project_type_fk FOREIGN KEY (project_type) REFERENCES project_types(id) MATCH FULL;


--
-- Name: projects_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_beneficiaries
    ADD CONSTRAINT projects_fk FOREIGN KEY (project) REFERENCES projects(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: projects_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY project_contracts
    ADD CONSTRAINT projects_fk FOREIGN KEY (project) REFERENCES projects(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: provinces_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY suburbs
    ADD CONSTRAINT provinces_fk0 FOREIGN KEY (province) REFERENCES provinces(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: provinces_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisations
    ADD CONSTRAINT provinces_fk1 FOREIGN KEY (province) REFERENCES provinces(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: provinces_fk2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY places
    ADD CONSTRAINT provinces_fk2 FOREIGN KEY (province) REFERENCES provinces(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: question_types_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT question_types_fk FOREIGN KEY (type) REFERENCES question_types(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: questions_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY compliance_answers
    ADD CONSTRAINT questions_fk FOREIGN KEY (question) REFERENCES questions(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: questions_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY question_options
    ADD CONSTRAINT questions_fk FOREIGN KEY (question) REFERENCES questions(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: referee_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY organisations
    ADD CONSTRAINT referee_fk FOREIGN KEY (referee) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: relevance_template_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY calls
    ADD CONSTRAINT relevance_template_fk FOREIGN KEY (relevance_compliance_template) REFERENCES compliance_templates(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: basic_auth; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA basic_auth FROM PUBLIC;
REVOKE ALL ON SCHEMA basic_auth FROM postgres;
GRANT ALL ON SCHEMA basic_auth TO postgres;
GRANT USAGE ON SCHEMA basic_auth TO anon;


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO alfresco_user;


--
-- Name: rpc_alfresco_change_application_status; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_change_application_status FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_change_application_status FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_change_application_status TO postgres;
GRANT ALL ON TABLE rpc_alfresco_change_application_status TO gpr_lookup_maintainer;


--
-- Name: rpc_alfresco_create_application_code; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_create_application_code FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_create_application_code FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_create_application_code TO postgres;
GRANT ALL ON TABLE rpc_alfresco_create_application_code TO gpr_lookup_maintainer;


--
-- Name: suburbs; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE suburbs FROM PUBLIC;
REVOKE ALL ON TABLE suburbs FROM postgres;
GRANT ALL ON TABLE suburbs TO postgres;
GRANT ALL ON TABLE suburbs TO gpr_lookup_maintainer WITH GRANT OPTION;


--
-- Name: rpc_alfresco_get_organisations; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_get_organisations FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_get_organisations FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_get_organisations TO postgres;
GRANT ALL ON TABLE rpc_alfresco_get_organisations TO gpr_lookup_maintainer;


--
-- Name: rpc_alfresco_create_application; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_create_application FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_create_application FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_create_application TO postgres;
GRANT ALL ON TABLE rpc_alfresco_create_application TO gpr_lookup_maintainer;


--
-- Name: rpc_alfresco_get_calls; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_get_calls FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_get_calls FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_get_calls TO postgres;
GRANT ALL ON TABLE rpc_alfresco_get_calls TO gpr_lookup_maintainer;


--
-- Name: places; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE places FROM PUBLIC;
REVOKE ALL ON TABLE places FROM postgres;
GRANT ALL ON TABLE places TO postgres;
GRANT ALL ON TABLE places TO gpr_lookup_maintainer WITH GRANT OPTION;


--
-- Name: provinces; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE provinces FROM PUBLIC;
REVOKE ALL ON TABLE provinces FROM postgres;
GRANT ALL ON TABLE provinces TO postgres;
GRANT ALL ON TABLE provinces TO gpr_lookup_maintainer WITH GRANT OPTION;


--
-- Name: rpc_alfresco_get_places; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_get_places FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_get_places FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_get_places TO postgres;
GRANT ALL ON TABLE rpc_alfresco_get_places TO gpr_lookup_maintainer;


--
-- Name: rpc_alfresco_get_cities; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_get_cities FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_get_cities FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_get_cities TO postgres;
GRANT ALL ON TABLE rpc_alfresco_get_cities TO gpr_lookup_maintainer;


--
-- Name: alfresco_get_organisations(integer, text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION alfresco_get_organisations("organisationId" integer, "organisationCode" text) FROM PUBLIC;
REVOKE ALL ON FUNCTION alfresco_get_organisations("organisationId" integer, "organisationCode" text) FROM postgres;
GRANT ALL ON FUNCTION alfresco_get_organisations("organisationId" integer, "organisationCode" text) TO postgres;
GRANT ALL ON FUNCTION alfresco_get_organisations("organisationId" integer, "organisationCode" text) TO alfresco_user;


--
-- Name: rpc_alfresco_get_programmes; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_get_programmes FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_get_programmes FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_get_programmes TO postgres;
GRANT ALL ON TABLE rpc_alfresco_get_programmes TO gpr_lookup_maintainer;


--
-- Name: rpc_alfresco_get_project_statuses; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_get_project_statuses FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_get_project_statuses FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_get_project_statuses TO postgres;
GRANT ALL ON TABLE rpc_alfresco_get_project_statuses TO gpr_lookup_maintainer;


--
-- Name: rpc_alfresco_get_projects; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_get_projects FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_get_projects FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_get_projects TO postgres;
GRANT ALL ON TABLE rpc_alfresco_get_projects TO gpr_lookup_maintainer;


--
-- Name: rpc_alfresco_get_provinces; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_get_provinces FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_get_provinces FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_get_provinces TO postgres;
GRANT ALL ON TABLE rpc_alfresco_get_provinces TO gpr_lookup_maintainer;


--
-- Name: submission_types; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE submission_types FROM PUBLIC;
REVOKE ALL ON TABLE submission_types FROM postgres;
GRANT ALL ON TABLE submission_types TO postgres;
GRANT ALL ON TABLE submission_types TO gpr_lookup_maintainer;


--
-- Name: rpc_alfresco_get_submission_types; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_get_submission_types FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_get_submission_types FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_get_submission_types TO postgres;
GRANT ALL ON TABLE rpc_alfresco_get_submission_types TO gpr_lookup_maintainer;


--
-- Name: rpc_alfresco_get_suburbs; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE rpc_alfresco_get_suburbs FROM PUBLIC;
REVOKE ALL ON TABLE rpc_alfresco_get_suburbs FROM postgres;
GRANT ALL ON TABLE rpc_alfresco_get_suburbs TO postgres;
GRANT ALL ON TABLE rpc_alfresco_get_suburbs TO gpr_lookup_maintainer;


--
-- Name: create_ldap_user(text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION create_ldap_user(email text) FROM PUBLIC;
REVOKE ALL ON FUNCTION create_ldap_user(email text) FROM postgres;
GRANT ALL ON FUNCTION create_ldap_user(email text) TO postgres;
GRANT ALL ON FUNCTION create_ldap_user(email text) TO PUBLIC;


--
-- Name: login(text, text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION login(email text, pass text) FROM PUBLIC;
REVOKE ALL ON FUNCTION login(email text, pass text) FROM postgres;
GRANT ALL ON FUNCTION login(email text, pass text) TO postgres;
GRANT ALL ON FUNCTION login(email text, pass text) TO anon;
GRANT ALL ON FUNCTION login(email text, pass text) TO PUBLIC;


--
-- Name: request_password_reset(text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION request_password_reset(email text) FROM PUBLIC;
REVOKE ALL ON FUNCTION request_password_reset(email text) FROM postgres;
GRANT ALL ON FUNCTION request_password_reset(email text) TO postgres;
GRANT ALL ON FUNCTION request_password_reset(email text) TO anon;
GRANT ALL ON FUNCTION request_password_reset(email text) TO PUBLIC;


--
-- Name: reset_password(text, uuid, text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION reset_password(email text, token uuid, pass text) FROM PUBLIC;
REVOKE ALL ON FUNCTION reset_password(email text, token uuid, pass text) FROM postgres;
GRANT ALL ON FUNCTION reset_password(email text, token uuid, pass text) TO postgres;
GRANT ALL ON FUNCTION reset_password(email text, token uuid, pass text) TO anon;
GRANT ALL ON FUNCTION reset_password(email text, token uuid, pass text) TO PUBLIC;


--
-- Name: signup(text, text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION signup(email text, pass text) FROM PUBLIC;
REVOKE ALL ON FUNCTION signup(email text, pass text) FROM postgres;
GRANT ALL ON FUNCTION signup(email text, pass text) TO postgres;
GRANT ALL ON FUNCTION signup(email text, pass text) TO anon;
GRANT ALL ON FUNCTION signup(email text, pass text) TO PUBLIC;


--
-- Name: validate_user(text, uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION validate_user(email text, token uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION validate_user(email text, token uuid) FROM postgres;
GRANT ALL ON FUNCTION validate_user(email text, token uuid) TO postgres;
GRANT ALL ON FUNCTION validate_user(email text, token uuid) TO anon;
GRANT ALL ON FUNCTION validate_user(email text, token uuid) TO PUBLIC;


SET search_path = basic_auth, pg_catalog;

--
-- Name: tokens; Type: ACL; Schema: basic_auth; Owner: postgres
--

REVOKE ALL ON TABLE tokens FROM PUBLIC;
REVOKE ALL ON TABLE tokens FROM postgres;
GRANT ALL ON TABLE tokens TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE tokens TO anon;


--
-- Name: users; Type: ACL; Schema: basic_auth; Owner: postgres
--

REVOKE ALL ON TABLE users FROM PUBLIC;
REVOKE ALL ON TABLE users FROM postgres;
GRANT ALL ON TABLE users TO postgres;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE users TO anon;


SET search_path = public, pg_catalog;

--
-- Name: email_notifications; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE email_notifications FROM PUBLIC;
REVOKE ALL ON TABLE email_notifications FROM postgres;
GRANT ALL ON TABLE email_notifications TO postgres;
GRANT ALL ON TABLE email_notifications TO gpr_lookup_maintainer;
GRANT INSERT ON TABLE email_notifications TO anon;
GRANT INSERT ON TABLE email_notifications TO PUBLIC;


--
-- Name: email_notifications_id_seq; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON SEQUENCE email_notifications_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE email_notifications_id_seq FROM postgres;
GRANT ALL ON SEQUENCE email_notifications_id_seq TO postgres;
GRANT USAGE ON SEQUENCE email_notifications_id_seq TO anon;
GRANT USAGE ON SEQUENCE email_notifications_id_seq TO PUBLIC;


--
-- Name: email_notifications_not_sent; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE email_notifications_not_sent FROM PUBLIC;
REVOKE ALL ON TABLE email_notifications_not_sent FROM postgres;
GRANT ALL ON TABLE email_notifications_not_sent TO postgres;
GRANT ALL ON TABLE email_notifications_not_sent TO gpr_lookup_maintainer;


--
-- Name: email_notifications_to_json; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE email_notifications_to_json FROM PUBLIC;
REVOKE ALL ON TABLE email_notifications_to_json FROM postgres;
GRANT ALL ON TABLE email_notifications_to_json TO postgres;
GRANT ALL ON TABLE email_notifications_to_json TO gpr_lookup_maintainer;


--
-- Name: evaluation_committee_meeting; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE evaluation_committee_meeting FROM PUBLIC;
REVOKE ALL ON TABLE evaluation_committee_meeting FROM postgres;
GRANT ALL ON TABLE evaluation_committee_meeting TO postgres;
GRANT ALL ON TABLE evaluation_committee_meeting TO gpr_lookup_maintainer;


--
-- Name: evc_applications; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE evc_applications FROM PUBLIC;
REVOKE ALL ON TABLE evc_applications FROM postgres;
GRANT ALL ON TABLE evc_applications TO postgres;
GRANT ALL ON TABLE evc_applications TO gpr_lookup_maintainer;


--
-- Name: evc_attendees; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE evc_attendees FROM PUBLIC;
REVOKE ALL ON TABLE evc_attendees FROM postgres;
GRANT ALL ON TABLE evc_attendees TO postgres;
GRANT ALL ON TABLE evc_attendees TO gpr_lookup_maintainer;


--
-- Name: grid_assigned_applications; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_assigned_applications FROM PUBLIC;
REVOKE ALL ON TABLE grid_assigned_applications FROM postgres;
GRANT ALL ON TABLE grid_assigned_applications TO postgres;
GRANT ALL ON TABLE grid_assigned_applications TO gpr_lookup_maintainer;


--
-- Name: grid_compliance_applications; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_compliance_applications FROM PUBLIC;
REVOKE ALL ON TABLE grid_compliance_applications FROM postgres;
GRANT ALL ON TABLE grid_compliance_applications TO postgres;
GRANT ALL ON TABLE grid_compliance_applications TO gpr_lookup_maintainer;


--
-- Name: grid_evc; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_evc FROM PUBLIC;
REVOKE ALL ON TABLE grid_evc FROM postgres;
GRANT ALL ON TABLE grid_evc TO postgres;
GRANT ALL ON TABLE grid_evc TO gpr_lookup_maintainer;


--
-- Name: grid_evc_applications; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_evc_applications FROM PUBLIC;
REVOKE ALL ON TABLE grid_evc_applications FROM postgres;
GRANT ALL ON TABLE grid_evc_applications TO postgres;
GRANT ALL ON TABLE grid_evc_applications TO gpr_lookup_maintainer;


--
-- Name: grid_evc_attendees; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_evc_attendees FROM PUBLIC;
REVOKE ALL ON TABLE grid_evc_attendees FROM postgres;
GRANT ALL ON TABLE grid_evc_attendees TO postgres;
GRANT ALL ON TABLE grid_evc_attendees TO gpr_lookup_maintainer;


--
-- Name: organisation_statuses; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE organisation_statuses FROM PUBLIC;
REVOKE ALL ON TABLE organisation_statuses FROM postgres;
GRANT ALL ON TABLE organisation_statuses TO postgres;
GRANT ALL ON TABLE organisation_statuses TO gpr_lookup_maintainer WITH GRANT OPTION;


--
-- Name: grid_org_statuses; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_org_statuses FROM PUBLIC;
REVOKE ALL ON TABLE grid_org_statuses FROM postgres;
GRANT ALL ON TABLE grid_org_statuses TO postgres;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,UPDATE ON TABLE grid_org_statuses TO gpr_lookup_maintainer;


--
-- Name: organisation_types; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE organisation_types FROM PUBLIC;
REVOKE ALL ON TABLE organisation_types FROM postgres;
GRANT ALL ON TABLE organisation_types TO postgres;
GRANT ALL ON TABLE organisation_types TO gpr_lookup_maintainer WITH GRANT OPTION;


--
-- Name: grid_org_types; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_org_types FROM PUBLIC;
REVOKE ALL ON TABLE grid_org_types FROM postgres;
GRANT ALL ON TABLE grid_org_types TO postgres;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,UPDATE ON TABLE grid_org_types TO gpr_lookup_maintainer WITH GRANT OPTION;


--
-- Name: users; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE users FROM PUBLIC;
REVOKE ALL ON TABLE users FROM postgres;
GRANT ALL ON TABLE users TO postgres;
GRANT ALL ON TABLE users TO gpr_lookup_maintainer;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE users TO anon;


--
-- Name: grid_persons; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_persons FROM PUBLIC;
REVOKE ALL ON TABLE grid_persons FROM postgres;
GRANT ALL ON TABLE grid_persons TO postgres;
GRANT ALL ON TABLE grid_persons TO gpr_lookup_maintainer;


--
-- Name: grid_places; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_places FROM PUBLIC;
REVOKE ALL ON TABLE grid_places FROM postgres;
GRANT ALL ON TABLE grid_places TO postgres;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,UPDATE ON TABLE grid_places TO gpr_lookup_maintainer WITH GRANT OPTION;


--
-- Name: grid_pmu_applications; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_pmu_applications FROM PUBLIC;
REVOKE ALL ON TABLE grid_pmu_applications FROM postgres;
GRANT ALL ON TABLE grid_pmu_applications TO postgres;
GRANT ALL ON TABLE grid_pmu_applications TO gpr_lookup_maintainer;


--
-- Name: grid_provinces; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_provinces FROM PUBLIC;
REVOKE ALL ON TABLE grid_provinces FROM postgres;
GRANT ALL ON TABLE grid_provinces TO postgres;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,UPDATE ON TABLE grid_provinces TO gpr_lookup_maintainer WITH GRANT OPTION;


--
-- Name: grid_suburbs; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE grid_suburbs FROM PUBLIC;
REVOKE ALL ON TABLE grid_suburbs FROM postgres;
GRANT ALL ON TABLE grid_suburbs TO postgres;
GRANT ALL ON TABLE grid_suburbs TO gpr_lookup_maintainer;


--
-- Name: ldap_users; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE ldap_users FROM PUBLIC;
REVOKE ALL ON TABLE ldap_users FROM postgres;
GRANT ALL ON TABLE ldap_users TO postgres;
GRANT ALL ON TABLE ldap_users TO gpr_lookup_maintainer;


--
-- Name: lookup_evc_applications; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE lookup_evc_applications FROM PUBLIC;
REVOKE ALL ON TABLE lookup_evc_applications FROM postgres;
GRANT ALL ON TABLE lookup_evc_applications TO postgres;
GRANT ALL ON TABLE lookup_evc_applications TO gpr_lookup_maintainer;


--
-- Name: lookup_roles; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE lookup_roles FROM PUBLIC;
REVOKE ALL ON TABLE lookup_roles FROM postgres;
GRANT ALL ON TABLE lookup_roles TO postgres;
GRANT ALL ON TABLE lookup_roles TO gpr_lookup_maintainer;


--
-- Name: question_types; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE question_types FROM PUBLIC;
REVOKE ALL ON TABLE question_types FROM postgres;
GRANT ALL ON TABLE question_types TO postgres;
GRANT ALL ON TABLE question_types TO gpr_lookup_maintainer WITH GRANT OPTION;


--
-- Name: reporting_assessment; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE reporting_assessment FROM PUBLIC;
REVOKE ALL ON TABLE reporting_assessment FROM postgres;
GRANT ALL ON TABLE reporting_assessment TO postgres;
GRANT ALL ON TABLE reporting_assessment TO gpr_lookup_maintainer;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES  FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES  FROM postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO gpr_lookup_maintainer;


--
-- PostgreSQL database dump complete
--

