import { MigrationInterface, QueryRunner } from 'typeorm'

export class AlterTableUseCaseTeam1741907783869 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE UNIQUE INDEX unique_name ON auth_layer.use_case_team (LOWER(name));
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS unique_name;`)
    }
}
