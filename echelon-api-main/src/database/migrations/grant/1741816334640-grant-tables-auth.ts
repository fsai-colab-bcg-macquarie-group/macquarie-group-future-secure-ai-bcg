import { MigrationInterface, QueryRunner } from 'typeorm'

export class GrantTablesAuth1741816334640 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DO
                $$
                DECLARE
                    table_rec RECORD;
                BEGIN
                    
                    FOR table_rec IN 
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'auth' AND table_type = 'BASE TABLE'
                    LOOP
                    
                        EXECUTE format('GRANT ALL PRIVILEGES ON TABLE auth.%I TO authenticated, service_role;', table_rec.table_name);
                    END LOOP;
                END;
                $$;`)
    }

    public async down(): Promise<void> {}
}
