import { MigrationInterface, QueryRunner } from 'typeorm'

export class GetUseCaseTeamsMemberCount1741620318692
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE OR REPLACE FUNCTION auth_layer.get_use_case_teams_member_count()
RETURNS TABLE(id uuid, name text, member_count bigint ) AS $$
BEGIN
    RETURN QUERY
    SELECT uct.id, uct.name::text,  -- Cast to text
           (SELECT COUNT(*)
            FROM auth_layer.use_case_team_member uctm
            WHERE uctm.use_case_team_id = uct.id) AS member_count
    FROM auth_layer.use_case_team uct
    ORDER BY uct.name;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_use_case_teams_member_count();`,
        )
    }
}
