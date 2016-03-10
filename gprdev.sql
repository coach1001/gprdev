PGDMP             	    
        t            gprdev    9.4.6    9.5.1 V   y
           0    0    ENCODING    ENCODING     #   SET client_encoding = 'SQL_ASCII';
                       false            z
           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                       false            {
           1262    16393    gprdev    DATABASE     x   CREATE DATABASE gprdev WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_ZA.UTF-8' LC_CTYPE = 'en_ZA.UTF-8';
    DROP DATABASE gprdev;
             postgres    false                        2615    59205    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
             postgres    false                        3079    11893    plpgsql 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
    DROP EXTENSION plpgsql;
                  false            |
           0    0    EXTENSION plpgsql    COMMENT     @   COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';
                       false    1            �            1259    59263    call_applications_id_seq    SEQUENCE     z   CREATE SEQUENCE call_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.call_applications_id_seq;
       public       postgres    false    25            �            1259    59265    call_applications    TABLE       CREATE TABLE call_applications (
    id integer DEFAULT nextval('call_applications_id_seq'::regclass) NOT NULL,
    call integer,
    amount money,
    applicant integer,
    place integer,
    comments text,
    application_status integer,
    score integer
);
 %   DROP TABLE public.call_applications;
       public         postgres    false    203    25            }
           0    0    TABLE call_applications    COMMENT     j   COMMENT ON TABLE call_applications IS 'A call application is a response to a call from an organisation.';
            public       postgres    false    204            �            1259    59454    organisations_id_seq    SEQUENCE     v   CREATE SEQUENCE organisations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.organisations_id_seq;
       public       postgres    false    25            �            1259    59456    organisations    TABLE       CREATE TABLE organisations (
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
    organisation_status integer
);
 !   DROP TABLE public.organisations;
       public         postgres    false    235    25            ~
           0    0    TABLE organisations    COMMENT     d   COMMENT ON TABLE organisations IS 'An organisation is an institution that operates in the sector.';
            public       postgres    false    236                       1259    59695    applicationid_with_email    VIEW       CREATE VIEW applicationid_with_email AS
 SELECT call_applications.id,
    call_applications.id AS code,
    organisations.email_address AS organisation_email_address
   FROM call_applications,
    organisations
  WHERE (call_applications.applicant = organisations.id);
 +   DROP VIEW public.applicationid_with_email;
       public       postgres    false    204    236    236    204    25            &           1255    59699 #   alfresco_create_project(text, text)    FUNCTION     �  CREATE FUNCTION alfresco_create_project(call_reference text, organisation_reference text) RETURNS SETOF applicationid_with_email
    LANGUAGE plpgsql COST 1 ROWS 50
    AS $$

DECLARE call_id INTEGER;
DECLARE application_id INTEGER;
DECLARE applicant_id INTEGER;

BEGIN
        	SELECT  calls.id INTO call_id
        	FROM calls
        	WHERE calls.call_reference = call_reference;
        
       	SELECT oganisations.id INTO applicant_id
       	FROM organisations
       	WHERE organisations.code = organisation_reference;
 
        	INSERT INTO call_applications (call,applicant) VALUES 			                     (call_id,application_id) 
        	RETURNING call_applications.id INTO application_id;
        
        	RETURN QUERY SELECT * FROM applicationid_with_email WHERE  
	applicationid_with_email.id = application_id;

	EXCEPTION WHEN OTHERS THEN /*Catch all*/
	RAISE EXCEPTION 'Something went wrong';
		
END;


$$;
 `   DROP FUNCTION public.alfresco_create_project(call_reference text, organisation_reference text);
       public       postgres    false    278    1    25            �            1259    59285    calls_id_seq    SEQUENCE     n   CREATE SEQUENCE calls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.calls_id_seq;
       public       postgres    false    25            �            1259    59287    calls    TABLE     C  CREATE TABLE calls (
    id integer DEFAULT nextval('calls_id_seq'::regclass) NOT NULL,
    call_reference character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    call_date date,
    evaluation_date date,
    key_performance_indicator integer,
    assessment_template integer
);
    DROP TABLE public.calls;
       public         postgres    false    207    25            
           0    0    TABLE calls    COMMENT     Y   COMMENT ON TABLE calls IS 'A call is a request for project proposals to support a KPI.';
            public       postgres    false    208                       1259    59690    call_lookup    VIEW     m   CREATE VIEW call_lookup AS
 SELECT calls.id,
    calls.call_reference AS code,
    calls.name
   FROM calls;
    DROP VIEW public.call_lookup;
       public       postgres    false    208    208    208    25            %           1255    59694    alfresco_get_calls(text)    FUNCTION     �   CREATE FUNCTION alfresco_get_calls(status text) RETURNS SETOF call_lookup
    LANGUAGE plpgsql COST 1 ROWS 50
    AS $$

BEGIN
RETURN QUERY SELECT * FROM call_lookup;
EXCEPTION WHEN OTHERS THEN 
	RAISE EXCEPTION 'Something went wrong';
END


$$;
 6   DROP FUNCTION public.alfresco_get_calls(status text);
       public       postgres    false    277    1    25            �            1259    59206    application_assessors_id_seq    SEQUENCE     ~   CREATE SEQUENCE application_assessors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.application_assessors_id_seq;
       public       postgres    false    25            �            1259    59208    application_assessors    TABLE     �   CREATE TABLE application_assessors (
    id integer DEFAULT nextval('application_assessors_id_seq'::regclass) NOT NULL,
    application integer,
    assessor integer,
    lead boolean NOT NULL
);
 )   DROP TABLE public.application_assessors;
       public         postgres    false    193    25            �            1259    59216    assessment_templates_id_seq    SEQUENCE     }   CREATE SEQUENCE assessment_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.assessment_templates_id_seq;
       public       postgres    false    25            �            1259    59218    assessment_templates    TABLE     �   CREATE TABLE assessment_templates (
    id integer DEFAULT nextval('assessment_templates_id_seq'::regclass) NOT NULL,
    name character varying(255)
);
 (   DROP TABLE public.assessment_templates;
       public         postgres    false    195    25            �            1259    59224    bank_accounts_id_seq    SEQUENCE     v   CREATE SEQUENCE bank_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.bank_accounts_id_seq;
       public       postgres    false    25            �            1259    59226    bank_accounts    TABLE       CREATE TABLE bank_accounts (
    id integer DEFAULT nextval('bank_accounts_id_seq'::regclass) NOT NULL,
    account_number text NOT NULL,
    account_name text,
    account_type text,
    branch_name text,
    branch_code text,
    bank integer NOT NULL
);
 !   DROP TABLE public.bank_accounts;
       public         postgres    false    197    25            �
           0    0    TABLE bank_accounts    COMMENT     N   COMMENT ON TABLE bank_accounts IS 'Bank account details of an organisation.';
            public       postgres    false    198            �            1259    59235    beneficiaries_id_seq    SEQUENCE     v   CREATE SEQUENCE beneficiaries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.beneficiaries_id_seq;
       public       postgres    false    25            �            1259    59237    beneficiaries    TABLE     �   CREATE TABLE beneficiaries (
    id integer DEFAULT nextval('beneficiaries_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    type character varying(255) NOT NULL,
    description text NOT NULL
);
 !   DROP TABLE public.beneficiaries;
       public         postgres    false    199    25            �
           0    0    TABLE beneficiaries    COMMENT     a   COMMENT ON TABLE beneficiaries IS 'A milestone type is a stage in the life-cycle of a project.';
            public       postgres    false    200            �            1259    59250     call_application_statuses_id_seq    SEQUENCE     �   CREATE SEQUENCE call_application_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.call_application_statuses_id_seq;
       public       postgres    false    25            �            1259    59252    call_application_statuses    TABLE     �   CREATE TABLE call_application_statuses (
    id integer DEFAULT nextval('call_application_statuses_id_seq'::regclass) NOT NULL,
    status character varying(255) NOT NULL,
    description text NOT NULL
);
 -   DROP TABLE public.call_application_statuses;
       public         postgres    false    201    25            �
           0    0    TABLE call_application_statuses    COMMENT     S   COMMENT ON TABLE call_application_statuses IS 'The status of a call application.';
            public       postgres    false    202            �            1259    59274    call_evaluations_id_seq    SEQUENCE     y   CREATE SEQUENCE call_evaluations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.call_evaluations_id_seq;
       public       postgres    false    25            �            1259    59276    call_evaluations    TABLE     �   CREATE TABLE call_evaluations (
    id integer DEFAULT nextval('call_evaluations_id_seq'::regclass) NOT NULL,
    call_application integer,
    score integer,
    remarks text,
    evaluator integer,
    evaluation_date date
);
 $   DROP TABLE public.call_evaluations;
       public         postgres    false    205    25            �
           0    0    TABLE call_evaluations    COMMENT     s   COMMENT ON TABLE call_evaluations IS 'A call evaluation is a score given by an evaluator for a project proposal.';
            public       postgres    false    206            �            1259    59298    categories_id_seq    SEQUENCE     s   CREATE SEQUENCE categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.categories_id_seq;
       public       postgres    false    25            �            1259    59300 
   categories    TABLE     z   CREATE TABLE categories (
    id integer DEFAULT nextval('categories_id_seq'::regclass) NOT NULL,
    template integer
);
    DROP TABLE public.categories;
       public         postgres    false    209    25            �            1259    59306    compliance_answers_id_seq    SEQUENCE     {   CREATE SEQUENCE compliance_answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.compliance_answers_id_seq;
       public       postgres    false    25            �            1259    59308    compliance_answers    TABLE     �   CREATE TABLE compliance_answers (
    id integer DEFAULT nextval('compliance_answers_id_seq'::regclass) NOT NULL,
    answer text NOT NULL,
    application_assessor integer,
    question integer
);
 &   DROP TABLE public.compliance_answers;
       public         postgres    false    211    25            �            1259    59319    contract_budget_items_id_seq    SEQUENCE     ~   CREATE SEQUENCE contract_budget_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.contract_budget_items_id_seq;
       public       postgres    false    25            �            1259    59321    contract_budget_items    TABLE     �   CREATE TABLE contract_budget_items (
    id integer DEFAULT nextval('contract_budget_items_id_seq'::regclass) NOT NULL,
    item character varying(255),
    description text,
    amount money,
    contract integer
);
 )   DROP TABLE public.contract_budget_items;
       public         postgres    false    213    25            �            1259    59330 #   contract_implementation_plan_id_seq    SEQUENCE     �   CREATE SEQUENCE contract_implementation_plan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 :   DROP SEQUENCE public.contract_implementation_plan_id_seq;
       public       postgres    false    25            �            1259    59332    contract_implementation_plan    TABLE     �   CREATE TABLE contract_implementation_plan (
    id integer DEFAULT nextval('contract_implementation_plan_id_seq'::regclass) NOT NULL,
    description text,
    contract integer
);
 0   DROP TABLE public.contract_implementation_plan;
       public         postgres    false    215    25            �            1259    59341    contract_types_id_seq    SEQUENCE     w   CREATE SEQUENCE contract_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.contract_types_id_seq;
       public       postgres    false    25            �            1259    59343    contract_types    TABLE     �   CREATE TABLE contract_types (
    id integer DEFAULT nextval('contract_types_id_seq'::regclass) NOT NULL,
    code character varying(50),
    type character varying(255)
);
 "   DROP TABLE public.contract_types;
       public         postgres    false    217    25            �            1259    59353    job_titles_id_seq    SEQUENCE     s   CREATE SEQUENCE job_titles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.job_titles_id_seq;
       public       postgres    false    25            �            1259    59355 
   job_titles    TABLE     �   CREATE TABLE job_titles (
    id integer DEFAULT nextval('job_titles_id_seq'::regclass) NOT NULL,
    title text NOT NULL,
    description text NOT NULL
);
    DROP TABLE public.job_titles;
       public         postgres    false    219    25            �
           0    0    TABLE job_titles    COMMENT     =   COMMENT ON TABLE job_titles IS 'The job title of a person.';
            public       postgres    false    220            �            1259    59366 !   key_performance_indicators_id_seq    SEQUENCE     �   CREATE SEQUENCE key_performance_indicators_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE public.key_performance_indicators_id_seq;
       public       postgres    false    25            �            1259    59368    key_performance_indicators    TABLE     [  CREATE TABLE key_performance_indicators (
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
 .   DROP TABLE public.key_performance_indicators;
       public         postgres    false    221    25            �
           0    0     TABLE key_performance_indicators    COMMENT     w   COMMENT ON TABLE key_performance_indicators IS 'A key performance indicator (KPI) is a measure of progress in a KRA.';
            public       postgres    false    222            �            1259    59379 )   key_performance_indicators_targets_id_seq    SEQUENCE     �   CREATE SEQUENCE key_performance_indicators_targets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 @   DROP SEQUENCE public.key_performance_indicators_targets_id_seq;
       public       postgres    false    25            �            1259    59381 "   key_performance_indicators_targets    TABLE     �   CREATE TABLE key_performance_indicators_targets (
    id integer DEFAULT nextval('key_performance_indicators_targets_id_seq'::regclass) NOT NULL,
    month date NOT NULL,
    target text,
    actual text,
    key_performance_indicator integer
);
 6   DROP TABLE public.key_performance_indicators_targets;
       public         postgres    false    223    25            �            1259    59392    key_result_areas_id_seq    SEQUENCE     y   CREATE SEQUENCE key_result_areas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.key_result_areas_id_seq;
       public       postgres    false    25            �            1259    59394    key_result_areas    TABLE     �   CREATE TABLE key_result_areas (
    id integer DEFAULT nextval('key_result_areas_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    programme integer
);
 $   DROP TABLE public.key_result_areas;
       public         postgres    false    225    25            �
           0    0    TABLE key_result_areas    COMMENT     _   COMMENT ON TABLE key_result_areas IS 'A key result area (KRA) is a component of a programme.';
            public       postgres    false    226            �            1259    59527    programmes_id_seq    SEQUENCE     s   CREATE SEQUENCE programmes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.programmes_id_seq;
       public       postgres    false    25            �            1259    59529 
   programmes    TABLE     �   CREATE TABLE programmes (
    id integer DEFAULT nextval('programmes_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    start_date date,
    end_date date
);
    DROP TABLE public.programmes;
       public         postgres    false    249    25            �
           0    0    TABLE programmes    COMMENT     a   COMMENT ON TABLE programmes IS 'A programme is a group of projects that have a common outcome.';
            public       postgres    false    250                       1259    59700    kpi_next_call_reference    VIEW     �  CREATE VIEW kpi_next_call_reference AS
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
 *   DROP VIEW public.kpi_next_call_reference;
       public       postgres    false    226    208    208    222    222    222    226    226    250    250    25            �            1259    59405    milestone_types_id_seq    SEQUENCE     x   CREATE SEQUENCE milestone_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.milestone_types_id_seq;
       public       postgres    false    25            �            1259    59407    milestone_types    TABLE     �   CREATE TABLE milestone_types (
    id integer DEFAULT nextval('milestone_types_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    type character varying(255) NOT NULL,
    description text NOT NULL
);
 #   DROP TABLE public.milestone_types;
       public         postgres    false    227    25            �
           0    0    TABLE milestone_types    COMMENT     c   COMMENT ON TABLE milestone_types IS 'A milestone type is a stage in the life-cycle of a project.';
            public       postgres    false    228            �            1259    59420 !   organisation_bank_accounts_id_seq    SEQUENCE     �   CREATE SEQUENCE organisation_bank_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE public.organisation_bank_accounts_id_seq;
       public       postgres    false    25            �            1259    59422    organisation_bank_accounts    TABLE     �   CREATE TABLE organisation_bank_accounts (
    id integer DEFAULT nextval('organisation_bank_accounts_id_seq'::regclass) NOT NULL,
    ogranisation integer,
    bankaccount integer
);
 .   DROP TABLE public.organisation_bank_accounts;
       public         postgres    false    229    25            �            1259    59428    organisation_statuses_id_seq    SEQUENCE     ~   CREATE SEQUENCE organisation_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.organisation_statuses_id_seq;
       public       postgres    false    25            �            1259    59430    organisation_statuses    TABLE     �   CREATE TABLE organisation_statuses (
    id integer DEFAULT nextval('organisation_statuses_id_seq'::regclass) NOT NULL,
    status character varying(255) NOT NULL,
    description text NOT NULL
);
 )   DROP TABLE public.organisation_statuses;
       public         postgres    false    231    25            �
           0    0    TABLE organisation_statuses    COMMENT     L   COMMENT ON TABLE organisation_statuses IS 'The status of an organisation.';
            public       postgres    false    232            �            1259    59441    organisation_types_id_seq    SEQUENCE     {   CREATE SEQUENCE organisation_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.organisation_types_id_seq;
       public       postgres    false    25            �            1259    59443    organisation_types    TABLE     �   CREATE TABLE organisation_types (
    id integer DEFAULT nextval('organisation_types_id_seq'::regclass) NOT NULL,
    type text NOT NULL,
    description text NOT NULL
);
 &   DROP TABLE public.organisation_types;
       public         postgres    false    233    25            �
           0    0    TABLE organisation_types    COMMENT     �   COMMENT ON TABLE organisation_types IS 'An organisation type describes nature of the institution, such as Funder, Grantee, Partner, Government Department and so on.';
            public       postgres    false    234            �            1259    59467    payment_schedule_id_seq    SEQUENCE     y   CREATE SEQUENCE payment_schedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.payment_schedule_id_seq;
       public       postgres    false    25            �            1259    59469    payment_schedule    TABLE     �   CREATE TABLE payment_schedule (
    id integer DEFAULT nextval('payment_schedule_id_seq'::regclass) NOT NULL,
    tranche integer NOT NULL,
    amount money NOT NULL,
    payment_date date NOT NULL,
    contract integer
);
 $   DROP TABLE public.payment_schedule;
       public         postgres    false    237    25            �            1259    59475    payment_types_id_seq    SEQUENCE     v   CREATE SEQUENCE payment_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.payment_types_id_seq;
       public       postgres    false    25            �            1259    59477    payment_types    TABLE     �   CREATE TABLE payment_types (
    id integer DEFAULT nextval('payment_types_id_seq'::regclass) NOT NULL,
    code character varying(50),
    type character varying(255)
);
 !   DROP TABLE public.payment_types;
       public         postgres    false    239    25            �            1259    59487    person_bank_accounts_id_seq    SEQUENCE     }   CREATE SEQUENCE person_bank_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.person_bank_accounts_id_seq;
       public       postgres    false    25            �            1259    59489    person_bank_accounts    TABLE     �   CREATE TABLE person_bank_accounts (
    id integer DEFAULT nextval('person_bank_accounts_id_seq'::regclass) NOT NULL,
    bankaccount integer,
    person integer
);
 (   DROP TABLE public.person_bank_accounts;
       public         postgres    false    241    25            �            1259    59495    personal_titles_id_seq    SEQUENCE     x   CREATE SEQUENCE personal_titles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.personal_titles_id_seq;
       public       postgres    false    25            �            1259    59497    personal_titles    TABLE     �   CREATE TABLE personal_titles (
    id integer DEFAULT nextval('personal_titles_id_seq'::regclass) NOT NULL,
    title text NOT NULL,
    description text NOT NULL
);
 #   DROP TABLE public.personal_titles;
       public         postgres    false    243    25            �
           0    0    TABLE personal_titles    COMMENT     U   COMMENT ON TABLE personal_titles IS 'The title of a person used in the salutation.';
            public       postgres    false    244            �            1259    59508    persons_id_seq    SEQUENCE     p   CREATE SEQUENCE persons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.persons_id_seq;
       public       postgres    false    25            �            1259    59510    persons    TABLE     �  CREATE TABLE persons (
    id integer DEFAULT nextval('persons_id_seq'::regclass) NOT NULL,
    id_no character varying(255),
    last_name character varying(255) NOT NULL,
    first_names character varying(255),
    cell_phone character varying(255),
    work_phone character varying(255),
    email_address character varying(255),
    job_title integer,
    personal_title integer,
    employer integer
);
    DROP TABLE public.persons;
       public         postgres    false    245    25            �
           0    0    TABLE persons    COMMENT     c   COMMENT ON TABLE persons IS 'A person is a member of staff or contact person in an organisation.';
            public       postgres    false    246            �            1259    59519    places_id_seq    SEQUENCE     o   CREATE SEQUENCE places_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.places_id_seq;
       public       postgres    false    25            �            1259    59521    places    TABLE     �   CREATE TABLE places (
    id integer DEFAULT nextval('places_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    province integer
);
    DROP TABLE public.places;
       public         postgres    false    247    25            �
           0    0    TABLE places    COMMENT     M   COMMENT ON TABLE places IS 'A place is a city or town, as defined by SAPO.';
            public       postgres    false    248            �            1259    59540    project_beneficiaries_id_seq    SEQUENCE     ~   CREATE SEQUENCE project_beneficiaries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.project_beneficiaries_id_seq;
       public       postgres    false    25            �            1259    59542    project_beneficiaries    TABLE     �   CREATE TABLE project_beneficiaries (
    id integer DEFAULT nextval('project_beneficiaries_id_seq'::regclass) NOT NULL,
    beneficiary integer,
    project integer
);
 )   DROP TABLE public.project_beneficiaries;
       public         postgres    false    251    25            �            1259    59550    project_contracts_id_seq    SEQUENCE     z   CREATE SEQUENCE project_contracts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.project_contracts_id_seq;
       public       postgres    false    25            �            1259    59552    project_contracts    TABLE     �   CREATE TABLE project_contracts (
    id integer DEFAULT nextval('project_contracts_id_seq'::regclass) NOT NULL,
    project integer,
    contract_type integer,
    person integer
);
 %   DROP TABLE public.project_contracts;
       public         postgres    false    253    25            �            1259    59558    project_expenses_id_seq    SEQUENCE     y   CREATE SEQUENCE project_expenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.project_expenses_id_seq;
       public       postgres    false    25                        1259    59560    project_expenses    TABLE     S  CREATE TABLE project_expenses (
    id integer DEFAULT nextval('project_expenses_id_seq'::regclass) NOT NULL,
    project integer NOT NULL,
    payment_reference character varying(255) NOT NULL,
    description text,
    amount money,
    payment_type integer,
    organisation integer,
    person integer,
    payment_schedule integer
);
 $   DROP TABLE public.project_expenses;
       public         postgres    false    255    25            �
           0    0    TABLE project_expenses    COMMENT     \   COMMENT ON TABLE project_expenses IS 'Project expenses are incurred by project activities';
            public       postgres    false    256                       1259    59569    project_milestones_id_seq    SEQUENCE     {   CREATE SEQUENCE project_milestones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.project_milestones_id_seq;
       public       postgres    false    25                       1259    59571    project_milestones    TABLE     �   CREATE TABLE project_milestones (
    id integer DEFAULT nextval('project_milestones_id_seq'::regclass) NOT NULL,
    project integer NOT NULL,
    milestone_type integer NOT NULL,
    milestone_date date
);
 &   DROP TABLE public.project_milestones;
       public         postgres    false    257    25            �
           0    0    TABLE project_milestones    COMMENT     j   COMMENT ON TABLE project_milestones IS 'A project milestone is a record of the milestones of a project.';
            public       postgres    false    258                       1259    59577    project_outputs_id_seq    SEQUENCE     x   CREATE SEQUENCE project_outputs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.project_outputs_id_seq;
       public       postgres    false    25                       1259    59579    project_outputs    TABLE     �   CREATE TABLE project_outputs (
    id integer DEFAULT nextval('project_outputs_id_seq'::regclass) NOT NULL,
    project integer NOT NULL,
    key_performance_indicator integer,
    description text
);
 #   DROP TABLE public.project_outputs;
       public         postgres    false    259    25            �
           0    0    TABLE project_outputs    COMMENT     p   COMMENT ON TABLE project_outputs IS 'Project outputs are produced by project activities and may support a KPI';
            public       postgres    false    260                       1259    59588    project_statuses_id_seq    SEQUENCE     y   CREATE SEQUENCE project_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.project_statuses_id_seq;
       public       postgres    false    25                       1259    59590    project_statuses    TABLE     �   CREATE TABLE project_statuses (
    id integer DEFAULT nextval('project_statuses_id_seq'::regclass) NOT NULL,
    status character varying(255) NOT NULL,
    description text NOT NULL
);
 $   DROP TABLE public.project_statuses;
       public         postgres    false    261    25            �
           0    0    TABLE project_statuses    COMMENT     A   COMMENT ON TABLE project_statuses IS 'The status of a project.';
            public       postgres    false    262                       1259    59601    project_types_id_seq    SEQUENCE     v   CREATE SEQUENCE project_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.project_types_id_seq;
       public       postgres    false    25                       1259    59603    project_types    TABLE     �   CREATE TABLE project_types (
    id integer DEFAULT nextval('project_types_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    type character varying(255) NOT NULL,
    description text NOT NULL
);
 !   DROP TABLE public.project_types;
       public         postgres    false    263    25            �
           0    0    TABLE project_types    COMMENT     W   COMMENT ON TABLE project_types IS 'A project type is one of Discretionary, Own, etc.';
            public       postgres    false    264            	           1259    59616    projects_id_seq    SEQUENCE     q   CREATE SEQUENCE projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.projects_id_seq;
       public       postgres    false    25            
           1259    59618    projects    TABLE     �  CREATE TABLE projects (
    id integer DEFAULT nextval('projects_id_seq'::regclass) NOT NULL,
    project_code text NOT NULL,
    name text NOT NULL,
    description text,
    project_officer integer NOT NULL,
    start_date date,
    end_date date,
    overall_budget money,
    call_application integer,
    key_performance_indicator integer,
    place integer,
    partner integer,
    latest_milestone integer,
    project_type integer NOT NULL,
    project_status integer NOT NULL
);
    DROP TABLE public.projects;
       public         postgres    false    265    25            �
           0    0    TABLE projects    COMMENT     s   COMMENT ON TABLE projects IS 'A project is a set of activities that may contribute to a KPI, or other objective.';
            public       postgres    false    266                       1259    59629    provinces_id_seq    SEQUENCE     r   CREATE SEQUENCE provinces_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.provinces_id_seq;
       public       postgres    false    25                       1259    59631 	   provinces    TABLE     �   CREATE TABLE provinces (
    id integer DEFAULT nextval('provinces_id_seq'::regclass) NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL
);
    DROP TABLE public.provinces;
       public         postgres    false    267    25            �
           0    0    TABLE provinces    COMMENT     V   COMMENT ON TABLE provinces IS 'A province is one of the 9 provinces in the country.';
            public       postgres    false    268                       1259    59641    question_options_id_seq    SEQUENCE     y   CREATE SEQUENCE question_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.question_options_id_seq;
       public       postgres    false    25                       1259    59643    question_options    TABLE     �   CREATE TABLE question_options (
    id integer DEFAULT nextval('question_options_id_seq'::regclass) NOT NULL,
    option text,
    question integer
);
 $   DROP TABLE public.question_options;
       public         postgres    false    269    25                       1259    59652    question_types_id_seq    SEQUENCE     w   CREATE SEQUENCE question_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.question_types_id_seq;
       public       postgres    false    25                       1259    59654    question_types    TABLE     �   CREATE TABLE question_types (
    id integer DEFAULT nextval('question_types_id_seq'::regclass) NOT NULL,
    code character varying(50),
    type character varying(255),
    angular_control character varying(50)
);
 "   DROP TABLE public.question_types;
       public         postgres    false    271    25                       1259    59664    questions_id_seq    SEQUENCE     r   CREATE SEQUENCE questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.questions_id_seq;
       public       postgres    false    25                       1259    59666 	   questions    TABLE     '  CREATE TABLE questions (
    id integer DEFAULT nextval('questions_id_seq'::regclass) NOT NULL,
    question text,
    weight real DEFAULT 0.01 NOT NULL,
    has_options boolean DEFAULT false NOT NULL,
    catergory integer,
    type integer,
    lead_question boolean DEFAULT false NOT NULL
);
    DROP TABLE public.questions;
       public         postgres    false    273    25                       1259    59678    suburbs_id_seq    SEQUENCE     p   CREATE SEQUENCE suburbs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.suburbs_id_seq;
       public       postgres    false    25                       1259    59680    suburbs    TABLE     &  CREATE TABLE suburbs (
    id integer DEFAULT nextval('suburbs_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    po_box_code character varying(50),
    street_code character varying(50),
    latitude real,
    longitude real,
    province integer,
    place integer
);
    DROP TABLE public.suburbs;
       public         postgres    false    275    25            �
           0    0    TABLE suburbs    COMMENT     n   COMMENT ON TABLE suburbs IS 'A suburb is part of a place with a Street and PO Box code, as defined by SAPO.';
            public       postgres    false    276                       1259    68206    test    VIEW     �  CREATE VIEW test AS
 SELECT key_performance_indicators.id,
    key_performance_indicators.code,
    key_performance_indicators.name,
    key_performance_indicators.description,
    key_performance_indicators.reporting_period,
    key_performance_indicators.baseline,
    key_performance_indicators.remarks,
    key_performance_indicators.status,
    key_performance_indicators.key_result_area,
    row_to_json(key_result_areas.*) AS key_result_areas
   FROM (key_performance_indicators
     LEFT JOIN ( SELECT key_result_areas_1.id,
            key_result_areas_1.code,
            key_result_areas_1.name,
            key_result_areas_1.description,
            key_result_areas_1.programme,
            row_to_json(programmes.*) AS programmes
           FROM (key_result_areas key_result_areas_1
             LEFT JOIN ( SELECT programmes_1.id,
                    programmes_1.code,
                    programmes_1.name,
                    programmes_1.description,
                    programmes_1.start_date,
                    programmes_1.end_date
                   FROM programmes programmes_1) programmes ON ((programmes.id = key_result_areas_1.programme)))) key_result_areas ON ((key_result_areas.id = key_performance_indicators.key_result_area)));
    DROP VIEW public.test;
       public       postgres    false    226    226    226    250    250    222    222    222    222    222    226    226    250    250    250    250    222    222    222    222    25            $
          0    59208    application_assessors 
   TABLE DATA               I   COPY application_assessors (id, application, assessor, lead) FROM stdin;
    public       postgres    false    194   ��      �
           0    0    application_assessors_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('application_assessors_id_seq', 1, false);
            public       postgres    false    193            &
          0    59218    assessment_templates 
   TABLE DATA               1   COPY assessment_templates (id, name) FROM stdin;
    public       postgres    false    196   ��      �
           0    0    assessment_templates_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('assessment_templates_id_seq', 1, false);
            public       postgres    false    195            (
          0    59226    bank_accounts 
   TABLE DATA               p   COPY bank_accounts (id, account_number, account_name, account_type, branch_name, branch_code, bank) FROM stdin;
    public       postgres    false    198   س      �
           0    0    bank_accounts_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('bank_accounts_id_seq', 1, false);
            public       postgres    false    197            *
          0    59237    beneficiaries 
   TABLE DATA               =   COPY beneficiaries (id, code, type, description) FROM stdin;
    public       postgres    false    200   ��      �
           0    0    beneficiaries_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('beneficiaries_id_seq', 1, false);
            public       postgres    false    199            ,
          0    59252    call_application_statuses 
   TABLE DATA               E   COPY call_application_statuses (id, status, description) FROM stdin;
    public       postgres    false    202   �      �
           0    0     call_application_statuses_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('call_application_statuses_id_seq', 1, false);
            public       postgres    false    201            .
          0    59265    call_applications 
   TABLE DATA               m   COPY call_applications (id, call, amount, applicant, place, comments, application_status, score) FROM stdin;
    public       postgres    false    204   /�      �
           0    0    call_applications_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('call_applications_id_seq', 1, false);
            public       postgres    false    203            0
          0    59276    call_evaluations 
   TABLE DATA               e   COPY call_evaluations (id, call_application, score, remarks, evaluator, evaluation_date) FROM stdin;
    public       postgres    false    206   L�      �
           0    0    call_evaluations_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('call_evaluations_id_seq', 1, false);
            public       postgres    false    205            2
          0    59287    calls 
   TABLE DATA               �   COPY calls (id, call_reference, name, description, call_date, evaluation_date, key_performance_indicator, assessment_template) FROM stdin;
    public       postgres    false    208   i�      �
           0    0    calls_id_seq    SEQUENCE SET     3   SELECT pg_catalog.setval('calls_id_seq', 1, true);
            public       postgres    false    207            4
          0    59300 
   categories 
   TABLE DATA               +   COPY categories (id, template) FROM stdin;
    public       postgres    false    210   ʴ      �
           0    0    categories_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('categories_id_seq', 1, false);
            public       postgres    false    209            6
          0    59308    compliance_answers 
   TABLE DATA               Q   COPY compliance_answers (id, answer, application_assessor, question) FROM stdin;
    public       postgres    false    212   �      �
           0    0    compliance_answers_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('compliance_answers_id_seq', 1, false);
            public       postgres    false    211            8
          0    59321    contract_budget_items 
   TABLE DATA               Q   COPY contract_budget_items (id, item, description, amount, contract) FROM stdin;
    public       postgres    false    214   �      �
           0    0    contract_budget_items_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('contract_budget_items_id_seq', 1, false);
            public       postgres    false    213            :
          0    59332    contract_implementation_plan 
   TABLE DATA               J   COPY contract_implementation_plan (id, description, contract) FROM stdin;
    public       postgres    false    216   !�      �
           0    0 #   contract_implementation_plan_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('contract_implementation_plan_id_seq', 1, false);
            public       postgres    false    215            <
          0    59343    contract_types 
   TABLE DATA               1   COPY contract_types (id, code, type) FROM stdin;
    public       postgres    false    218   >�      �
           0    0    contract_types_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('contract_types_id_seq', 1, false);
            public       postgres    false    217            >
          0    59355 
   job_titles 
   TABLE DATA               5   COPY job_titles (id, title, description) FROM stdin;
    public       postgres    false    220   [�      �
           0    0    job_titles_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('job_titles_id_seq', 1, false);
            public       postgres    false    219            @
          0    59368    key_performance_indicators 
   TABLE DATA               �   COPY key_performance_indicators (id, code, name, description, reporting_period, baseline, remarks, status, key_result_area) FROM stdin;
    public       postgres    false    222   x�      �
           0    0 !   key_performance_indicators_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('key_performance_indicators_id_seq', 1, true);
            public       postgres    false    221            B
          0    59381 "   key_performance_indicators_targets 
   TABLE DATA               k   COPY key_performance_indicators_targets (id, month, target, actual, key_performance_indicator) FROM stdin;
    public       postgres    false    224   ��      �
           0    0 )   key_performance_indicators_targets_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('key_performance_indicators_targets_id_seq', 1, false);
            public       postgres    false    223            D
          0    59394    key_result_areas 
   TABLE DATA               K   COPY key_result_areas (id, code, name, description, programme) FROM stdin;
    public       postgres    false    226   ص      �
           0    0    key_result_areas_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('key_result_areas_id_seq', 1, true);
            public       postgres    false    225            F
          0    59407    milestone_types 
   TABLE DATA               ?   COPY milestone_types (id, code, type, description) FROM stdin;
    public       postgres    false    228   �      �
           0    0    milestone_types_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('milestone_types_id_seq', 1, false);
            public       postgres    false    227            H
          0    59422    organisation_bank_accounts 
   TABLE DATA               L   COPY organisation_bank_accounts (id, ogranisation, bankaccount) FROM stdin;
    public       postgres    false    230   +�      �
           0    0 !   organisation_bank_accounts_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('organisation_bank_accounts_id_seq', 1, false);
            public       postgres    false    229            J
          0    59430    organisation_statuses 
   TABLE DATA               A   COPY organisation_statuses (id, status, description) FROM stdin;
    public       postgres    false    232   H�      �
           0    0    organisation_statuses_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('organisation_statuses_id_seq', 2, true);
            public       postgres    false    231            L
          0    59443    organisation_types 
   TABLE DATA               <   COPY organisation_types (id, type, description) FROM stdin;
    public       postgres    false    234   ��      �
           0    0    organisation_types_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('organisation_types_id_seq', 5, true);
            public       postgres    false    233            N
          0    59456    organisations 
   TABLE DATA                 COPY organisations (id, code, name, web_site, vat_no, npo_no, cell_phone, work_phone, email_address, fax_no, street_first_line, street_second_line, postal_first_line, postal_second_line, suburb, place, province, referee, auditor, organisation_type, organisation_status) FROM stdin;
    public       postgres    false    236   �      �
           0    0    organisations_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('organisations_id_seq', 1, false);
            public       postgres    false    235            P
          0    59469    payment_schedule 
   TABLE DATA               P   COPY payment_schedule (id, tranche, amount, payment_date, contract) FROM stdin;
    public       postgres    false    238   X�      �
           0    0    payment_schedule_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('payment_schedule_id_seq', 1, false);
            public       postgres    false    237            R
          0    59477    payment_types 
   TABLE DATA               0   COPY payment_types (id, code, type) FROM stdin;
    public       postgres    false    240   u�      �
           0    0    payment_types_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('payment_types_id_seq', 1, false);
            public       postgres    false    239            T
          0    59489    person_bank_accounts 
   TABLE DATA               @   COPY person_bank_accounts (id, bankaccount, person) FROM stdin;
    public       postgres    false    242   ��      �
           0    0    person_bank_accounts_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('person_bank_accounts_id_seq', 1, false);
            public       postgres    false    241            V
          0    59497    personal_titles 
   TABLE DATA               :   COPY personal_titles (id, title, description) FROM stdin;
    public       postgres    false    244   ��      �
           0    0    personal_titles_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('personal_titles_id_seq', 1, false);
            public       postgres    false    243            X
          0    59510    persons 
   TABLE DATA               �   COPY persons (id, id_no, last_name, first_names, cell_phone, work_phone, email_address, job_title, personal_title, employer) FROM stdin;
    public       postgres    false    246   ̷      �
           0    0    persons_id_seq    SEQUENCE SET     6   SELECT pg_catalog.setval('persons_id_seq', 1, false);
            public       postgres    false    245            Z
          0    59521    places 
   TABLE DATA               -   COPY places (id, name, province) FROM stdin;
    public       postgres    false    248   �      �
           0    0    places_id_seq    SEQUENCE SET     4   SELECT pg_catalog.setval('places_id_seq', 4, true);
            public       postgres    false    247            \
          0    59529 
   programmes 
   TABLE DATA               P   COPY programmes (id, code, name, description, start_date, end_date) FROM stdin;
    public       postgres    false    250   �      �
           0    0    programmes_id_seq    SEQUENCE SET     8   SELECT pg_catalog.setval('programmes_id_seq', 1, true);
            public       postgres    false    249            ^
          0    59542    project_beneficiaries 
   TABLE DATA               B   COPY project_beneficiaries (id, beneficiary, project) FROM stdin;
    public       postgres    false    252   f�      �
           0    0    project_beneficiaries_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('project_beneficiaries_id_seq', 1, false);
            public       postgres    false    251            `
          0    59552    project_contracts 
   TABLE DATA               H   COPY project_contracts (id, project, contract_type, person) FROM stdin;
    public       postgres    false    254   ��      �
           0    0    project_contracts_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('project_contracts_id_seq', 1, false);
            public       postgres    false    253            b
          0    59560    project_expenses 
   TABLE DATA               �   COPY project_expenses (id, project, payment_reference, description, amount, payment_type, organisation, person, payment_schedule) FROM stdin;
    public       postgres    false    256   ��      �
           0    0    project_expenses_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('project_expenses_id_seq', 1, false);
            public       postgres    false    255            d
          0    59571    project_milestones 
   TABLE DATA               R   COPY project_milestones (id, project, milestone_type, milestone_date) FROM stdin;
    public       postgres    false    258   ��      �
           0    0    project_milestones_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('project_milestones_id_seq', 1, false);
            public       postgres    false    257            f
          0    59579    project_outputs 
   TABLE DATA               W   COPY project_outputs (id, project, key_performance_indicator, description) FROM stdin;
    public       postgres    false    260   ڸ      �
           0    0    project_outputs_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('project_outputs_id_seq', 1, false);
            public       postgres    false    259            h
          0    59590    project_statuses 
   TABLE DATA               <   COPY project_statuses (id, status, description) FROM stdin;
    public       postgres    false    262   ��      �
           0    0    project_statuses_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('project_statuses_id_seq', 1, false);
            public       postgres    false    261            j
          0    59603    project_types 
   TABLE DATA               =   COPY project_types (id, code, type, description) FROM stdin;
    public       postgres    false    264   �      �
           0    0    project_types_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('project_types_id_seq', 1, false);
            public       postgres    false    263            l
          0    59618    projects 
   TABLE DATA               �   COPY projects (id, project_code, name, description, project_officer, start_date, end_date, overall_budget, call_application, key_performance_indicator, place, partner, latest_milestone, project_type, project_status) FROM stdin;
    public       postgres    false    266   1�      �
           0    0    projects_id_seq    SEQUENCE SET     7   SELECT pg_catalog.setval('projects_id_seq', 1, false);
            public       postgres    false    265            n
          0    59631 	   provinces 
   TABLE DATA               ,   COPY provinces (id, code, name) FROM stdin;
    public       postgres    false    268   N�      �
           0    0    provinces_id_seq    SEQUENCE SET     8   SELECT pg_catalog.setval('provinces_id_seq', 10, true);
            public       postgres    false    267            p
          0    59643    question_options 
   TABLE DATA               9   COPY question_options (id, option, question) FROM stdin;
    public       postgres    false    270   �      �
           0    0    question_options_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('question_options_id_seq', 1, false);
            public       postgres    false    269            r
          0    59654    question_types 
   TABLE DATA               B   COPY question_types (id, code, type, angular_control) FROM stdin;
    public       postgres    false    272   �      �
           0    0    question_types_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('question_types_id_seq', 1, false);
            public       postgres    false    271            t
          0    59666 	   questions 
   TABLE DATA               _   COPY questions (id, question, weight, has_options, catergory, type, lead_question) FROM stdin;
    public       postgres    false    274   %�      �
           0    0    questions_id_seq    SEQUENCE SET     8   SELECT pg_catalog.setval('questions_id_seq', 1, false);
            public       postgres    false    273            v
          0    59680    suburbs 
   TABLE DATA               d   COPY suburbs (id, name, po_box_code, street_code, latitude, longitude, province, place) FROM stdin;
    public       postgres    false    276   B�      �
           0    0    suburbs_id_seq    SEQUENCE SET     5   SELECT pg_catalog.setval('suburbs_id_seq', 4, true);
            public       postgres    false    275            	           2606    59340    activities_pk 
   CONSTRAINT     a   ALTER TABLE ONLY contract_implementation_plan
    ADD CONSTRAINT activities_pk PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.contract_implementation_plan DROP CONSTRAINT activities_pk;
       public         postgres    false    216    216            �           2606    59213    application_assessors_pk 
   CONSTRAINT     e   ALTER TABLE ONLY application_assessors
    ADD CONSTRAINT application_assessors_pk PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.application_assessors DROP CONSTRAINT application_assessors_pk;
       public         postgres    false    194    194            �           2606    59223    assessment_templates_pk 
   CONSTRAINT     c   ALTER TABLE ONLY assessment_templates
    ADD CONSTRAINT assessment_templates_pk PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.assessment_templates DROP CONSTRAINT assessment_templates_pk;
       public         postgres    false    196    196            �           2606    59215    assessor_application_uq 
   CONSTRAINT     r   ALTER TABLE ONLY application_assessors
    ADD CONSTRAINT assessor_application_uq UNIQUE (application, assessor);
 W   ALTER TABLE ONLY public.application_assessors DROP CONSTRAINT assessor_application_uq;
       public         postgres    false    194    194    194            �           2606    59234    bank_accounts_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.bank_accounts DROP CONSTRAINT bank_accounts_pkey;
       public         postgres    false    198    198            �           2606    59247    beneficiaries_code_uq 
   CONSTRAINT     W   ALTER TABLE ONLY beneficiaries
    ADD CONSTRAINT beneficiaries_code_uq UNIQUE (code);
 M   ALTER TABLE ONLY public.beneficiaries DROP CONSTRAINT beneficiaries_code_uq;
       public         postgres    false    200    200            �           2606    59245    beneficiaries_pk 
   CONSTRAINT     U   ALTER TABLE ONLY beneficiaries
    ADD CONSTRAINT beneficiaries_pk PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.beneficiaries DROP CONSTRAINT beneficiaries_pk;
       public         postgres    false    200    200            �           2606    59249    beneficiaries_types_type_uq 
   CONSTRAINT     ]   ALTER TABLE ONLY beneficiaries
    ADD CONSTRAINT beneficiaries_types_type_uq UNIQUE (type);
 S   ALTER TABLE ONLY public.beneficiaries DROP CONSTRAINT beneficiaries_types_type_uq;
       public         postgres    false    200    200            	           2606    59329 	   budget_pk 
   CONSTRAINT     V   ALTER TABLE ONLY contract_budget_items
    ADD CONSTRAINT budget_pk PRIMARY KEY (id);
 I   ALTER TABLE ONLY public.contract_budget_items DROP CONSTRAINT budget_pk;
       public         postgres    false    214    214            �           2606    59260    call_application_statuses_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY call_application_statuses
    ADD CONSTRAINT call_application_statuses_pkey PRIMARY KEY (id);
 b   ALTER TABLE ONLY public.call_application_statuses DROP CONSTRAINT call_application_statuses_pkey;
       public         postgres    false    202    202            �           2606    59262 #   call_application_statuses_status_uq 
   CONSTRAINT     s   ALTER TABLE ONLY call_application_statuses
    ADD CONSTRAINT call_application_statuses_status_uq UNIQUE (status);
 g   ALTER TABLE ONLY public.call_application_statuses DROP CONSTRAINT call_application_statuses_status_uq;
       public         postgres    false    202    202            �           2606    59273    call_applications_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY call_applications
    ADD CONSTRAINT call_applications_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.call_applications DROP CONSTRAINT call_applications_pkey;
       public         postgres    false    204    204            �           2606    59284    call_evaluations_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY call_evaluations
    ADD CONSTRAINT call_evaluations_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.call_evaluations DROP CONSTRAINT call_evaluations_pkey;
       public         postgres    false    206    206            �           2606    59297    calls_call_reference_uq 
   CONSTRAINT     [   ALTER TABLE ONLY calls
    ADD CONSTRAINT calls_call_reference_uq UNIQUE (call_reference);
 G   ALTER TABLE ONLY public.calls DROP CONSTRAINT calls_call_reference_uq;
       public         postgres    false    208    208            �           2606    59295 
   calls_pkey 
   CONSTRAINT     G   ALTER TABLE ONLY calls
    ADD CONSTRAINT calls_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.calls DROP CONSTRAINT calls_pkey;
       public         postgres    false    208    208            �           2606    59305    categories_pk 
   CONSTRAINT     O   ALTER TABLE ONLY categories
    ADD CONSTRAINT categories_pk PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pk;
       public         postgres    false    210    210            �           2606    59316    compliance_answers_pk 
   CONSTRAINT     _   ALTER TABLE ONLY compliance_answers
    ADD CONSTRAINT compliance_answers_pk PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.compliance_answers DROP CONSTRAINT compliance_answers_pk;
       public         postgres    false    212    212             	           2606    59318    compliance_answers_uq 
   CONSTRAINT     v   ALTER TABLE ONLY compliance_answers
    ADD CONSTRAINT compliance_answers_uq UNIQUE (application_assessor, question);
 R   ALTER TABLE ONLY public.compliance_answers DROP CONSTRAINT compliance_answers_uq;
       public         postgres    false    212    212    212            	           2606    59350    contract_types_code_uq 
   CONSTRAINT     Y   ALTER TABLE ONLY contract_types
    ADD CONSTRAINT contract_types_code_uq UNIQUE (code);
 O   ALTER TABLE ONLY public.contract_types DROP CONSTRAINT contract_types_code_uq;
       public         postgres    false    218    218            	           2606    59348    contract_types_pk 
   CONSTRAINT     W   ALTER TABLE ONLY contract_types
    ADD CONSTRAINT contract_types_pk PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.contract_types DROP CONSTRAINT contract_types_pk;
       public         postgres    false    218    218            
	           2606    59352    contract_types_type_uq 
   CONSTRAINT     Y   ALTER TABLE ONLY contract_types
    ADD CONSTRAINT contract_types_type_uq UNIQUE (type);
 O   ALTER TABLE ONLY public.contract_types DROP CONSTRAINT contract_types_type_uq;
       public         postgres    false    218    218            	           2606    59363    job_titles_pkey 
   CONSTRAINT     Q   ALTER TABLE ONLY job_titles
    ADD CONSTRAINT job_titles_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.job_titles DROP CONSTRAINT job_titles_pkey;
       public         postgres    false    220    220            	           2606    59365    job_titles_title_uq 
   CONSTRAINT     S   ALTER TABLE ONLY job_titles
    ADD CONSTRAINT job_titles_title_uq UNIQUE (title);
 H   ALTER TABLE ONLY public.job_titles DROP CONSTRAINT job_titles_title_uq;
       public         postgres    false    220    220            	           2606    59378 "   key_performance_indicators_code_uq 
   CONSTRAINT     �   ALTER TABLE ONLY key_performance_indicators
    ADD CONSTRAINT key_performance_indicators_code_uq UNIQUE (code, key_result_area);
 g   ALTER TABLE ONLY public.key_performance_indicators DROP CONSTRAINT key_performance_indicators_code_uq;
       public         postgres    false    222    222    222            	           2606    59376    key_performance_indicators_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY key_performance_indicators
    ADD CONSTRAINT key_performance_indicators_pkey PRIMARY KEY (id);
 d   ALTER TABLE ONLY public.key_performance_indicators DROP CONSTRAINT key_performance_indicators_pkey;
       public         postgres    false    222    222            	           2606    59389 %   key_performance_indicators_targets_pk 
   CONSTRAINT        ALTER TABLE ONLY key_performance_indicators_targets
    ADD CONSTRAINT key_performance_indicators_targets_pk PRIMARY KEY (id);
 r   ALTER TABLE ONLY public.key_performance_indicators_targets DROP CONSTRAINT key_performance_indicators_targets_pk;
       public         postgres    false    224    224            	           2606    59391 %   key_performance_indicators_targets_uq 
   CONSTRAINT     �   ALTER TABLE ONLY key_performance_indicators_targets
    ADD CONSTRAINT key_performance_indicators_targets_uq UNIQUE (key_performance_indicator, month);
 r   ALTER TABLE ONLY public.key_performance_indicators_targets DROP CONSTRAINT key_performance_indicators_targets_uq;
       public         postgres    false    224    224    224            	           2606    59404    key_result_areas_code_uq 
   CONSTRAINT     h   ALTER TABLE ONLY key_result_areas
    ADD CONSTRAINT key_result_areas_code_uq UNIQUE (code, programme);
 S   ALTER TABLE ONLY public.key_result_areas DROP CONSTRAINT key_result_areas_code_uq;
       public         postgres    false    226    226    226            	           2606    59402    key_result_areas_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY key_result_areas
    ADD CONSTRAINT key_result_areas_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.key_result_areas DROP CONSTRAINT key_result_areas_pkey;
       public         postgres    false    226    226            	           2606    59417    milestone_types_code_uq 
   CONSTRAINT     [   ALTER TABLE ONLY milestone_types
    ADD CONSTRAINT milestone_types_code_uq UNIQUE (code);
 Q   ALTER TABLE ONLY public.milestone_types DROP CONSTRAINT milestone_types_code_uq;
       public         postgres    false    228    228            	           2606    59415    milestone_types_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY milestone_types
    ADD CONSTRAINT milestone_types_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.milestone_types DROP CONSTRAINT milestone_types_pkey;
       public         postgres    false    228    228             	           2606    59419    milestone_types_type_uq 
   CONSTRAINT     [   ALTER TABLE ONLY milestone_types
    ADD CONSTRAINT milestone_types_type_uq UNIQUE (type);
 Q   ALTER TABLE ONLY public.milestone_types DROP CONSTRAINT milestone_types_type_uq;
       public         postgres    false    228    228            "	           2606    59427    organisation_bank_accounts_pk 
   CONSTRAINT     o   ALTER TABLE ONLY organisation_bank_accounts
    ADD CONSTRAINT organisation_bank_accounts_pk PRIMARY KEY (id);
 b   ALTER TABLE ONLY public.organisation_bank_accounts DROP CONSTRAINT organisation_bank_accounts_pk;
       public         postgres    false    230    230            -	           2606    59466    organisation_code_uq 
   CONSTRAINT     V   ALTER TABLE ONLY organisations
    ADD CONSTRAINT organisation_code_uq UNIQUE (code);
 L   ALTER TABLE ONLY public.organisations DROP CONSTRAINT organisation_code_uq;
       public         postgres    false    236    236            $	           2606    59438    organisation_statuses_pkey 
   CONSTRAINT     g   ALTER TABLE ONLY organisation_statuses
    ADD CONSTRAINT organisation_statuses_pkey PRIMARY KEY (id);
 Z   ALTER TABLE ONLY public.organisation_statuses DROP CONSTRAINT organisation_statuses_pkey;
       public         postgres    false    232    232            &	           2606    59440    organisation_statuses_status_uq 
   CONSTRAINT     k   ALTER TABLE ONLY organisation_statuses
    ADD CONSTRAINT organisation_statuses_status_uq UNIQUE (status);
 _   ALTER TABLE ONLY public.organisation_statuses DROP CONSTRAINT organisation_statuses_status_uq;
       public         postgres    false    232    232            (	           2606    59451    organisation_types_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY organisation_types
    ADD CONSTRAINT organisation_types_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.organisation_types DROP CONSTRAINT organisation_types_pkey;
       public         postgres    false    234    234            *	           2606    59453    organisation_types_type_uq 
   CONSTRAINT     a   ALTER TABLE ONLY organisation_types
    ADD CONSTRAINT organisation_types_type_uq UNIQUE (type);
 W   ALTER TABLE ONLY public.organisation_types DROP CONSTRAINT organisation_types_type_uq;
       public         postgres    false    234    234            /	           2606    59464    organisations_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY organisations
    ADD CONSTRAINT organisations_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.organisations DROP CONSTRAINT organisations_pkey;
       public         postgres    false    236    236            1	           2606    59474    payment_schedule_pk 
   CONSTRAINT     [   ALTER TABLE ONLY payment_schedule
    ADD CONSTRAINT payment_schedule_pk PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.payment_schedule DROP CONSTRAINT payment_schedule_pk;
       public         postgres    false    238    238            3	           2606    59484    payment_types_code_uq 
   CONSTRAINT     W   ALTER TABLE ONLY payment_types
    ADD CONSTRAINT payment_types_code_uq UNIQUE (code);
 M   ALTER TABLE ONLY public.payment_types DROP CONSTRAINT payment_types_code_uq;
       public         postgres    false    240    240            5	           2606    59482    payment_types_pk 
   CONSTRAINT     U   ALTER TABLE ONLY payment_types
    ADD CONSTRAINT payment_types_pk PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.payment_types DROP CONSTRAINT payment_types_pk;
       public         postgres    false    240    240            7	           2606    59486    payment_types_type_uq 
   CONSTRAINT     W   ALTER TABLE ONLY payment_types
    ADD CONSTRAINT payment_types_type_uq UNIQUE (type);
 M   ALTER TABLE ONLY public.payment_types DROP CONSTRAINT payment_types_type_uq;
       public         postgres    false    240    240            9	           2606    59494    person_bank_accounts_pk 
   CONSTRAINT     c   ALTER TABLE ONLY person_bank_accounts
    ADD CONSTRAINT person_bank_accounts_pk PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.person_bank_accounts DROP CONSTRAINT person_bank_accounts_pk;
       public         postgres    false    242    242            ;	           2606    59505    personal_titles_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY personal_titles
    ADD CONSTRAINT personal_titles_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.personal_titles DROP CONSTRAINT personal_titles_pkey;
       public         postgres    false    244    244            =	           2606    59507    personal_titles_title_key 
   CONSTRAINT     ^   ALTER TABLE ONLY personal_titles
    ADD CONSTRAINT personal_titles_title_key UNIQUE (title);
 S   ALTER TABLE ONLY public.personal_titles DROP CONSTRAINT personal_titles_title_key;
       public         postgres    false    244    244            @	           2606    59518    persons_pkey 
   CONSTRAINT     K   ALTER TABLE ONLY persons
    ADD CONSTRAINT persons_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.persons DROP CONSTRAINT persons_pkey;
       public         postgres    false    246    246            C	           2606    59526    places_pkey 
   CONSTRAINT     I   ALTER TABLE ONLY places
    ADD CONSTRAINT places_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.places DROP CONSTRAINT places_pkey;
       public         postgres    false    248    248            E	           2606    59539    programmes_code_uq 
   CONSTRAINT     Q   ALTER TABLE ONLY programmes
    ADD CONSTRAINT programmes_code_uq UNIQUE (code);
 G   ALTER TABLE ONLY public.programmes DROP CONSTRAINT programmes_code_uq;
       public         postgres    false    250    250            G	           2606    59537    programmes_pkey 
   CONSTRAINT     Q   ALTER TABLE ONLY programmes
    ADD CONSTRAINT programmes_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.programmes DROP CONSTRAINT programmes_pkey;
       public         postgres    false    250    250            I	           2606    59547    project_beneficiaries_pk 
   CONSTRAINT     e   ALTER TABLE ONLY project_beneficiaries
    ADD CONSTRAINT project_beneficiaries_pk PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.project_beneficiaries DROP CONSTRAINT project_beneficiaries_pk;
       public         postgres    false    252    252            K	           2606    59549    project_beneficiaries_uq 
   CONSTRAINT     r   ALTER TABLE ONLY project_beneficiaries
    ADD CONSTRAINT project_beneficiaries_uq UNIQUE (beneficiary, project);
 X   ALTER TABLE ONLY public.project_beneficiaries DROP CONSTRAINT project_beneficiaries_uq;
       public         postgres    false    252    252    252            M	           2606    59557    project_contracts_pk 
   CONSTRAINT     ]   ALTER TABLE ONLY project_contracts
    ADD CONSTRAINT project_contracts_pk PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.project_contracts DROP CONSTRAINT project_contracts_pk;
       public         postgres    false    254    254            O	           2606    59568    project_expenses_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT project_expenses_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.project_expenses DROP CONSTRAINT project_expenses_pkey;
       public         postgres    false    256    256            Q	           2606    59576    project_milestones_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY project_milestones
    ADD CONSTRAINT project_milestones_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.project_milestones DROP CONSTRAINT project_milestones_pkey;
       public         postgres    false    258    258            S	           2606    59587    project_outputs_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY project_outputs
    ADD CONSTRAINT project_outputs_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.project_outputs DROP CONSTRAINT project_outputs_pkey;
       public         postgres    false    260    260            U	           2606    59598    project_statuses_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY project_statuses
    ADD CONSTRAINT project_statuses_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.project_statuses DROP CONSTRAINT project_statuses_pkey;
       public         postgres    false    262    262            W	           2606    59600    project_statuses_status_uq 
   CONSTRAINT     a   ALTER TABLE ONLY project_statuses
    ADD CONSTRAINT project_statuses_status_uq UNIQUE (status);
 U   ALTER TABLE ONLY public.project_statuses DROP CONSTRAINT project_statuses_status_uq;
       public         postgres    false    262    262            Y	           2606    59613    project_types_code_uq 
   CONSTRAINT     W   ALTER TABLE ONLY project_types
    ADD CONSTRAINT project_types_code_uq UNIQUE (code);
 M   ALTER TABLE ONLY public.project_types DROP CONSTRAINT project_types_code_uq;
       public         postgres    false    264    264            [	           2606    59611    project_types_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY project_types
    ADD CONSTRAINT project_types_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.project_types DROP CONSTRAINT project_types_pkey;
       public         postgres    false    264    264            ]	           2606    59615    project_types_type_uq 
   CONSTRAINT     W   ALTER TABLE ONLY project_types
    ADD CONSTRAINT project_types_type_uq UNIQUE (type);
 M   ALTER TABLE ONLY public.project_types DROP CONSTRAINT project_types_type_uq;
       public         postgres    false    264    264            _	           2606    59626    projects_pkey 
   CONSTRAINT     M   ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.projects DROP CONSTRAINT projects_pkey;
       public         postgres    false    266    266            a	           2606    59628    projects_project_code_uq 
   CONSTRAINT     ]   ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_project_code_uq UNIQUE (project_code);
 K   ALTER TABLE ONLY public.projects DROP CONSTRAINT projects_project_code_uq;
       public         postgres    false    266    266            d	           2606    59638    provinces_code_uq 
   CONSTRAINT     O   ALTER TABLE ONLY provinces
    ADD CONSTRAINT provinces_code_uq UNIQUE (code);
 E   ALTER TABLE ONLY public.provinces DROP CONSTRAINT provinces_code_uq;
       public         postgres    false    268    268            f	           2606    59640    provinces_name_uq 
   CONSTRAINT     O   ALTER TABLE ONLY provinces
    ADD CONSTRAINT provinces_name_uq UNIQUE (name);
 E   ALTER TABLE ONLY public.provinces DROP CONSTRAINT provinces_name_uq;
       public         postgres    false    268    268            h	           2606    59636    provinces_pkey 
   CONSTRAINT     O   ALTER TABLE ONLY provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.provinces DROP CONSTRAINT provinces_pkey;
       public         postgres    false    268    268            j	           2606    59651    question_options_pk 
   CONSTRAINT     [   ALTER TABLE ONLY question_options
    ADD CONSTRAINT question_options_pk PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.question_options DROP CONSTRAINT question_options_pk;
       public         postgres    false    270    270            l	           2606    59661    question_types_code_uq 
   CONSTRAINT     Y   ALTER TABLE ONLY question_types
    ADD CONSTRAINT question_types_code_uq UNIQUE (code);
 O   ALTER TABLE ONLY public.question_types DROP CONSTRAINT question_types_code_uq;
       public         postgres    false    272    272            n	           2606    59659    question_types_pk 
   CONSTRAINT     W   ALTER TABLE ONLY question_types
    ADD CONSTRAINT question_types_pk PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.question_types DROP CONSTRAINT question_types_pk;
       public         postgres    false    272    272            p	           2606    59663    question_types_type_uq 
   CONSTRAINT     Y   ALTER TABLE ONLY question_types
    ADD CONSTRAINT question_types_type_uq UNIQUE (type);
 O   ALTER TABLE ONLY public.question_types DROP CONSTRAINT question_types_type_uq;
       public         postgres    false    272    272            r	           2606    59677    questions_pk 
   CONSTRAINT     M   ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_pk PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.questions DROP CONSTRAINT questions_pk;
       public         postgres    false    274    274            t	           2606    59685    suburbs_pkey 
   CONSTRAINT     K   ALTER TABLE ONLY suburbs
    ADD CONSTRAINT suburbs_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.suburbs DROP CONSTRAINT suburbs_pkey;
       public         postgres    false    276    276            +	           1259    59686    organisation_code_ix    INDEX     ^   CREATE INDEX organisation_code_ix ON organisations USING btree (code) WITH (fillfactor='90');
 (   DROP INDEX public.organisation_code_ix;
       public         postgres    false    236            >	           1259    59687    person_id_no_ix    INDEX     T   CREATE INDEX person_id_no_ix ON persons USING btree (id_no) WITH (fillfactor='90');
 #   DROP INDEX public.person_id_no_ix;
       public         postgres    false    246            A	           1259    59688    place_name_ix    INDEX     P   CREATE INDEX place_name_ix ON places USING btree (name) WITH (fillfactor='90');
 !   DROP INDEX public.place_name_ix;
       public         postgres    false    248            b	           1259    59689    province_code_ix    INDEX     V   CREATE INDEX province_code_ix ON provinces USING btree (code) WITH (fillfactor='90');
 $   DROP INDEX public.province_code_ix;
       public         postgres    false    268            �	           2606    59765    application_assessors_fk    FK CONSTRAINT     �   ALTER TABLE ONLY compliance_answers
    ADD CONSTRAINT application_assessors_fk FOREIGN KEY (application_assessor) REFERENCES application_assessors(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 U   ALTER TABLE ONLY public.compliance_answers DROP CONSTRAINT application_assessors_fk;
       public       postgres    false    2274    194    212            ~	           2606    59750    assessment_templates_fk    FK CONSTRAINT     �   ALTER TABLE ONLY calls
    ADD CONSTRAINT assessment_templates_fk FOREIGN KEY (assessment_template) REFERENCES assessment_templates(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 G   ALTER TABLE ONLY public.calls DROP CONSTRAINT assessment_templates_fk;
       public       postgres    false    2278    196    208            �	           2606    59760    assessment_templates_fk    FK CONSTRAINT     �   ALTER TABLE ONLY categories
    ADD CONSTRAINT assessment_templates_fk FOREIGN KEY (template) REFERENCES assessment_templates(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 L   ALTER TABLE ONLY public.categories DROP CONSTRAINT assessment_templates_fk;
       public       postgres    false    210    2278    196            �	           2606    59810 
   auditor_fk    FK CONSTRAINT     �   ALTER TABLE ONLY organisations
    ADD CONSTRAINT auditor_fk FOREIGN KEY (auditor) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 B   ALTER TABLE ONLY public.organisations DROP CONSTRAINT auditor_fk;
       public       postgres    false    236    2351    236            �	           2606    59800    bank_accounts_fk    FK CONSTRAINT     �   ALTER TABLE ONLY organisation_bank_accounts
    ADD CONSTRAINT bank_accounts_fk FOREIGN KEY (bankaccount) REFERENCES bank_accounts(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 U   ALTER TABLE ONLY public.organisation_bank_accounts DROP CONSTRAINT bank_accounts_fk;
       public       postgres    false    230    2280    198            �	           2606    59850    bank_accounts_fk    FK CONSTRAINT     �   ALTER TABLE ONLY person_bank_accounts
    ADD CONSTRAINT bank_accounts_fk FOREIGN KEY (person) REFERENCES bank_accounts(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 O   ALTER TABLE ONLY public.person_bank_accounts DROP CONSTRAINT bank_accounts_fk;
       public       postgres    false    242    198    2280            w	           2606    59715    bank_fk    FK CONSTRAINT     v   ALTER TABLE ONLY bank_accounts
    ADD CONSTRAINT bank_fk FOREIGN KEY (bank) REFERENCES organisations(id) MATCH FULL;
 ?   ALTER TABLE ONLY public.bank_accounts DROP CONSTRAINT bank_fk;
       public       postgres    false    198    236    2351            �	           2606    59880    beneficiaries_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_beneficiaries
    ADD CONSTRAINT beneficiaries_fk FOREIGN KEY (beneficiary) REFERENCES beneficiaries(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 P   ALTER TABLE ONLY public.project_beneficiaries DROP CONSTRAINT beneficiaries_fk;
       public       postgres    false    200    252    2284            �	           2606    59950    call_application_fk    FK CONSTRAINT     �   ALTER TABLE ONLY projects
    ADD CONSTRAINT call_application_fk FOREIGN KEY (call_application) REFERENCES call_applications(id) MATCH FULL;
 F   ALTER TABLE ONLY public.projects DROP CONSTRAINT call_application_fk;
       public       postgres    false    266    204    2292            x	           2606    59720    call_application_statuses_fk    FK CONSTRAINT     �   ALTER TABLE ONLY call_applications
    ADD CONSTRAINT call_application_statuses_fk FOREIGN KEY (application_status) REFERENCES call_application_statuses(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 X   ALTER TABLE ONLY public.call_applications DROP CONSTRAINT call_application_statuses_fk;
       public       postgres    false    2288    204    202            u	           2606    59705    call_applications_fk    FK CONSTRAINT     �   ALTER TABLE ONLY application_assessors
    ADD CONSTRAINT call_applications_fk FOREIGN KEY (application) REFERENCES call_applications(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 T   ALTER TABLE ONLY public.application_assessors DROP CONSTRAINT call_applications_fk;
       public       postgres    false    2292    204    194            |	           2606    59740    call_applications_fk0    FK CONSTRAINT     �   ALTER TABLE ONLY call_evaluations
    ADD CONSTRAINT call_applications_fk0 FOREIGN KEY (call_application) REFERENCES call_applications(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 P   ALTER TABLE ONLY public.call_evaluations DROP CONSTRAINT call_applications_fk0;
       public       postgres    false    2292    206    204            y	           2606    59725    calls_fk    FK CONSTRAINT     �   ALTER TABLE ONLY call_applications
    ADD CONSTRAINT calls_fk FOREIGN KEY (call) REFERENCES calls(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 D   ALTER TABLE ONLY public.call_applications DROP CONSTRAINT calls_fk;
       public       postgres    false    2298    208    204            �	           2606    59990    categories_fk    FK CONSTRAINT     �   ALTER TABLE ONLY questions
    ADD CONSTRAINT categories_fk FOREIGN KEY (catergory) REFERENCES categories(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 A   ALTER TABLE ONLY public.questions DROP CONSTRAINT categories_fk;
       public       postgres    false    2300    210    274            �	           2606    59890    contract_types_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_contracts
    ADD CONSTRAINT contract_types_fk FOREIGN KEY (contract_type) REFERENCES contract_types(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 M   ALTER TABLE ONLY public.project_contracts DROP CONSTRAINT contract_types_fk;
       public       postgres    false    2312    218    254            �	           2606    59860    job_titles_fk    FK CONSTRAINT     �   ALTER TABLE ONLY persons
    ADD CONSTRAINT job_titles_fk FOREIGN KEY (job_title) REFERENCES job_titles(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 ?   ALTER TABLE ONLY public.persons DROP CONSTRAINT job_titles_fk;
       public       postgres    false    220    246    2316            �	           2606    59940    key_performance_indicator_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_outputs
    ADD CONSTRAINT key_performance_indicator_fk FOREIGN KEY (key_performance_indicator) REFERENCES key_performance_indicators(id) MATCH FULL;
 V   ALTER TABLE ONLY public.project_outputs DROP CONSTRAINT key_performance_indicator_fk;
       public       postgres    false    222    2322    260            �	           2606    59955    key_performance_indicator_fk    FK CONSTRAINT     �   ALTER TABLE ONLY projects
    ADD CONSTRAINT key_performance_indicator_fk FOREIGN KEY (key_performance_indicator) REFERENCES key_performance_indicators(id) MATCH FULL;
 O   ALTER TABLE ONLY public.projects DROP CONSTRAINT key_performance_indicator_fk;
       public       postgres    false    222    266    2322            	           2606    59755    key_performance_indicators_fk    FK CONSTRAINT     �   ALTER TABLE ONLY calls
    ADD CONSTRAINT key_performance_indicators_fk FOREIGN KEY (key_performance_indicator) REFERENCES key_performance_indicators(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 M   ALTER TABLE ONLY public.calls DROP CONSTRAINT key_performance_indicators_fk;
       public       postgres    false    2322    208    222            �	           2606    59790    key_performance_indicators_fk    FK CONSTRAINT     �   ALTER TABLE ONLY key_performance_indicators_targets
    ADD CONSTRAINT key_performance_indicators_fk FOREIGN KEY (key_performance_indicator) REFERENCES key_performance_indicators(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 j   ALTER TABLE ONLY public.key_performance_indicators_targets DROP CONSTRAINT key_performance_indicators_fk;
       public       postgres    false    222    224    2322            �	           2606    59785    key_result_areas_fk    FK CONSTRAINT     �   ALTER TABLE ONLY key_performance_indicators
    ADD CONSTRAINT key_result_areas_fk FOREIGN KEY (key_result_area) REFERENCES key_result_areas(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 X   ALTER TABLE ONLY public.key_performance_indicators DROP CONSTRAINT key_result_areas_fk;
       public       postgres    false    2330    226    222            �	           2606    59960    latest_milestone_fk    FK CONSTRAINT     �   ALTER TABLE ONLY projects
    ADD CONSTRAINT latest_milestone_fk FOREIGN KEY (latest_milestone) REFERENCES project_milestones(id) MATCH FULL;
 F   ALTER TABLE ONLY public.projects DROP CONSTRAINT latest_milestone_fk;
       public       postgres    false    2385    258    266            �	           2606    59945    milestone_of    FK CONSTRAINT     p   ALTER TABLE ONLY project_outputs
    ADD CONSTRAINT milestone_of FOREIGN KEY (project) REFERENCES projects(id);
 F   ALTER TABLE ONLY public.project_outputs DROP CONSTRAINT milestone_of;
       public       postgres    false    2399    260    266            �	           2606    59930    milestone_type_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_milestones
    ADD CONSTRAINT milestone_type_fk FOREIGN KEY (milestone_type) REFERENCES milestone_types(id) MATCH FULL;
 N   ALTER TABLE ONLY public.project_milestones DROP CONSTRAINT milestone_type_fk;
       public       postgres    false    228    258    2334            �	           2606    59815    organisation_statuses_fk    FK CONSTRAINT     �   ALTER TABLE ONLY organisations
    ADD CONSTRAINT organisation_statuses_fk FOREIGN KEY (organisation_status) REFERENCES organisation_statuses(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 P   ALTER TABLE ONLY public.organisations DROP CONSTRAINT organisation_statuses_fk;
       public       postgres    false    236    2340    232            �	           2606    59820    organisation_types_fk    FK CONSTRAINT     �   ALTER TABLE ONLY organisations
    ADD CONSTRAINT organisation_types_fk FOREIGN KEY (organisation_type) REFERENCES organisation_types(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 M   ALTER TABLE ONLY public.organisations DROP CONSTRAINT organisation_types_fk;
       public       postgres    false    236    2344    234            �	           2606    59805    organisations_fk    FK CONSTRAINT     �   ALTER TABLE ONLY organisation_bank_accounts
    ADD CONSTRAINT organisations_fk FOREIGN KEY (ogranisation) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 U   ALTER TABLE ONLY public.organisation_bank_accounts DROP CONSTRAINT organisations_fk;
       public       postgres    false    236    230    2351            �	           2606    59905    organisations_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT organisations_fk FOREIGN KEY (organisation) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 K   ALTER TABLE ONLY public.project_expenses DROP CONSTRAINT organisations_fk;
       public       postgres    false    236    2351    256            z	           2606    59730    organisations_fk0    FK CONSTRAINT     �   ALTER TABLE ONLY call_applications
    ADD CONSTRAINT organisations_fk0 FOREIGN KEY (applicant) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 M   ALTER TABLE ONLY public.call_applications DROP CONSTRAINT organisations_fk0;
       public       postgres    false    236    2351    204            �	           2606    59865    organisations_fk1    FK CONSTRAINT     �   ALTER TABLE ONLY persons
    ADD CONSTRAINT organisations_fk1 FOREIGN KEY (employer) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 C   ALTER TABLE ONLY public.persons DROP CONSTRAINT organisations_fk1;
       public       postgres    false    236    2351    246            �	           2606    59965 
   partner_fk    FK CONSTRAINT     w   ALTER TABLE ONLY projects
    ADD CONSTRAINT partner_fk FOREIGN KEY (partner) REFERENCES organisations(id) MATCH FULL;
 =   ALTER TABLE ONLY public.projects DROP CONSTRAINT partner_fk;
       public       postgres    false    236    2351    266            �	           2606    59910    payment_reference_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT payment_reference_fk FOREIGN KEY (project) REFERENCES projects(id) MATCH FULL;
 O   ALTER TABLE ONLY public.project_expenses DROP CONSTRAINT payment_reference_fk;
       public       postgres    false    2399    266    256            �	           2606    59915    payment_schedule_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT payment_schedule_fk FOREIGN KEY (payment_schedule) REFERENCES payment_schedule(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 N   ALTER TABLE ONLY public.project_expenses DROP CONSTRAINT payment_schedule_fk;
       public       postgres    false    2353    238    256            �	           2606    59920    payment_types_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT payment_types_fk FOREIGN KEY (payment_type) REFERENCES payment_types(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 K   ALTER TABLE ONLY public.project_expenses DROP CONSTRAINT payment_types_fk;
       public       postgres    false    256    2357    240            �	           2606    59870    personal_titles_fk    FK CONSTRAINT     �   ALTER TABLE ONLY persons
    ADD CONSTRAINT personal_titles_fk FOREIGN KEY (personal_title) REFERENCES personal_titles(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 D   ALTER TABLE ONLY public.persons DROP CONSTRAINT personal_titles_fk;
       public       postgres    false    246    2363    244            v	           2606    59710 
   persons_fk    FK CONSTRAINT     �   ALTER TABLE ONLY application_assessors
    ADD CONSTRAINT persons_fk FOREIGN KEY (assessor) REFERENCES persons(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 J   ALTER TABLE ONLY public.application_assessors DROP CONSTRAINT persons_fk;
       public       postgres    false    246    194    2368            }	           2606    59745 
   persons_fk    FK CONSTRAINT     �   ALTER TABLE ONLY call_evaluations
    ADD CONSTRAINT persons_fk FOREIGN KEY (evaluator) REFERENCES persons(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 E   ALTER TABLE ONLY public.call_evaluations DROP CONSTRAINT persons_fk;
       public       postgres    false    246    206    2368            �	           2606    59855 
   persons_fk    FK CONSTRAINT     �   ALTER TABLE ONLY person_bank_accounts
    ADD CONSTRAINT persons_fk FOREIGN KEY (bankaccount) REFERENCES persons(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 I   ALTER TABLE ONLY public.person_bank_accounts DROP CONSTRAINT persons_fk;
       public       postgres    false    2368    242    246            �	           2606    59895 
   persons_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_contracts
    ADD CONSTRAINT persons_fk FOREIGN KEY (person) REFERENCES persons(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 F   ALTER TABLE ONLY public.project_contracts DROP CONSTRAINT persons_fk;
       public       postgres    false    246    2368    254            �	           2606    59925 
   persons_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_expenses
    ADD CONSTRAINT persons_fk FOREIGN KEY (person) REFERENCES persons(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 E   ALTER TABLE ONLY public.project_expenses DROP CONSTRAINT persons_fk;
       public       postgres    false    246    256    2368            �	           2606    59970    place_fk    FK CONSTRAINT     l   ALTER TABLE ONLY projects
    ADD CONSTRAINT place_fk FOREIGN KEY (place) REFERENCES places(id) MATCH FULL;
 ;   ALTER TABLE ONLY public.projects DROP CONSTRAINT place_fk;
       public       postgres    false    266    2371    248            �	           2606    60000 
   places_fk0    FK CONSTRAINT     �   ALTER TABLE ONLY suburbs
    ADD CONSTRAINT places_fk0 FOREIGN KEY (place) REFERENCES places(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 <   ALTER TABLE ONLY public.suburbs DROP CONSTRAINT places_fk0;
       public       postgres    false    276    2371    248            �	           2606    59825 
   places_fk1    FK CONSTRAINT     �   ALTER TABLE ONLY organisations
    ADD CONSTRAINT places_fk1 FOREIGN KEY (place) REFERENCES places(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 B   ALTER TABLE ONLY public.organisations DROP CONSTRAINT places_fk1;
       public       postgres    false    236    2371    248            {	           2606    59735 
   places_fk2    FK CONSTRAINT     �   ALTER TABLE ONLY call_applications
    ADD CONSTRAINT places_fk2 FOREIGN KEY (place) REFERENCES places(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 F   ALTER TABLE ONLY public.call_applications DROP CONSTRAINT places_fk2;
       public       postgres    false    2371    248    204            �	           2606    59795    programmes_fk    FK CONSTRAINT     �   ALTER TABLE ONLY key_result_areas
    ADD CONSTRAINT programmes_fk FOREIGN KEY (programme) REFERENCES programmes(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 H   ALTER TABLE ONLY public.key_result_areas DROP CONSTRAINT programmes_fk;
       public       postgres    false    2375    226    250            �	           2606    59775    project_contracts_fk    FK CONSTRAINT     �   ALTER TABLE ONLY contract_budget_items
    ADD CONSTRAINT project_contracts_fk FOREIGN KEY (contract) REFERENCES project_contracts(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 T   ALTER TABLE ONLY public.contract_budget_items DROP CONSTRAINT project_contracts_fk;
       public       postgres    false    2381    254    214            �	           2606    59780    project_contracts_fk    FK CONSTRAINT     �   ALTER TABLE ONLY contract_implementation_plan
    ADD CONSTRAINT project_contracts_fk FOREIGN KEY (contract) REFERENCES project_contracts(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 [   ALTER TABLE ONLY public.contract_implementation_plan DROP CONSTRAINT project_contracts_fk;
       public       postgres    false    216    254    2381            �	           2606    59845    project_contracts_fk    FK CONSTRAINT     �   ALTER TABLE ONLY payment_schedule
    ADD CONSTRAINT project_contracts_fk FOREIGN KEY (contract) REFERENCES project_contracts(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 O   ALTER TABLE ONLY public.payment_schedule DROP CONSTRAINT project_contracts_fk;
       public       postgres    false    238    2381    254            �	           2606    59935 
   project_pk    FK CONSTRAINT     |   ALTER TABLE ONLY project_milestones
    ADD CONSTRAINT project_pk FOREIGN KEY (project) REFERENCES projects(id) MATCH FULL;
 G   ALTER TABLE ONLY public.project_milestones DROP CONSTRAINT project_pk;
       public       postgres    false    258    266    2399            �	           2606    59975    project_status_fk    FK CONSTRAINT     �   ALTER TABLE ONLY projects
    ADD CONSTRAINT project_status_fk FOREIGN KEY (project_status) REFERENCES project_statuses(id) MATCH FULL;
 D   ALTER TABLE ONLY public.projects DROP CONSTRAINT project_status_fk;
       public       postgres    false    262    2389    266            �	           2606    59980    project_type_fk    FK CONSTRAINT     �   ALTER TABLE ONLY projects
    ADD CONSTRAINT project_type_fk FOREIGN KEY (project_type) REFERENCES project_types(id) MATCH FULL;
 B   ALTER TABLE ONLY public.projects DROP CONSTRAINT project_type_fk;
       public       postgres    false    266    264    2395            �	           2606    59885    projects_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_beneficiaries
    ADD CONSTRAINT projects_fk FOREIGN KEY (project) REFERENCES projects(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 K   ALTER TABLE ONLY public.project_beneficiaries DROP CONSTRAINT projects_fk;
       public       postgres    false    266    252    2399            �	           2606    59900    projects_fk    FK CONSTRAINT     �   ALTER TABLE ONLY project_contracts
    ADD CONSTRAINT projects_fk FOREIGN KEY (project) REFERENCES projects(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 G   ALTER TABLE ONLY public.project_contracts DROP CONSTRAINT projects_fk;
       public       postgres    false    2399    266    254            �	           2606    60005    provinces_fk0    FK CONSTRAINT     �   ALTER TABLE ONLY suburbs
    ADD CONSTRAINT provinces_fk0 FOREIGN KEY (province) REFERENCES provinces(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 ?   ALTER TABLE ONLY public.suburbs DROP CONSTRAINT provinces_fk0;
       public       postgres    false    268    276    2408            �	           2606    59830    provinces_fk1    FK CONSTRAINT     �   ALTER TABLE ONLY organisations
    ADD CONSTRAINT provinces_fk1 FOREIGN KEY (province) REFERENCES provinces(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 E   ALTER TABLE ONLY public.organisations DROP CONSTRAINT provinces_fk1;
       public       postgres    false    268    2408    236            �	           2606    59875    provinces_fk2    FK CONSTRAINT     �   ALTER TABLE ONLY places
    ADD CONSTRAINT provinces_fk2 FOREIGN KEY (province) REFERENCES provinces(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 >   ALTER TABLE ONLY public.places DROP CONSTRAINT provinces_fk2;
       public       postgres    false    248    2408    268            �	           2606    59995    question_types_fk    FK CONSTRAINT     �   ALTER TABLE ONLY questions
    ADD CONSTRAINT question_types_fk FOREIGN KEY (type) REFERENCES question_types(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 E   ALTER TABLE ONLY public.questions DROP CONSTRAINT question_types_fk;
       public       postgres    false    2414    272    274            �	           2606    59770    questions_fk    FK CONSTRAINT     �   ALTER TABLE ONLY compliance_answers
    ADD CONSTRAINT questions_fk FOREIGN KEY (question) REFERENCES questions(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 I   ALTER TABLE ONLY public.compliance_answers DROP CONSTRAINT questions_fk;
       public       postgres    false    212    2418    274            �	           2606    59985    questions_fk    FK CONSTRAINT     �   ALTER TABLE ONLY question_options
    ADD CONSTRAINT questions_fk FOREIGN KEY (question) REFERENCES questions(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 G   ALTER TABLE ONLY public.question_options DROP CONSTRAINT questions_fk;
       public       postgres    false    270    2418    274            �	           2606    59835 
   referee_fk    FK CONSTRAINT     �   ALTER TABLE ONLY organisations
    ADD CONSTRAINT referee_fk FOREIGN KEY (referee) REFERENCES organisations(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 B   ALTER TABLE ONLY public.organisations DROP CONSTRAINT referee_fk;
       public       postgres    false    2351    236    236            �	           2606    59840 
   suburbs_fk    FK CONSTRAINT     �   ALTER TABLE ONLY organisations
    ADD CONSTRAINT suburbs_fk FOREIGN KEY (suburb) REFERENCES suburbs(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;
 B   ALTER TABLE ONLY public.organisations DROP CONSTRAINT suburbs_fk;
       public       postgres    false    276    2420    236            $
      x������ � �      &
      x������ � �      (
      x������ � �      *
      x������ � �      ,
      x������ � �      .
      x������ � �      0
      x������ � �      2
   Q   x�3�v�r��r4���4�70�tN��QH�/R�K-WpL)�LNU�OKRŜ1~�F�f�ƺ��p��!�!P�+F��� ��*      4
      x������ � �      6
      x������ � �      8
      x������ � �      :
      x������ � �      <
      x������ � �      >
      x������ � �      @
   3   x�3���4�443Pp��+)JL.Q�/K-R0R�LM,*��CA�\1z\\\ ��      B
      x������ � �      D
   &   x�3��r4�tL)�LNU�OKRŜ1~��\1z\\\ �v      F
      x������ � �      H
      x������ � �      J
   4   x�3��/H����WpI-N.�,(����2�t��OQ.I�K��KG������ +�y      L
   U   x�3�t�H,(I-R�T��+.�,)-I-���WpI-N.�,(����2���/I�A6�tLO�K�D7�tL)�LNU�OKR��1z\\\ ��'�      N
   W   x�3��r7 Cΐ�����ļ��Ē��<C�?�V���Z䐖Q��_��W��� �����2��`��#�m0�:�+F��� �5�      P
      x������ � �      R
      x������ � �      T
      x������ � �      V
      x������ � �      X
      x������ � �      Z
      x�3�(J-�/�L�4����� 1�q      \
   C   x�3�v�r��O��WpM�����LV�*-.�LNUH�/Rp�����4204�50�5�@br��qqq ���      ^
      x������ � �      `
      x������ � �      b
      x������ � �      d
      x������ � �      f
      x������ � �      h
      x������ � �      j
      x������ � �      l
      x������ � �      n
   �   x�M��
�0��~E�@|?֡-�6\���\j�MBL��Eq=30t�<�D�4�-�s�f���v0���1��GS6���nB{���7�_��)+É':����"�8	��Z�!�<��VK��QYT�����"za�19      p
      x������ � �      r
      x������ � �      t
      x������ � �      v
   >   x�3�(��-�/N��C # �e��_�W������Z����ӻ��471E�$���� �C�     