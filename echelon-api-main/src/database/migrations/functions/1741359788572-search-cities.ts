import { MigrationInterface, QueryRunner } from 'typeorm'

export class SearchCitiesFunction1741359788572 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent;`)
        await queryRunner.query(`CREATE OR REPLACE FUNCTION auth_layer.search_cities(city_name text)
RETURNS TABLE(id uuid, city varchar, state varchar, country varchar) AS $$
BEGIN
    RETURN QUERY
    SELECT up.id AS id, up.city, up.state, up.country
    FROM auth_layer.world_states_cities up
    WHERE unaccent(lower(up.city)) LIKE unaccent(lower(city_name)) || '%'
    ORDER BY up.city
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS auth_layer.search_cities(text);`,
        )
    }
}
