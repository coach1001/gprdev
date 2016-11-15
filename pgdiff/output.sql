-- schemaType: FUNCTION
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
-- schemaType: ROLE
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
-- schemaType: SEQUENCE
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
-- schemaType: TABLE
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
-- schemaType: COLUMN
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
-- schemaType: VIEW
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
DROP VIEW lookup_banks_min;
CREATE VIEW lookup_banks_min AS  SELECT organisations.id,
    organisations.name,
    organisations.vat_no
   FROM ((organisations
     JOIN organisation_has_types ON ((organisation_has_types.organisation = organisations.id)))
     JOIN organisation_types ON ((organisation_has_types.type = organisation_types.id)))
  WHERE (organisation_types.type = 'Bank'::text); 

-- schemaType: OWNER
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
-- schemaType: INDEX
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
-- schemaType: FOREIGN_KEY
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
-- schemaType: GRANT_RELATIONSHIP
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
-- schemaType: GRANT_ATTRIBUTE
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
-- schemaType: TRIGGER
-- db1: {gpr-dev01 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- db2: {gpr-prod 10.0.0.111 5432 postgres Justice##@!1996 sslmode=disable}
-- Run the following SQL against db2:
