import { MigrationInterface, QueryRunner } from 'typeorm'

export class JwtCustomPayload1741143362547 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.jwt_custom_payload(event jsonb) 
                RETURNS jsonb
                LANGUAGE plpgsql STABLE
                AS $$
                DECLARE
                    claims jsonb;
                    user_access_id uuid;
                    user_permissions jsonb;
                    first_name varchar;
                    last_name varchar;
                    access_name varchar;
                    profile jsonb;
                    team_ids jsonb;
                BEGIN
                    SELECT p.access_id, p.first_name, p.last_name, a.name
                    INTO user_access_id, first_name, last_name, access_name
                    FROM auth_layer.user_profile p
                    INNER JOIN auth_layer.access a ON p.access_id = a.id
                    WHERE p.user_id = (event->>'user_id')::uuid;

                    claims := event->'claims';
                    profile := '{}'::jsonb;

                    IF first_name IS NOT NULL AND last_name IS NOT NULL THEN
                        profile := jsonb_set(profile, '{first_name}', to_jsonb(first_name));
                        profile := jsonb_set(profile, '{last_name}', to_jsonb(last_name));
                    END IF;

                    IF user_access_id IS NOT NULL THEN
                        profile := jsonb_set(profile, '{access_id}', to_jsonb(user_access_id));
                        profile := jsonb_set(profile, '{access_name}', to_jsonb(access_name));
                    END IF;

                    claims := jsonb_set(claims, '{profile}', profile);

                    SELECT COALESCE(jsonb_agg(jsonb_build_object(
                        'use_case_team_id', ut.id,
                        'name', ut.name
                    )), '[]'::jsonb)
                    INTO team_ids
                    FROM auth_layer.use_case_team_member utm
                    INNER JOIN auth_layer.use_case_team ut ON ut.id = utm.use_case_team_id 
                    WHERE utm.user_id = (event->>'user_id')::uuid;

                    claims := jsonb_set(claims, '{use_case_teams}', team_ids);

                    SELECT COALESCE(jsonb_agg(to_jsonb(rp.permission)), '[]'::jsonb)
                    INTO user_permissions
                    FROM auth_layer.access_permissions rp
                    WHERE rp.access_id = user_access_id;

                    claims := jsonb_set(claims, '{user_permissions}', user_permissions);

                    claims := jsonb_set(claims, '{user_id}', to_jsonb(event->>'user_id'));

                    event := jsonb_set(event, '{claims}', claims);

                    RETURN event;
                END;
                $$;`)

        await queryRunner.query(
            `grant execute on function auth_layer.jwt_custom_payload to supabase_auth_admin;`,
        )
        await queryRunner.query(
            `grant usage on schema auth_layer to supabase_auth_admin;`,
        )

        await queryRunner.query(
            `GRANT SELECT, INSERT, UPDATE ON auth_layer.access_permissions TO supabase_auth_admin;`,
        )
        await queryRunner.query(
            `GRANT SELECT, INSERT, UPDATE ON auth_layer.access TO supabase_auth_admin;`,
        )
        await queryRunner.query(
            `GRANT SELECT, INSERT, UPDATE ON auth_layer.user_profile TO supabase_auth_admin;`,
        )
        await queryRunner.query(
            `GRANT SELECT, INSERT, UPDATE ON auth_layer.use_case_team_member TO supabase_auth_admin;`,
        )
        await queryRunner.query(
            `GRANT SELECT, INSERT, UPDATE ON auth_layer.use_case_team TO supabase_auth_admin;`,
        )
        await queryRunner.query(
            `GRANT SELECT, INSERT, UPDATE ON auth.users TO supabase_auth_admin;`,
        )
        await queryRunner.query(
            `GRANT SELECT, INSERT, UPDATE ON auth.users TO service_role;`,
        )

        await queryRunner.query(`
            CREATE POLICY "Enable select for supabase_auth_admin users only" 
                ON auth_layer.access_permissions 
                FOR SELECT 
                TO supabase_auth_admin 
                USING (true);`)

        await queryRunner.query(`
            CREATE POLICY "Enable select for supabase_auth_admin users only" 
                ON auth_layer.access 
                FOR SELECT 
                TO supabase_auth_admin 
                USING (true);`)

        await queryRunner.query(`
            CREATE POLICY "Enable select for supabase_auth_admin users only" 
                ON auth_layer.user_profile 
                FOR SELECT 
                TO supabase_auth_admin 
                USING (true);`)

        await queryRunner.query(`
            CREATE POLICY "Enable select for supabase_auth_admin users only" 
                ON auth_layer.use_case_team_member 
                FOR SELECT 
                TO supabase_auth_admin 
                USING (true);`)

        await queryRunner.query(`
            CREATE POLICY "Enable select for supabase_auth_admin users only" 
                ON auth_layer.use_case_team 
                FOR SELECT 
                TO supabase_auth_admin 
                USING (true);`)

        await queryRunner.query(`
            CREATE POLICY "Enable select for supabase_auth_admin users only" 
                ON auth.users 
                FOR SELECT 
                TO supabase_auth_admin 
                USING (true);`)

        await queryRunner.query(
            `revoke execute on function auth_layer.jwt_custom_payload from authenticated, anon, public;`,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.jwt_custom_payload(uuid);`,
        )
    }
}
