import { MigrationInterface, QueryRunner } from 'typeorm'

export class Authorize1741145922580 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            create or replace function auth_layer.authorize(
                requested_permission auth_layer.permission
            )
            returns boolean as $$

            declare
                user_access_id uuid;
                user_permissions auth_layer.permission[];
            begin
                SELECT 
                    ((auth.jwt() ->> 'profile')::jsonb ->> 'access_id')::uuid,
                    ARRAY(SELECT jsonb_array_elements_text(auth.jwt() -> 'user_permissions')::auth_layer.permission)
                INTO user_access_id, user_permissions;

                IF user_access_id IS NULL THEN
                    return false;
                END IF;

                IF requested_permission = ANY(user_permissions) THEN
                    return true;
                END IF;

                return EXISTS (
                    select 1
                    from auth_layer.access_permissions rp
                    where rp.permission = requested_permission
                    and rp.access_id = user_access_id
                );
            end;
            $$ language plpgsql stable security definer set search_path = '';`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.authorize(auth_layer.permission);`,
        )
    }
}
