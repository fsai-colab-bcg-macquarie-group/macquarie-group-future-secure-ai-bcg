import { Migration, QueryRunner } from 'typeorm'

export class AuthSsoPolicy1742241501029 extends Migration {
    async up(queryRunner: QueryRunner) {
        // sso_domains
        await queryRunner.query(`
       DROP POLICY IF EXISTS "Allow authenticated users and service role to select from sso_domains" ON "auth"."sso_domains";
    `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users and service role to select from sso_domains"
        ON auth.sso_domains
        FOR SELECT
        TO authenticated, service_role
        USING (true);
    `)

        await queryRunner.query(`
        DROP POLICY IF EXISTS "Allow authenticated users and service role to insert into sso_domains" ON "auth"."sso_domains";
     `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users and service role to insert into sso_domains"
        ON auth.sso_domains
        FOR INSERT
        TO authenticated, service_role
        WITH CHECK (true);
    `)

        await queryRunner.query(`
        DROP POLICY IF EXISTS "Allow authenticated users and service role to update sso_domains" ON "auth"."sso_domains";
     `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users and service role to update sso_domains"
        ON auth.sso_domains
        FOR UPDATE
        TO authenticated, service_role
        USING (true)
        WITH CHECK (true);
    `)

        await queryRunner.query(`
        DROP POLICY IF EXISTS "Allow authenticated users and service role to delete from sso_domains" ON "auth"."sso_domains";
     `)

        await queryRunner.query(`
        CREATE POLICY "Allow authenticated users and service role to delete from sso_domains"
        ON auth.sso_domains
        FOR DELETE
        TO authenticated, service_role
        USING (true);
    `)
        // saml_providers
        await queryRunner.query(`
        DROP POLICY IF EXISTS "Allow authenticated users and service role to select from saml_providers" ON "auth"."saml_providers";
     `)

        await queryRunner.query(`
         CREATE POLICY "Allow authenticated users and service role to select from saml_providers"
         ON auth.saml_providers
         FOR SELECT
         TO authenticated, service_role
         USING (true);
     `)

        await queryRunner.query(`
         DROP POLICY IF EXISTS "Allow authenticated users and service role to insert into saml_providers" ON "auth"."saml_providers";
      `)

        await queryRunner.query(`
         CREATE POLICY "Allow authenticated users and service role to insert into saml_providers"
         ON auth.saml_providers
         FOR INSERT
         TO authenticated, service_role
         WITH CHECK (true);
     `)

        await queryRunner.query(`
         DROP POLICY IF EXISTS "Allow authenticated users and service role to update saml_providers" ON "auth"."saml_providers";
      `)

        await queryRunner.query(`
         CREATE POLICY "Allow authenticated users and service role to update saml_providers"
         ON auth.saml_providers
         FOR UPDATE
         TO authenticated, service_role
         USING (true)
         WITH CHECK (true);
     `)

        await queryRunner.query(`
         DROP POLICY IF EXISTS "Allow authenticated users and service role to delete from saml_providers" ON "auth"."saml_providers";
      `)

        await queryRunner.query(`
         CREATE POLICY "Allow authenticated users and service role to delete from saml_providers"
         ON auth.saml_providers
         FOR DELETE
         TO authenticated, service_role
         USING (true);
     `)

        // sso_providers

        await queryRunner.query(`
        DROP POLICY IF EXISTS "Allow authenticated users and service role to select from sso_providers" ON "auth"."sso_providers";
     `)

        await queryRunner.query(`
         CREATE POLICY "Allow authenticated users and service role to select from sso_providers"
         ON auth.sso_providers
         FOR SELECT
         TO authenticated, service_role
         USING (true);
     `)

        await queryRunner.query(`
         DROP POLICY IF EXISTS "Allow authenticated users and service role to insert into sso_providers" ON "auth"."sso_providers";
      `)

        await queryRunner.query(`
         CREATE POLICY "Allow authenticated users and service role to insert into sso_providers"
         ON auth.sso_providers
         FOR INSERT
         TO authenticated, service_role
         WITH CHECK (true);
     `)

        await queryRunner.query(`
         DROP POLICY IF EXISTS "Allow authenticated users and service role to update sso_providers" ON "auth"."sso_providers";
      `)

        await queryRunner.query(`
         CREATE POLICY "Allow authenticated users and service role to update sso_providers"
         ON auth.sso_providers
         FOR UPDATE
         TO authenticated, service_role
         USING (true)
         WITH CHECK (true);
     `)

        await queryRunner.query(`
         DROP POLICY IF EXISTS "Allow authenticated users and service role to delete from sso_providers" ON "auth"."sso_providers";
      `)

        await queryRunner.query(`
         CREATE POLICY "Allow authenticated users and service role to delete from sso_providers"
         ON auth.sso_providers
         FOR DELETE
         TO authenticated, service_role
         USING (true);
     `)

        // Enable Row Level Security
        await queryRunner.query(`
        ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;
    `)

        await queryRunner.query(`
        ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;
    `)

        await queryRunner.query(`
        ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;
    `)
    }

    async down(queryRunner: QueryRunner) {
        // sso_providers
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to delete from sso_domains" ON "auth"."sso_domains";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to update sso_domains" ON "auth"."sso_domains";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to insert into sso_domains" ON "auth"."sso_domains";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to select from sso_domains" ON "auth"."sso_domains";
         `)

        // saml_providers
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to delete from saml_providers" ON "auth"."saml_providers";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to update saml_providers" ON "auth"."saml_providers";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to insert into saml_providers" ON "auth"."saml_providers";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to select from saml_providers" ON "auth"."saml_providers";
         `)

        // sso_providers
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to delete from sso_providers" ON "auth"."sso_providers";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to update sso_providers" ON "auth"."sso_providers";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to insert into sso_providers" ON "auth"."sso_providers";
         `)
        await queryRunner.query(`
            DROP POLICY IF EXISTS "Allow authenticated users and service role to select from sso_providers" ON "auth"."sso_providers";
         `)
    }
}
