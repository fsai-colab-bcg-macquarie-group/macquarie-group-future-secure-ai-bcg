import { MigrationInterface, QueryRunner } from 'typeorm'

export class UserTeamMember1741188877228 implements MigrationInterface {
    private readonly userEmails = [
        'fsai.developer@futuresecure.ai',
        'worker.manager@futuresecure.ai',
        'commercial.administrator@futuresecure.ai',
    ]

    private readonly useCaseTeamNames = [
        'Investment Assets',
        'Investment Diligence',
        'Investment Compliance',
        'Maintenance Assets',
        'Financial Planning & Analysis',
        'Risk Management',
    ]

    public async up(queryRunner: QueryRunner): Promise<void> {
        const userTeamMemberCount = await queryRunner.query(`
            SELECT COUNT(*)
            FROM auth_layer.use_case_team_member;
        `)

        if (
            parseInt(userTeamMemberCount[0]?.count) !== 0 ||
            process.env.NODE_ENV === 'production'
        ) {
            return
        }

        const userCount = await queryRunner.query(`
            SELECT COUNT(*)
            FROM auth.users;
        `)

        if (parseInt(userCount[0]?.count) === 0) {
            return
        }

        await Promise.all(
            this.userEmails
                .map((userEmail) =>
                    this.useCaseTeamNames.map((useCaseTeamName) =>
                        this.insertUserTeamMember(
                            queryRunner,
                            userEmail,
                            useCaseTeamName,
                        ),
                    ),
                )
                .flat(),
        )
    }

    private async insertUserTeamMember(
        queryRunner: QueryRunner,
        userEmail: string,
        useCaseTeamName: string,
    ): Promise<void> {
        await queryRunner.query(`
            INSERT INTO auth_layer.use_case_team_member (user_id, use_case_team_id)
            SELECT 
                (SELECT id from auth.users WHERE email = '${userEmail}' LIMIT 1) as user_id,
                id as use_case_team_id
            FROM auth_layer.use_case_team
            WHERE 
                (SELECT id from auth.users WHERE email = '${userEmail}' LIMIT 1) IS NOT NULL
                AND name = '${useCaseTeamName}'; 
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM auth_layer.use_case_team_member;
        `)
    }
}
