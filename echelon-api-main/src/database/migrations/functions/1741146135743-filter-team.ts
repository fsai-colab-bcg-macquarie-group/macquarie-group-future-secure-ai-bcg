import { MigrationInterface, QueryRunner } from 'typeorm'

export class FilterTeam1741146135743 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.filter_team()
            RETURNS uuid AS $$
            DECLARE
                team_id uuid;
                user_teams uuid[];
            BEGIN
                SELECT (current_setting('request.headers', true)::jsonb->>'team_id')::uuid INTO team_id;
                
                SELECT coalesce(auth_layer.get_user_teams(), ARRAY[]::uuid[]) INTO user_teams;

                IF user_teams IS NULL OR (team_id NOT IN (SELECT unnest(coalesce(user_teams, ARRAY[]::uuid[])))) THEN
                    RETURN NULL;
                END IF;

                RETURN team_id;
            END;
            $$ language plpgsql stable security definer set search_path = '';`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.filter_team();`,
        )
    }
}
