import { Pool } from 'pg';
import { User } from '../../../../domain/entities/User';
import { UserRepositoryPort } from '../../../../application/ports/outputs/UserRepositoryPort';

export class PostgresUserRepository implements UserRepositoryPort {
  constructor(private readonly pool: Pool) {}

  async save(user: User): Promise<User> {
    const query = `
      INSERT INTO users (id, email, password_hash, name, role_id, is_active, created_at, updated_at, password_reset_token, password_reset_expires)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        role_id = EXCLUDED.role_id,
        is_active = EXCLUDED.is_active,
        password_reset_token = EXCLUDED.password_reset_token,
        password_reset_expires = EXCLUDED.password_reset_expires,
        updated_at = NOW()
      RETURNING id, email, password_hash, name, role_id, is_active, created_at, updated_at, password_reset_token, password_reset_expires;
    `;

    const values = [
      user.id,
      user.email,
      user.passwordHash,
      user.name,
      user.roleId,
      user.isActive,
      user.createdAt,
      user.updatedAt,
      user.passwordResetToken || null,
      user.passwordResetExpires || null,
    ];

    const res = await this.pool.query(query, values);
    const row = res.rows[0];
    return new User(
      row.id,
      row.email,
      row.password_hash,
      row.name,
      row.role_id,
      row.is_active,
      row.created_at,
      row.updated_at,
      row.password_reset_token,
      row.password_reset_expires
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, name, role_id, is_active, created_at, updated_at, password_reset_token, password_reset_expires
      FROM users
      WHERE email = $1;
    `;
    const res = await this.pool.query(query, [email]);
    if (res.rows.length === 0) {
      return null;
    }
    const row = res.rows[0];
    return new User(
      row.id,
      row.email,
      row.password_hash,
      row.name,
      row.role_id,
      row.is_active,
      row.created_at,
      row.updated_at,
      row.password_reset_token,
      row.password_reset_expires
    );
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, name, role_id, is_active, created_at, updated_at, password_reset_token, password_reset_expires
      FROM users
      WHERE id = $1;
    `;
    const res = await this.pool.query(query, [id]);
    if (res.rows.length === 0) {
      return null;
    }
    const row = res.rows[0];
    return new User(
      row.id,
      row.email,
      row.password_hash,
      row.name,
      row.role_id,
      row.is_active,
      row.created_at,
      row.updated_at,
      row.password_reset_token,
      row.password_reset_expires
    );
  }

  async findRoleIdByName(roleName: string): Promise<string | null> {
    const query = `
      SELECT id
      FROM roles
      WHERE name = $1;
    `;
    const res = await this.pool.query(query, [roleName]);
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0].id;
  }

  async findRoleNameById(roleId: string): Promise<string | null> {
    const query = `
      SELECT name
      FROM roles
      WHERE id = $1;
    `;
    const res = await this.pool.query(query, [roleId]);
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0].name;
  }

  async findByResetToken(token: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, name, role_id, is_active, created_at, updated_at, password_reset_token, password_reset_expires
      FROM users
      WHERE password_reset_token = $1;
    `;
    const res = await this.pool.query(query, [token]);
    if (res.rows.length === 0) {
      return null;
    }
    const row = res.rows[0];
    return new User(
      row.id,
      row.email,
      row.password_hash,
      row.name,
      row.role_id,
      row.is_active,
      row.created_at,
      row.updated_at,
      row.password_reset_token,
      row.password_reset_expires
    );
  }

  async findAllRoles(): Promise<{ id: string; name: string; description: string | null }[]> {
    const query = `
      SELECT id, name, description
      FROM roles
      ORDER BY name ASC;
    `;
    const res = await this.pool.query(query);
    return res.rows;
  }
}
