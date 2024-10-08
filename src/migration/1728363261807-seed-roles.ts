import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRoles1728363261807 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `INSERT INTO roles (name) VALUES ('admin'), ('partner'), ('user')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DELETE FROM roles`);
  }
}
