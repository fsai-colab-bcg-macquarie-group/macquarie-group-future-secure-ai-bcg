import { MigrationInterface, QueryRunner } from 'typeorm'

export class HandleAttemptsLockout1741144329501 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION auth_layer.handle_attempts_lockout()
            RETURNS TRIGGER security definer AS $$
            BEGIN
                IF NEW.lock_until > NOW() AND OLD.lock_until IS DISTINCT FROM NEW.lock_until THEN
                    UPDATE auth_layer.failed_verification_attempts
                    SET failed_attempts = 0
                    WHERE user_id = NEW.user_id;

                    UPDATE auth.users
                    SET banned_until = NEW.lock_until
                    WHERE id = NEW.user_id;
                END IF;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;`)

        const triggerExists = await queryRunner.query(`
            SELECT count(*)
            FROM information_schema.triggers
            WHERE trigger_name = 'handle_attempts_lockout_trigger' 
            AND event_object_schema = 'auth_layer' 
        `)

        if (parseInt(triggerExists[0]?.count) > 0) {
            return
        }

        await queryRunner.query(`
            CREATE TRIGGER handle_attempts_lockout_trigger 
            AFTER UPDATE ON auth_layer.failed_verification_attempts 
            FOR EACH ROW EXECUTE FUNCTION auth_layer.handle_attempts_lockout();`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.handle_attempts_lockout();`,
        )
    }
}
