import { MigrationInterface, QueryRunner } from 'typeorm'

export class SelectUserDetail1743432436913 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON auth_layer.user_profile;
        `)
        await queryRunner.query(`
            CREATE policy "Users can select records based on access" 
            ON auth_layer.user_profile
            FOR select TO "authenticated" 
            USING ( auth_layer.authorize('user.get') or 
            (select auth.uid()) = user_id );
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON auth.users;
        `)

        await queryRunner.query(`
            CREATE policy "Users can select records based on access" 
            ON auth.users
            FOR SELECT TO "authenticated" 
            USING ( auth_layer.authorize('user.get') or 
            (select auth.uid()) = id );
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON auth_layer.user_profile;
        `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "Users can select records based on access" ON auth.users;
        `)
    }
}
