import { MigrationInterface, QueryRunner } from 'typeorm'

export class GrantExposeSchemas1741885536467 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`
                ALTER ROLE authenticator SET pgrst.db_schemas = 'public, storage, graphql_public, audit_log, auth, auth_layer';
                NOTIFY pgrst;`)
        } catch (error) {
            console.error('[GrantExposeSchemas1741885536467]: ', error)
        }
    }

    public async down(): Promise<void> {}
}
