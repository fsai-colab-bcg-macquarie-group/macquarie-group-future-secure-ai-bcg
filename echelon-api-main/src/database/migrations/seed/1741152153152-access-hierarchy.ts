import { MigrationInterface } from 'typeorm'

import { QueryRunner } from 'typeorm'

export class AccessHierarchy1741152153152 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const accessCount = await queryRunner.query(`
            SELECT COUNT(*)
            FROM auth_layer.access;
        `)

        if (
            parseInt(accessCount[0]?.count) === 0 ||
            process.env.NODE_ENV === 'production'
        ) {
            return
        }

        const accessHierarchyCount = await queryRunner.query(`
            SELECT COUNT(*)
            FROM auth_layer.access_hierarchy;
        `)

        if (parseInt(accessHierarchyCount[0]?.count) !== 0) {
            return
        }

        await queryRunner.query(`
            WITH platform_admin_access_id AS(
            select id FROM auth_layer.access WHERE name = 'Platform Administrator' LIMIT 1
            )
            INSERT INTO auth_layer.access_hierarchy(access_id, children_access_id)
            SELECT
                (select id from platform_admin_access_id) AS access_id,
                id AS children_access_id
                FROM auth_layer.access
                WHERE name IN ('Platform Administrator', 'Commercial Administrator', 'AI Worker Designer');

            WITH commercial_admin_access_id AS(
                select id FROM auth_layer.access WHERE name = 'Commercial Administrator' LIMIT 1
            )
            INSERT INTO auth_layer.access_hierarchy(access_id, children_access_id)
            SELECT
                (select id from commercial_admin_access_id) AS access_id,
                id AS children_access_id
                FROM auth_layer.access
            WHERE name IN ('Commercial Administrator', 'AI Worker Manager');
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM auth_layer.access_hierarchy;`)
    }
}
