-- 0001_initial.sql
-- Combined schema for tgdintranet: 
--   - users (RBAC: admin/marketer/user)
--   - profiles (extended user profile, Supabase-compat)
--   - user_roles (Supabase-compat)
--   - employees + employee_children
--   - partner_certificates + certificate_versions
--   - success_cases
--   - mascot_votes + mascot_options

-- ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'marketer', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(256) NOT NULL,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  position text,
  department text,
  phone varchar(64),
  birthday date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_unique UNIQUE (email)
);
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  avatar_url text,
  position text,
  department text,
  phone varchar(64),
  birthday date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- USER_ROLES
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role varchar(32) NOT NULL CHECK (role IN ('admin','marketer','user')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  position text NOT NULL,
  department text,
  email varchar(256),
  phone varchar(64),
  telegram varchar(64),
  birthday date,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS employees_department_idx ON employees (department);

-- EMPLOYEE CHILDREN
CREATE TABLE IF NOT EXISTS employee_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name text,
  birthday date NOT NULL,
  gender varchar(8) NOT NULL CHECK (gender IN ('male', 'female')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- PARTNER_CERTIFICATES
CREATE TABLE IF NOT EXISTS partner_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name text NOT NULL,
  legal_entity text,
  tags text[] NOT NULL DEFAULT '{}',
  partner_status text,
  issued_date date,
  expiry_date date,
  file_path text,
  discount text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CERTIFICATE_VERSIONS
CREATE TABLE IF NOT EXISTS certificate_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL REFERENCES partner_certificates(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  version_number int NOT NULL DEFAULT 1,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- SUCCESS_CASES
CREATE TABLE IF NOT EXISTS success_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  client text,
  solution text,
  result text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- MASCOT_VOTES
CREATE TABLE IF NOT EXISTS mascot_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  option_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- MASCOT_OPTIONS
CREATE TABLE IF NOT EXISTS mascot_options (
  id text PRIMARY KEY,
  name text NOT NULL,
  image_url text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- TRIGGERS
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS employees_updated_at ON employees;
CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS partner_certificates_updated_at ON partner_certificates;
CREATE TRIGGER partner_certificates_updated_at BEFORE UPDATE ON partner_certificates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS success_cases_updated_at ON success_cases;
CREATE TRIGGER success_cases_updated_at BEFORE UPDATE ON success_cases FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience varchar(32) NOT NULL DEFAULT 'user',
  is_pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  url text NOT NULL,
  category varchar(64) NOT NULL DEFAULT 'other',
  icon_name text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  visible_to varchar(32) NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- FORMS
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  file_url text,
  external_url text,
  download_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  visible_to varchar(32) NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- KNOWLEDGE PAGES
CREATE TABLE IF NOT EXISTS knowledge_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(128) NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  visible_to varchar(32) NOT NULL DEFAULT 'user',
  updated_by uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS services_updated_at ON services;
CREATE TRIGGER services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS forms_updated_at ON forms;
CREATE TRIGGER forms_updated_at BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS knowledge_pages_updated_at ON knowledge_pages;
CREATE TRIGGER knowledge_pages_updated_at BEFORE UPDATE ON knowledge_pages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
