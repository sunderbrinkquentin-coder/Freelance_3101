/*
  # Add Purchases Tracking

  1. New Tables
    - `user_purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `purchase_type` (text: 'single', 'bundle-3', 'bundle-5')
      - `amount_paid` (numeric)
      - `credits_added` (integer)
      - `stripe_payment_id` (text, nullable)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `user_purchases` table
    - Add policies for users to read their own purchases

  3. Important Notes
    - This table tracks all purchases made by users
    - Each purchase adds credits to user_tokens table
    - Single purchase adds 1 credit, bundles add 3 or 5 credits
*/

CREATE TABLE IF NOT EXISTS user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_type text NOT NULL CHECK (purchase_type IN ('single', 'bundle-3', 'bundle-5')),
  amount_paid numeric(10,2) NOT NULL,
  credits_added integer NOT NULL DEFAULT 1,
  stripe_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON user_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_created_at ON user_purchases(created_at DESC);
