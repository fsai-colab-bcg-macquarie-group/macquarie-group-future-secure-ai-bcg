import { MigrationInterface, QueryRunner } from 'typeorm'

export class GetUserDetailByIdUpdtTwo1742930283285
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_user_detail_by_id(uuid);`,
        )

        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_all_access();`,
        )
        await queryRunner.query(
            `
            CREATE OR REPLACE FUNCTION auth_layer.get_all_access()
            RETURNS TABLE(
                id uuid,
                name character varying,
                description character varying,
                created_at timestamp,
                update_at timestamp
            ) AS $$
            BEGIN
            RETURN QUERY
                SELECT * from auth_layer.access;
                   
            END;
            $$ LANGUAGE plpgsql SECURITY definer;`,
        )
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.get_user_detail_by_id(userId uuid)
            RETURNS TABLE(
                id uuid,
                first_name character varying,
                last_name character varying,
                access jsonb,
                location jsonb,
                use_case_teams jsonb,
                email character varying,
                is_sso_user boolean,
                deleted_at timestamp with time zone,
                banned_until timestamp with time zone,
                email_confirmed_at timestamp with time zone
            ) AS $$
            BEGIN
            RETURN QUERY
                SELECT 
                    up.user_id,
                    up.first_name,
                    up.last_name,
                    jsonb_build_object(
                        'id', a.id,
                        'name', a.name,
                        'description', a.description,
                        'created_at', a.created_at
                    ) AS access,
                   jsonb_build_object(
                     'id', wsc.id,
                    'city', wsc.city,
                    'state', wsc.state,
                    'country', wsc.country
                   ) as location,
                    COALESCE(jsonb_agg(jsonb_build_object(
                        'id', uctm.use_case_team_id,
                        'name', uct.name
                    )) FILTER (WHERE uctm.use_case_team_id IS NOT NULL), '[]'::jsonb) AS use_case_teams,
                    u.email,
                    u.is_sso_user,
                    u.deleted_at,
                    u.banned_until,
                    u.email_confirmed_at
                FROM auth_layer.user_profile up
                LEFT JOIN (SELECT * from auth_layer.get_all_access()) a ON up.access_id = a.id
                LEFT JOIN auth_layer.use_case_team_member uctm ON up.user_id = uctm.user_id
                LEFT JOIN auth_layer.use_case_team uct ON uctm.use_case_team_id = uct.id
                LEFT JOIN auth.users u ON up.user_id = u.id
                LEFT JOIN auth_layer.world_states_cities wsc ON up.location_id = wsc.id
                WHERE up.user_id = userId
                GROUP BY up.user_id, up.first_name, up.last_name, a.id, a.name, a.description,  a.created_at, wsc.id, wsc.city, wsc.state, wsc.country, u.email, u.is_sso_user, u.deleted_at, u.banned_until, u.email_confirmed_at;
            END;
            $$ LANGUAGE plpgsql SECURITY INVOKER;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_user_detail_by_id(uuid);`,
        )
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.get_all_access();`,
        )
    }
}
