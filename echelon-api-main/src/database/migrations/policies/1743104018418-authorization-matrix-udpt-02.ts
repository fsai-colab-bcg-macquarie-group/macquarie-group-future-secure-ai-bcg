import { MigrationInterface, QueryRunner } from 'typeorm'

export class AuthorizationMatrixUpdtTwo1743104018418
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can update records based on access" ON "auth_layer"."user_profile";
        `)
        await queryRunner.query(`
            CREATE POLICY "Users can update records based on access" 
            ON "auth_layer"."user_profile" 
            FOR UPDATE TO "authenticated" 
            USING (
                auth_layer.authorize('user.update')
            )
            WITH CHECK (
                auth_layer.authorize('user.update')
            );
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can update records based on access" ON "auth_layer"."user_profile";
        `)
    }
}
