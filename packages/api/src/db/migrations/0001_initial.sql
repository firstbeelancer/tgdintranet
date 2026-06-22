-- 0001_initial.sql
-- Создание базовой схемы tgdintranet

-- ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'marketer', 'user');
CREATE TYPE service_category AS ENUM (
  'marketing',
  'hr',
  'development',
  'documents',
  'communication',
  'analytics',
  'other'
);

-- USERS
CREATE TABLE users (
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
CREATE INDEX users_role_idx ON users (role);

-- ANNOUNCEMENTS
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience user_role NOT NULL DEFAULT 'user',
  is_pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX announcements_published_idx ON announcements (published_at DESC);
CREATE INDEX announcements_audience_idx ON announcements (audience);

-- SERVICES (быстрые ссылки)
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  url text NOT NULL,
  category service_category NOT NULL DEFAULT 'other',
  icon_name text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  visible_to user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX services_order_idx ON services (display_order);
CREATE INDEX services_category_idx ON services (category);

-- EMPLOYEES (контакты)
CREATE TABLE employees (
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
CREATE INDEX employees_department_idx ON employees (department);
CREATE INDEX employees_fullname_idx ON employees (full_name);

-- EMPLOYEE CHILDREN
CREATE TABLE employee_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name text,
  birthday date NOT NULL,
  gender varchar(8) NOT NULL CHECK (gender IN ('male', 'female')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- FORMS (шаблоны)
CREATE TABLE forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  file_url text,
  external_url text,
  download_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  visible_to user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX forms_category_idx ON forms (category);

-- KNOWLEDGE BASE PAGES
CREATE TABLE knowledge_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(128) NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  visible_to user_role NOT NULL DEFAULT 'user',
  updated_by uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX knowledge_category_idx ON knowledge_pages (category);

-- TRIGGER для updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER forms_updated_at BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER knowledge_updated_at BEFORE UPDATE ON knowledge_pages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
