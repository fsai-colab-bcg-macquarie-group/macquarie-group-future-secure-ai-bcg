import { MigrationInterface, QueryRunner } from 'typeorm'

export class ResetFailedAttemptsIfExists1741144665899
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.reset_failed_attempts_if_exists(userId UUID)
            RETURNS VOID AS $$
            BEGIN
                IF EXISTS (SELECT 1 FROM auth_layer.failed_verification_attempts WHERE user_id = userId AND failed_attempts > 0) THEN
                    UPDATE auth_layer.failed_verification_attempts
                    SET 
                        failed_attempts = 0
                    WHERE user_id = userId;
                END IF;
            END;
            $$ LANGUAGE plpgsql;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.reset_failed_attempts_if_exists(uuid);`,
        )
    }
}
