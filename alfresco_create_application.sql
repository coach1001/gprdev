DROP FUNCTION alfresco_create_application(TEXT);
CREATE OR REPLACE FUNCTION alfresco_create_application(call_reference_ TEXT)
RETURNS INTEGER AS $$
DECLARE call_id INTEGER;
DECLARE application_id INTEGER;
BEGIN
        SELECT  id INTO call_id
        FROM calls
        WHERE call_reference = call_reference_;
        
        INSERT INTO call_applications (call) VALUES (call_id) 
        RETURNING call_applications.id INTO application_id;
        RETURN application_id;

	EXCEPTION WHEN OTHERS THEN /*Catch all*/
	RETURN 0;
		
END;
$$  LANGUAGE plpgsql