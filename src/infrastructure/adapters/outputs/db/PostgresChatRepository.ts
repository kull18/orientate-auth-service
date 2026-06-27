import { Pool } from 'pg';
import { ChatMessage } from '../../../../domain/entities/ChatMessage';
import { ChatRepositoryPort, RecentContact } from '../../../../application/ports/outputs/ChatRepositoryPort';

export class PostgresChatRepository implements ChatRepositoryPort {
  constructor(private readonly pool: Pool) {}

  async saveMessage(message: ChatMessage): Promise<ChatMessage> {
    const query = `
      INSERT INTO chat_messages (id, sender_id, receiver_id, message_text, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, sender_id, receiver_id, message_text, is_read, created_at;
    `;
    const values = [
      message.id,
      message.senderId,
      message.receiverId,
      message.messageText,
      message.isRead,
      message.createdAt,
    ];

    const res = await this.pool.query(query, values);
    const row = res.rows[0];
    return new ChatMessage(
      row.id,
      row.sender_id,
      row.receiver_id,
      row.message_text,
      row.is_read,
      row.created_at
    );
  }

  async getChatHistory(userId1: string, userId2: string, limit: number, offset: number): Promise<ChatMessage[]> {
    const query = `
      SELECT id, sender_id, receiver_id, message_text, is_read, created_at
      FROM chat_messages
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4;
    `;
    const res = await this.pool.query(query, [userId1, userId2, limit, offset]);
    return res.rows.map(
      (row) =>
        new ChatMessage(
          row.id,
          row.sender_id,
          row.receiver_id,
          row.message_text,
          row.is_read,
          row.created_at
        )
    );
  }

  async markAsRead(senderId: string, receiverId: string): Promise<void> {
    const query = `
      UPDATE chat_messages
      SET is_read = TRUE
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE;
    `;
    await this.pool.query(query, [senderId, receiverId]);
  }

  async getRecentContacts(userId: string): Promise<RecentContact[]> {
    const query = `
      WITH ranked_messages AS (
          SELECT 
              m.*,
              CASE 
                  WHEN m.sender_id = $1 THEN m.receiver_id 
                  ELSE m.sender_id 
              END as contact_id,
              ROW_NUMBER() OVER (
                  PARTITION BY CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END 
                  ORDER BY m.created_at DESC, m.id DESC
              ) as rn
          FROM chat_messages m
          WHERE m.sender_id = $1 OR m.receiver_id = $1
      )
      SELECT 
          rm.contact_id,
          u.email as contact_email,
          u.name as contact_name,
          r.name as contact_role,
          rm.message_text as last_message_text,
          rm.created_at as last_message_created_at,
          COALESCE(unread.unread_count, 0)::int as unread_count
      FROM ranked_messages rm
      JOIN users u ON u.id = rm.contact_id
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN (
          SELECT sender_id, COUNT(*)::int as unread_count
          FROM chat_messages
          WHERE receiver_id = $1 AND is_read = FALSE
          GROUP BY sender_id
      ) unread ON unread.sender_id = rm.contact_id
      WHERE rm.rn = 1
      ORDER BY rm.created_at DESC;
    `;
    const res = await this.pool.query(query, [userId]);
    return res.rows.map((row) => ({
      contactId: row.contact_id,
      contactName: row.contact_name,
      contactEmail: row.contact_email,
      contactRole: row.contact_role,
      lastMessageText: row.last_message_text,
      lastMessageCreatedAt: row.last_message_created_at,
      unreadCount: row.unread_count,
    }));
  }
}
