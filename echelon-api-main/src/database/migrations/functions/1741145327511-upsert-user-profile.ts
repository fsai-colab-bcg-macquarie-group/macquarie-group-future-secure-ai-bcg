import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpsertUserProfile1741145327511 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.upsert_user_profile(
                user_id_param uuid,
                first_name text,
                last_name text,
                access_id uuid,
                use_case_team_ids uuid[],
                location_id uuid
            )
            RETURNS TABLE(success boolean, message text) AS $$
            DECLARE
                user_exists boolean;
            BEGIN
                SELECT EXISTS (
                    SELECT 1 FROM auth_layer.user_profile WHERE user_profile.user_id = user_id_param
                ) INTO user_exists;

                IF user_exists THEN
                    UPDATE auth_layer.user_profile
                    SET first_name = upsert_user_profile.first_name,
                        last_name = upsert_user_profile.last_name,
                        access_id = upsert_user_profile.access_id,
                        location_id = upsert_user_profile.location_id
                    WHERE user_profile.user_id = user_id_param;

                    DELETE FROM auth_layer.use_case_team_member
                    WHERE use_case_team_member.user_id = user_id_param;

                    INSERT INTO auth_layer.use_case_team_member (user_id, use_case_team_id)
                    SELECT user_id_param, unnest(upsert_user_profile.use_case_team_ids);

                    RETURN QUERY SELECT true, 'User profile updated successfully.';
                ELSE
                    INSERT INTO auth_layer.user_profile (user_id, first_name, last_name, access_id, location_id)
                    VALUES (user_id_param, upsert_user_profile.first_name, upsert_user_profile.last_name, upsert_user_profile.access_id, upsert_user_profile.location_id);

                    INSERT INTO auth_layer.use_case_team_member (user_id, use_case_team_id)
                    SELECT user_id_param, unnest(upsert_user_profile.use_case_team_ids);

                    RETURN QUERY SELECT true, 'User profile created successfully.';
                END IF;
            EXCEPTION
                WHEN unique_violation THEN
                    RETURN QUERY SELECT false, 'Error: A user with this ID already exists.';
                WHEN foreign_key_violation THEN
                    RETURN QUERY SELECT false, 'Error: The user ID, access ID or location ID does not exist.';

            END;
            $$ LANGUAGE plpgsql SECURITY INVOKER;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.upsert_user_profile(uuid, text, text, uuid, uuid[], uuid);`,
        )
    }
}
