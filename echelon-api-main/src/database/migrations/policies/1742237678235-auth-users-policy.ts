import { Migration, QueryRunner } from 'typeorm'

export class AuthUsersPolicy1742237678235 extends Migration {
    async up(queryRunner: QueryRunner) {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON "auth"."users";
        `)

        await queryRunner.query(`
         CREATE policy "Users can select records based on access" 
            ON auth.users
            FOR SELECT TO "authenticated" 
            USING (
            auth_layer.authorize('user.get')
            );
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can update records based on access" ON "auth"."users";
        `)

        await queryRunner.query(`
            CREATE POLICY "Users can update records based on access" 
            ON "auth"."users" 
            FOR UPDATE TO "authenticated" 
            USING (
                auth_layer.authorize('user.create') or auth_layer.authorize('user.update')
            )
            WITH CHECK (
                auth_layer.authorize('user.create') or auth_layer.authorize('user.update')
            );
           `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can insert records based on access" ON "auth"."users";
        `)

        await queryRunner.query(`
            CREATE POLICY "Users can insert records based on access" 
            ON "auth"."users"  
            FOR INSERT TO "authenticated" 
            WITH CHECK (
                auth_layer.authorize('user.create') or auth_layer.authorize('user.update')
            );
        `)
    }

    async down(queryRunner: QueryRunner) {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON "auth"."users";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can update records based on access" ON "auth"."users";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can insert records based on access" ON "auth"."users";
         `)
    }
}
