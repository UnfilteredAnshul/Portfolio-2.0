-- Run this SQL in your Supabase dashboard SQL editor
-- Go to https://supabase.com -> Your project -> SQL Editor -> New query

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  preview TEXT NOT NULL DEFAULT '',
  pinned BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT '',
  screenshots JSONB NOT NULL DEFAULT '[]',
  video TEXT DEFAULT NULL,
  date TEXT NOT NULL DEFAULT '',
  "projectFolderId" TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (optional, since requests go through Next.js API)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow all operations from the service role key (used by our backend)
CREATE POLICY "Service role can do everything"
  ON projects
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anon read access (so public pages can fetch projects)
CREATE POLICY "Anyone can read projects"
  ON projects
  FOR SELECT
  TO anon
  USING (true);
