import { MigrationInterface, QueryRunner } from 'typeorm'

export class GetUseCaseTeamDetailsUpdtoOne1742932280823
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_use_case_team_details(uuid);`,
        )

        await queryRunner.query(`CREATE OR REPLACE FUNCTION auth_layer.get_use_case_team_details(param_use_case_team_id uuid)
RETURNS TABLE(id uuid, name varchar, owner_id uuid, owner_first_name varchar , owner_last_name varchar, members jsonb) AS $$
BEGIN
    RETURN QUERY
    SELECT uct.id AS id, 
       uct.name AS name, 
       uct.owner_id AS owner_id,
       up.first_name AS owner_first_name,
       up.last_name AS owner_last_name,
       COALESCE(jsonb_agg(jsonb_build_object(
                      'user_id', upm.user_id,
                      'first_name', upm.first_name, 
                      'last_name', upm.last_name,
                      'email', au.email,
                      'access_name', a.name
                  )) FILTER (WHERE upm.user_id IS NOT NULL), '[]'::jsonb) AS members
    FROM auth_layer.use_case_team uct
    LEFT JOIN auth_layer.user_profile up ON up.user_id = uct.owner_id
    LEFT JOIN auth_layer.use_case_team_member uctm ON uctm.use_case_team_id = uct.id
    LEFT JOIN auth_layer.user_profile upm ON upm.user_id = uctm.user_id
    LEFT JOIN auth.users au ON au.id = upm.user_id
    LEFT JOIN (SELECT * from auth_layer.get_all_access()) a ON a.id = upm.access_id
    WHERE uct.id = param_use_case_team_id
    GROUP BY uct.id, 
         uct.name, 
         uct.owner_id,
         up.first_name,
         up.last_name;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_use_case_team_details(uuid);`,
        )
    }
}
