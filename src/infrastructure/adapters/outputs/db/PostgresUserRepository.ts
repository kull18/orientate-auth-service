import { Pool } from 'pg';
import { User } from '../../../../domain/entities/User';
import { UserRepositoryPort } from '../../../../application/ports/outputs/UserRepositoryPort';
import { UserMetricsDTO } from '../../../../application/ports/inputs/AuthUseCasesPort';

export class PostgresUserRepository implements UserRepositoryPort {
  constructor(
    private readonly pool: Pool,
    private readonly guidancePool: Pool
  ) {}

  async save(user: User): Promise<User> {
    const query = `
      INSERT INTO users (id, email, password_hash, name, role_id, is_active, created_at, updated_at, password_reset_token, password_reset_expires, privacy_accepted, privacy_accepted_at, avatar_url, claimed_cct, rfc, university_name, verification_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        role_id = EXCLUDED.role_id,
        is_active = EXCLUDED.is_active,
        password_reset_token = EXCLUDED.password_reset_token,
        password_reset_expires = EXCLUDED.password_reset_expires,
        privacy_accepted = EXCLUDED.privacy_accepted,
        privacy_accepted_at = EXCLUDED.privacy_accepted_at,
        avatar_url = EXCLUDED.avatar_url,
        claimed_cct = EXCLUDED.claimed_cct,
        rfc = EXCLUDED.rfc,
        university_name = EXCLUDED.university_name,
        verification_status = EXCLUDED.verification_status,
        updated_at = NOW()
      RETURNING id, email, password_hash, name, role_id, is_active, created_at, updated_at, password_reset_token, password_reset_expires, privacy_accepted, privacy_accepted_at, avatar_url, claimed_cct, rfc, university_name, verification_status;
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
      user.privacyAccepted,
      user.privacyAcceptedAt || null,
      user.avatarUrl || null,
      user.claimedCct || null,
      user.rfc || null,
      user.universityName || null,
      user.verificationStatus,
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
      row.password_reset_expires,
      row.privacy_accepted,
      row.privacy_accepted_at,
      row.avatar_url,
      row.claimed_cct,
      row.rfc,
      row.university_name,
      row.verification_status
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, name, role_id, is_active, created_at, updated_at, password_reset_token, password_reset_expires, privacy_accepted, privacy_accepted_at, avatar_url, claimed_cct, rfc, university_name, verification_status
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
      row.password_reset_expires,
      row.privacy_accepted,
      row.privacy_accepted_at,
      row.avatar_url,
      row.claimed_cct,
      row.rfc,
      row.university_name,
      row.verification_status
    );
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, name, role_id, is_active, created_at, updated_at, password_reset_token, password_reset_expires, privacy_accepted, privacy_accepted_at, avatar_url, claimed_cct, rfc, university_name, verification_status
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
      row.password_reset_expires,
      row.privacy_accepted,
      row.privacy_accepted_at,
      row.avatar_url,
      row.claimed_cct,
      row.rfc,
      row.university_name,
      row.verification_status
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
      SELECT id, email, password_hash, name, role_id, is_active, created_at, updated_at, password_reset_token, password_reset_expires, privacy_accepted, privacy_accepted_at, avatar_url, claimed_cct, rfc, university_name, verification_status
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
      row.password_reset_expires,
      row.privacy_accepted,
      row.privacy_accepted_at,
      row.avatar_url,
      row.claimed_cct,
      row.rfc,
      row.university_name,
      row.verification_status
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

  async updateAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    const query = `
      UPDATE users
      SET avatar_url = $2, updated_at = NOW()
      WHERE id = $1;
    `;
    await this.pool.query(query, [userId, avatarUrl]);
  }

  async getUserMetrics(): Promise<UserMetricsDTO> {
    const studentsQuery = `
      SELECT COUNT(*)::int as count 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.name = 'estudiante' AND u.is_active = true;
    `;
    const counselorsQuery = `
      SELECT COUNT(*)::int as count 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.name = 'orientador';
    `;
    const universitiesQuery = `
      SELECT COUNT(*)::int as count 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.name = 'universidad' AND u.is_premium = true;
    `;

    const messagesTodayQuery = `
      SELECT COUNT(*)::int as count 
      FROM chat_messages 
      WHERE created_at >= CURRENT_DATE;
    `;
    const messagesThisMonthQuery = `
      SELECT COUNT(*)::int as count 
      FROM chat_messages 
      WHERE created_at >= date_trunc('month', current_date);
    `;

    const sessionsScheduledQuery = `
      SELECT COUNT(*)::int as count 
      FROM counselor_sessions 
      WHERE status = 'SCHEDULED';
    `;
    const sessionsCompletedQuery = `
      SELECT COUNT(*)::int as count 
      FROM counselor_sessions 
      WHERE status = 'COMPLETED';
    `;
    const sessionsCancelledQuery = `
      SELECT COUNT(*)::int as count 
      FROM counselor_sessions 
      WHERE status = 'CANCELLED';
    `;
    const sessionsMonthlyQuery = `
      SELECT to_char(session_date, 'Mon') as month, COUNT(*)::int as value 
      FROM counselor_sessions 
      GROUP BY month, date_trunc('month', session_date) 
      ORDER BY date_trunc('month', session_date) ASC;
    `;

    try {
      const [
        studentsRes,
        counselorsRes,
        universitiesRes,
        msgTodayRes,
        msgMonthRes
      ] = await Promise.all([
        this.pool.query(studentsQuery),
        this.pool.query(counselorsQuery),
        this.pool.query(universitiesQuery),
        this.pool.query(messagesTodayQuery),
        this.pool.query(messagesThisMonthQuery)
      ]);

      const [
        sessionsScheduledRes,
        sessionsCompletedRes,
        sessionsCancelledRes,
        sessionsMonthlyRes
      ] = await Promise.all([
        this.guidancePool.query(sessionsScheduledQuery),
        this.guidancePool.query(sessionsCompletedQuery),
        this.guidancePool.query(sessionsCancelledQuery),
        this.guidancePool.query(sessionsMonthlyQuery)
      ]);

      let dbStatus = 'Inactivo';
      try {
        await this.pool.query('SELECT 1');
        dbStatus = 'Activo';
      } catch (e) {
        dbStatus = 'Inactivo';
      }

      let qdrantStatus = 'Inactivo';
      const qdrantHost = process.env.QDRANT_HOST || 'qdrant-db';
      try {
        const qdrantRes = await fetch(`http://${qdrantHost}:6333/healthz`, { 
          signal: (AbortSignal as any).timeout ? (AbortSignal as any).timeout(1000) : undefined 
        });
        if (qdrantRes.ok) {
          qdrantStatus = 'Activo';
        }
      } catch (e) {
        qdrantStatus = 'Inactivo';
      }

      const monthMap: Record<string, string> = {
        'Jan': 'Ene', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Abr', 'May': 'May', 'Jun': 'Jun',
        'Jul': 'Jul', 'Aug': 'Ago', 'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Dic'
      };
      const defaultMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthlySessions = defaultMonths.map((m) => ({ month: m, value: 0 }));

      sessionsMonthlyRes.rows.forEach(row => {
        const engMonth = row.month.trim();
        const espMonth = monthMap[engMonth] || engMonth;
        const found = monthlySessions.find(item => item.month === espMonth);
        if (found) {
          found.value = row.value || 0;
        }
      });

      return {
        userMetrics: {
          activeStudents: studentsRes.rows[0]?.count || 0,
          registeredCounselors: counselorsRes.rows[0]?.count || 0,
          premiumUniversities: universitiesRes.rows[0]?.count || 0
        },
        systemPerformance: {
          messagesToday: msgTodayRes.rows[0]?.count || 0,
          messagesThisMonth: msgMonthRes.rows[0]?.count || 0,
          dbStatus,
          qdrantStatus
        },
        appointments: {
          scheduled: sessionsScheduledRes.rows[0]?.count || 0,
          completed: sessionsCompletedRes.rows[0]?.count || 0,
          cancelled: sessionsCancelledRes.rows[0]?.count || 0
        },
        monthlySessions
      };
    } catch (error: any) {
      throw new Error(`Error fetching unified admin metrics: ${error.message}`);
    }
  }

  async findPendingUniversities(): Promise<User[]> {
    const query = `
      SELECT u.*, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'universidad' AND u.verification_status = 'PENDING'
      ORDER BY u.created_at ASC;
    `;
    try {
      const res = await this.pool.query(query);
      return res.rows.map(row => this.mapRowToUser(row));
    } catch (error: any) {
      throw new Error(`Error fetching pending universities: ${error.message}`);
    }
  }

  async updateVerificationStatus(userId: string, status: string, isPremium: boolean): Promise<void> {
    const query = `
      UPDATE users 
      SET verification_status = $1, is_premium = $2, updated_at = NOW() 
      WHERE id = $3;
    `;
    try {
      await this.pool.query(query, [status, isPremium, userId]);
    } catch (error: any) {
      throw new Error(`Error updating verification status: ${error.message}`);
    }
  }

  private mapRowToUser(row: any): User {
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
      row.password_reset_expires,
      row.privacy_accepted,
      row.privacy_accepted_at,
      row.avatar_url,
      row.claimed_cct,
      row.rfc,
      row.university_name,
      row.verification_status
    );
  }
}
