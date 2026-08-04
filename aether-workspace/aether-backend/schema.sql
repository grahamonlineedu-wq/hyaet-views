-- Disable legacy plaintext storage and enforce encrypted tables

-- 1. Users Identity Registry
-- Stores public cryptographic identity keys without private keys or passwords.
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    public_identity_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Encrypted Queue
-- Stores encrypted frames in transit.
CREATE TABLE IF NOT EXISTS encrypted_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    nonce VARCHAR(64) NOT NULL,
    ciphertext TEXT NOT NULL,
    is_delivered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes to maximize sub-50ms query routing for recipients
CREATE INDEX IF NOT EXISTS idx_messages_recipient 
ON encrypted_messages(recipient_id, is_delivered);

