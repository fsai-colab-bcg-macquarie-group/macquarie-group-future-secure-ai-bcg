import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserSso1741145126257 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.create_user_sso(
                user_first_name text, 
                user_last_name text, 
                user_email text, 
                use_case_team_ids uuid[], 
                access_id uuid, 
                sso_domain text,
                location_id uuid
                ) RETURNS TABLE(user_sso_email text, user_id uuid) AS $$
            DECLARE
                user_id uuid;
                providers_count int;
                provider_id uuid;
                provider_domain text;
                provider_entity_id text;
                email_exists boolean;
                use_case_team_id uuid;
            BEGIN
                SELECT EXISTS (
                    SELECT 1
                    FROM auth.users
                    WHERE email = user_email
                ) INTO email_exists;

                IF email_exists THEN
                    RAISE EXCEPTION 'User already exists';
                END IF;

                SELECT COUNT(1) INTO providers_count FROM auth.sso_providers;
                
                IF providers_count = 0 THEN
                    RAISE EXCEPTION 'No SSO Provider Found';
                END IF;

                IF sso_domain IS NULL THEN
                    SELECT 
                    p.id,
                    d.domain,
                    samlp.entity_id
                    INTO provider_id, provider_domain, provider_entity_id
                    FROM auth.sso_providers p
                    INNER JOIN auth.sso_domains d ON d.sso_provider_id = p.id
                    INNER JOIN auth.saml_providers samlp ON samlp.sso_provider_id = p.id
                    LIMIT 1;
                ELSE
                    SELECT 
                    p.id,
                    d.domain,
                    samlp.entity_id
                    INTO provider_id, provider_domain, provider_entity_id
                    FROM auth.sso_providers p
                    INNER JOIN auth.sso_domains d ON d.sso_provider_id = p.id
                    INNER JOIN auth.saml_providers samlp ON samlp.sso_provider_id = p.id
                    WHERE d.domain = sso_domain;
                END IF;

                IF provider_id IS NULL OR provider_domain IS NULL OR provider_entity_id IS NULL THEN
                    RAISE EXCEPTION 'SSO Provider Not Found';
                END IF;

                user_id := gen_random_uuid();
                
                INSERT INTO auth.users
                    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at) 
                VALUES
                    ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', user_email, NULL, NULL, NULL, '', NULL, '', NULL, '', '', NULL, NULL, format('{"provider": "sso:%s", "providers": ["sso:%s"]}', provider_id, provider_id)::jsonb, format('{ "iss": "%s", "sub": "%s", "email": "%s", "custom_claims": {}, "email_verified": true, "phone_verified": false }', provider_entity_id, user_email, user_email)::jsonb, NULL, NOW(), NOW(), NULL, NULL,'','',null,'',0,NOW() + INTERVAL '100 years','',null,TRUE,null);

                INSERT INTO auth_layer.user_profile (user_id, first_name, last_name, access_id, location_id)
                VALUES (user_id, user_first_name, user_last_name, access_id, location_id);

                FOREACH use_case_team_id IN ARRAY use_case_team_ids LOOP
                    INSERT INTO auth_layer.use_case_team_member (user_id, use_case_team_id)
                    VALUES (user_id, use_case_team_id);
                END LOOP;

                INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
                VALUES
                    (user_id, user_id, format('{ "iss": "%s", "sub": "%s", "email": "%s", "custom_claims": {}, "email_verified": true, "phone_verified": false}', provider_entity_id, user_email, user_email)::jsonb, format('sso:%s', provider_id), NOW(), NOW(), NOW(), gen_random_uuid());
                    
                RETURN QUERY SELECT user_email, user_id;
            END;
            $$ LANGUAGE plpgsql SECURITY INVOKER;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.create_user_sso(text, text, text, uuid[], uuid, text, uuid);`,
        )
    }
}
