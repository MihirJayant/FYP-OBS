CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  name text,
  role text,
  phone text,
  location text,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating NUMERIC(3,2) DEFAULT 0,
  refresh_token text,
  google_id text,
  auth_provider text,
  profile_image text,
  reset_otp VARCHAR(6),
  reset_otp_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE IF NOT EXISTS wallet_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text,
  diamonds int,
  reference_type text,
  reference_id uuid,
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  payment_gateway text,
  gateway_order_id text,
  gateway_payment_id text,
  amount_rupee numeric,
  status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  category text,
  budget numeric,
  deadline date,
  address text,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status text DEFAULT 'open',
  accepted_bid_id uuid,
  url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES users(id) ON DELETE SET NULL,
  diamonds_used int DEFAULT 0,
  estimated_days int,
  message text,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES users(id),
  old_status text,
  new_status text,
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  poster_id uuid REFERENCES users(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
    rating int,
  review text,
  created_at timestamptz DEFAULT now()
);

/* add dummy payment data for diamonds -> make sure change user id -> must be provider: 

INSERT INTO wallet_ledger (user_id, type, diamonds, reference_type, reference_id, note)
VALUES ('fa87c8fc7-6f13-4ab0-98cd-1e60f016adbd', 'credit', 10000, 'purchase', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'top-up');



INSERT INTO wallet_ledger (user_id, type, diamonds, reference_type, reference_id, note) 
VALUES ('a87c8fc7-6f13-4ab0-98cd-1e60f016adbd', 'credit', 10000, 'purchase', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'top-up');

*/