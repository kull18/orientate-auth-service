-- Habilitar la extensión para generar UUIDs automáticamente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    privacy_accepted BOOLEAN DEFAULT FALSE,
    privacy_accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- 3. Índices para mejorar el rendimiento de consultas frecuentes (como login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- 5. Trigger para actualizar el campo 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_user_updated_at ON users;
CREATE TRIGGER trigger_update_user_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 6. Semillas de Roles
INSERT INTO roles (name, description) VALUES
('estudiante', 'Rol para estudiantes del sistema'),
('orientador', 'Rol para orientadores vocacionales'),
('universidad', 'Rol para representantes de universidades'),
('alumni', 'Rol para egresados del sistema')
ON CONFLICT (name) DO NOTHING;

-- 7. Migración de Base de Datos Existente
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE;

-- 8. Tabla para Mensajes de Chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_chat_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices compuestos para acelerar la consulta del historial de chat y chat reciente
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_receiver ON chat_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_created ON chat_messages(receiver_id, created_at DESC);

-- 9. Aceptación del aviso de privacidad (Migración para bases de datos existentes)
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE;

-- 10. Tabla de Pagos y Suscripciones (Mercado Pago)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    preference_id VARCHAR(255),
    payment_id VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    external_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;


