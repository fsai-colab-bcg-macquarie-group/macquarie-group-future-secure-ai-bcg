import { MigrationInterface } from 'typeorm'

import { QueryRunner } from 'typeorm'

export class GetUserTeams1741146015313 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.get_user_teams()
            RETURNS uuid[] AS $$
            DECLARE
                teams_id uuid[];
            BEGIN

                SELECT array_agg(use_case_team_id) INTO teams_id 
                FROM auth_layer.use_case_team_member 
                WHERE user_id = auth.uid();

                RETURN teams_id;
            END;
            $$ language plpgsql stable security definer set search_path = '';
`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_user_teams();`,
        )
    }
}
