import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixAuthorizeFunction1741286993787 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`create or replace function auth_layer.authorize(
                requested_permission auth_layer.permission
            )
            returns boolean as $$

            declare
                user_access_id uuid;
                user_permissions auth_layer.permission[];
                token_user_id uuid;
            begin
                SELECT 
                    ((auth.jwt() ->> 'profile')::jsonb ->> 'access_id')::uuid,
                    ARRAY(SELECT jsonb_array_elements_text(auth.jwt() -> 'user_permissions')::auth_layer.permission)
                INTO user_access_id, user_permissions;

                SELECT auth.uid() INTO token_user_id;

                IF token_user_id IS NULL THEN
                    return false;
                END IF;

                IF requested_permission = ANY(user_permissions) THEN
                    return true;
                END IF;

                SELECT up.access_id 
                INTO user_access_id 
                FROM auth_layer.user_profile up
                WHERE up.user_id = token_user_id;

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
            `drop function auth_layer.authorize(auth_layer.permission)`,
        )
    }
}
