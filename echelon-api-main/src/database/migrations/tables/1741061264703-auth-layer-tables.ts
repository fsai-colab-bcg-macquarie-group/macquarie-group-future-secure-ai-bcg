import { MigrationInterface, QueryRunner } from 'typeorm'

export class AuthLayerTables1741061264703 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS auth_layer.permission_description(
                id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                permission        auth_layer.permission NOT NULL,
                description       VARCHAR NOT NULL,
                permission_group  VARCHAR NOT NULL,
                created_at        TIMESTAMP DEFAULT NOW(),
                updated_at        TIMESTAMP DEFAULT NOW()
            );
        `)
        await queryRunner.query(`
            ALTER TABLE "auth_layer"."permission_description" ENABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS auth_layer.access (
                id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                name          VARCHAR NOT NULL,
                description   VARCHAR NULL,
                created_at    TIMESTAMP DEFAULT NOW(),
                updated_at    TIMESTAMP DEFAULT NOW()
            );
        `)
        await queryRunner.query(`
            ALTER TABLE "auth_layer"."access" ENABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS auth_layer.world_states_cities (
                id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                city        VARCHAR NOT NULL,
                state       VARCHAR NOT NULL,
                country     VARCHAR NOT NULL,
                created_at  TIMESTAMP DEFAULT NOW(),
                updated_at  TIMESTAMP DEFAULT NOW()
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS auth_layer.access_permissions (
                id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                access_id   uuid REFERENCES auth_layer.access ON DELETE CASCADE NOT NULL,
                permission  auth_layer.permission NOT NULL,
                created_at  TIMESTAMP DEFAULT NOW(),
                updated_at  TIMESTAMP DEFAULT NOW(),
                UNIQUE      (access_id, permission)
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."access_permissions" ENABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS auth_layer.use_case_team (
                id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                owner_id      uuid REFERENCES auth.users ON DELETE CASCADE,
                name          VARCHAR NOT NULL,
                description   VARCHAR NULL,
                created_at    TIMESTAMP DEFAULT NOW(),
                updated_at    TIMESTAMP DEFAULT NOW()
            );
        `)
        await queryRunner.query(`
            ALTER TABLE "auth_layer"."use_case_team" ENABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS auth_layer.use_case_team_member (
                id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id           uuid REFERENCES auth.users ON DELETE CASCADE,
                use_case_team_id  uuid REFERENCES auth_layer.use_case_team ON DELETE CASCADE,
                created_at        TIMESTAMP DEFAULT NOW(),
                updated_at        TIMESTAMP DEFAULT NOW(),
                UNIQUE            (user_id, use_case_team_id)
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."use_case_team_member" ENABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS auth_layer.failed_verification_attempts (
                user_id         UUID REFERENCES auth.users(id),
                failed_attempts INT DEFAULT 0,
                lock_until      TIMESTAMP,
                last_attempt    TIMESTAMP DEFAULT NOW(),
                PRIMARY KEY     (user_id)
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."failed_verification_attempts" ENABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS auth_layer.confirmation_email_sso(
                id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id           uuid REFERENCES auth.users ON DELETE CASCADE,
                email_expiraded_at TIMESTAMPTZ,
                email_is_active   BOOLEAN DEFAULT FALSE,
                created_at        TIMESTAMPTZ DEFAULT NOW(),
                updated_at        TIMESTAMPTZ DEFAULT NOW()
            );
        `)
        await queryRunner.query(`
            ALTER TABLE "auth_layer"."confirmation_email_sso" ENABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS auth_layer.access_hierarchy (
                id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                access_id          uuid REFERENCES auth_layer.access ON DELETE CASCADE,
                children_access_id uuid REFERENCES auth_layer.access ON DELETE CASCADE,
                created_at         TIMESTAMP DEFAULT NOW(),
                updated_at         TIMESTAMP DEFAULT NOW(),
                UNIQUE             (access_id, children_access_id)
            );
        `)

        await queryRunner.query(`
            ALTER TABLE "auth_layer"."access_hierarchy" ENABLE ROW LEVEL SECURITY;
        `)

        await queryRunner.query(`
            INSERT INTO auth_layer.access (name, description)
            VALUES
            ('Platform Administrator', 'Ability to manage ''Commercial Administrator'' users but not create AI Workers or Manage AI Workers; View usage and overall users across the enterprise.'),
            ('Commercial Administrator', 'As a ''Commercial Administrator'', ability to manage users that will be able to create AI Worker and Manage AI Workers; View usage and overall users within your teams.'),
            ('AI Worker Designer', 'Ability to create new AI Workers for your team.' ),
            ('AI Worker Manager', 'Ability to manage AI Workers assigned to you.');
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS auth_layer.user_profile(
                profile_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id      uuid REFERENCES auth.users ON DELETE CASCADE,
                first_name   VARCHAR NOT NULL,
                last_name    VARCHAR NOT NULL,
                access_id    uuid REFERENCES auth_layer.access ON DELETE SET NULL,
                location_id  uuid REFERENCES auth_layer.world_states_cities ON DELETE SET NULL,
                UNIQUE       (user_id)
            );
        `)
        await queryRunner.query(`
            ALTER TABLE "auth_layer"."user_profile" ENABLE ROW LEVEL SECURITY;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP TABLE IF EXISTS auth_layer.permission_description;`,
        )
        await queryRunner.query(`DROP TABLE IF EXISTS auth_layer.access;`)
        await queryRunner.query(
            `DROP TABLE IF EXISTS auth_layer.world_states_cities;`,
        )
    }
}
