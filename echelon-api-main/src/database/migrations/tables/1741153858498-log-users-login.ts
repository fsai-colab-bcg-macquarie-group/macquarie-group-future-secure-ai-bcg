import { MigrationInterface, QueryRunner } from 'typeorm'

export class LogUsersLogin1741153858498 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const countLoginStatusTypeExists = await queryRunner.query(`
            SELECT count(*)
            FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE n.nspname = 'audit_log'
            AND t.typname = 'login_status';
            `)

        if (parseInt(countLoginStatusTypeExists[0].count) === 0) {
            await queryRunner.query(`
                CREATE TYPE audit_log.login_status AS ENUM ('success', 'failure');
            `)
        }

        await queryRunner.query(`        
            create table if not exists audit_log.log_users_login (
                id          uuid primary key DEFAULT gen_random_uuid(),
                user_id     VARCHAR(100) NULL,
                username    VARCHAR(200) NULL,
                email       VARCHAR(300) NULL,
                device      VARCHAR(200) NULL,
                browser     VARCHAR(200) NULL,
                ip          VARCHAR(200) NULL,
                failure_reason VARCHAR(200) NULL,
                status      audit_log.login_status NULL,
                created_at  TIMESTAMP DEFAULT NOW()
            );`)

        await queryRunner.query(`
            GRANT SELECT,INSERT,DELETE,UPDATE ON audit_log.log_users_login TO service_role;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TYPE IF EXISTS audit_log.login_status;`)
        await queryRunner.query(
            `DROP TABLE IF EXISTS audit_log.log_users_login;`,
        )
    }
}
