import { MigrationInterface, QueryRunner } from 'typeorm'

export class InsertUseCaseTeams1741188161245 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const useCaseTeamCount = await queryRunner.query(`
            SELECT COUNT(*)
            FROM auth_layer.use_case_team;
        `)

        if (parseInt(useCaseTeamCount[0]?.count) !== 0) {
            return
        }

        const userCount = await queryRunner.query(`
            SELECT COUNT(*)
            FROM auth.users;
        `)

        if (parseInt(userCount[0]?.count) === 0) {
            return
        }

        await queryRunner.query(`
            INSERT INTO auth_layer.use_case_team (name, description, owner_id)
            VALUES ('Investment Diligence', 'Investment Diligence', (SELECT id FROM auth.users WHERE email = 'commercial.administrator@futuresecure.ai')),
            ('Investment Assets', 'Investment Assets', (SELECT id FROM auth.users WHERE email = 'commercial.administrator@futuresecure.ai')),
            ('Investment Compliance', 'Investment Compliance', (SELECT id FROM auth.users WHERE email = 'commercial.administrator@futuresecure.ai')),
            ('Maintenance Assets', 'Maintenance Assets', (SELECT id FROM auth.users WHERE email = 'commercial.administrator@futuresecure.ai')),
            ('Financial Planning & Analysis', 'Financial Planning & Analysis', (SELECT id FROM auth.users WHERE email = 'commercial.administrator@futuresecure.ai')),
            ('Risk Management', 'Risk Management', (SELECT id FROM auth.users WHERE email = 'commercial.administrator@futuresecure.ai'));
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM auth_layer.use_case_team;
        `)
    }
}
