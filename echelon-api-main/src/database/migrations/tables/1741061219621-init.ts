import { MigrationInterface, QueryRunner } from 'typeorm'

export class Init1741061219621 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "auth_layer";')
        await queryRunner.query(
            'ALTER SCHEMA "auth_layer" OWNER TO "postgres";',
        )
        await queryRunner.query(
            'GRANT usage on schema auth_layer to authenticated;',
        )

        await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "ai_flow";')
        await queryRunner.query('ALTER SCHEMA "ai_flow" OWNER TO "postgres";')
        await queryRunner.query(
            'GRANT usage on schema ai_flow to authenticated;',
        )

        await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "audit_log";')
        await queryRunner.query('ALTER SCHEMA "audit_log" OWNER TO "postgres";')
        await queryRunner.query(
            'GRANT usage on schema audit_log to service_role;',
        )

        await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "n8n";')
        await queryRunner.query('ALTER SCHEMA "n8n" OWNER TO "postgres";')
        await queryRunner.query('GRANT usage on schema n8n to authenticated;')

        await queryRunner.query(
            'GRANT usage on schema auth_layer to service_role;',
        )
        await queryRunner.query(
            'GRANT usage,create on schema auth_layer to postgres;',
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SCHEMA IF EXISTS auth_layer CASCADE;`)
    }
}
