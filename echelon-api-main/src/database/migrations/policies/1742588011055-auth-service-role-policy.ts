import { Migration, QueryRunner } from 'typeorm'

export class AuthServiceRolePolicy1742588011055 extends Migration {
    async up(queryRunner: QueryRunner) {
        await queryRunner.query(`
       DROP POLICY IF EXISTS "service_role can SELECT records" ON "auth"."users";
    `)

        await queryRunner.query(`
        CREATE POLICY "service_role can SELECT records" 
        ON "auth"."users" 
        FOR select TO "service_role"
        USING(TRUE)
        `)

        await queryRunner.query(`
        DROP POLICY IF EXISTS "service_role can update records" ON "auth"."users";
     `)

        await queryRunner.query(`
         CREATE POLICY "service_role can update records" 
        ON "auth"."users" 
        FOR UPDATE TO "service_role"
        USING(TRUE)
        WITH CHECK(TRUE) 
        `)
    }

    async down(queryRunner: QueryRunner) {
        await queryRunner.query(`
            DROP POLICY IF EXISTS "service_role can SELECT records" ON "auth"."users";
         `)

        await queryRunner.query(`
            DROP POLICY IF EXISTS "service_role can update records" ON "auth"."users";
         `)
    }
}
