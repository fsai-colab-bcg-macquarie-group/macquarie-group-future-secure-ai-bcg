import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserNoSso1741143520205 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE OR REPLACE FUNCTION auth_layer.create_user_no_sso(
            first_name text, 
            last_name text, 
            user_email text, 
            access_id uuid,
            password text
        ) RETURNS text AS $$
        declare
            user_id uuid;
            email_exists boolean;
            encrypted_pw text;
        BEGIN
            user_id := gen_random_uuid();
            encrypted_pw := crypt(password, gen_salt('bf'));

            SELECT EXISTS (
                SELECT 1
                FROM auth.users
                WHERE email = user_email
            ) INTO email_exists;

            IF email_exists THEN
                RAISE EXCEPTION 'User already exists';
            END IF;
            
            INSERT INTO auth.users
                (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at) 
            VALUES
                ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', user_email, encrypted_pw, '2024-11-21 23:40:22.67745+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-11-21 23:40:22.599728+00', '2024-11-21 23:40:22.677616+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);

            INSERT INTO auth_layer.user_profile (user_id, first_name, last_name, access_id)
            VALUES
                (user_id, first_name, last_name,  access_id);

            INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
            VALUES
                (user_id, user_id, format('{"sub":"%s","email":"%s", "email_verified": false, "phone_verified": false}', user_id::text, user_email)::jsonb, 'email', '2024-11-21 23:40:22.608233+00', '2024-11-21 23:40:22.608271+00', '2024-11-21 23:40:22.608271+00', gen_random_uuid());

            RETURN user_email;
        END;
        $$ LANGUAGE plpgsql;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.create_user_no_sso(VARCHAR, VARCHAR);`,
        )
    }
}
