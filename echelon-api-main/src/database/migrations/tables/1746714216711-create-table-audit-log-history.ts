import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTableAuditLogHistory1746714216711
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`        
            create table if not exists audit_log.history (
                id          uuid primary key DEFAULT gen_random_uuid(),
                user_id     VARCHAR(100) NULL,
                profile     VARCHAR(100) NULL,
                description   VARCHAR(200) NULL,
                action        VARCHAR(100) NULL,
                email      VARCHAR(200) NULL,
                success     BOOLEAN NULL,
                metadata    JSONB NULL,
                created_at  TIMESTAMP DEFAULT NOW()
            );`)

        await queryRunner.query(`
            GRANT SELECT,INSERT,DELETE,UPDATE ON audit_log.history TO service_role;
        `)
        await queryRunner.query(`
            GRANT SELECT,INSERT,DELETE,UPDATE ON audit_log.history TO authenticated;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS audit_log.history;`)
    }
}
