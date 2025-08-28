# Setting up Supabase Database for GitMap

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- **PostgreSQL Database** - Real SQL database with full ACID compliance
- **Real-time subscriptions** - Live data updates
- **Authentication** - Built-in auth system
- **Free tier** - 500MB database, 50,000 monthly active users
- **Open source** - Self-hostable if needed

## Setup Steps

### 1. Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new organization

### 2. Create Project

1. Click "New Project"
2. Choose your organization
3. Enter project name: `gitmap-db`
4. Enter database password (save this!)
5. Choose region closest to you
6. Click "Create new project"

### 3. Get Connection Details

1. Go to your project dashboard
2. Click "Settings" → "API"
3. Copy the following:
   - **Project URL** (starts with `https://`)
   - **Service Role Key** (starts with `eyJ`)

### 4. Create Database Tables

Run these SQL commands in the Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repositories table
CREATE TABLE repositories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  git_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repository files table
CREATE TABLE repository_files (
  id SERIAL PRIMARY KEY,
  repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_content TEXT,
  file_size INTEGER DEFAULT 0,
  file_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_repositories_user_id ON repositories(user_id);
CREATE INDEX idx_repository_files_repository_id ON repository_files(repository_id);
```

### 5. Set Environment Variables

Add these to your Vercel project environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-secure-jwt-secret
```

### 6. Deploy to Vercel

```bash
vercel --prod
```

## Database Features

- ✅ **Real PostgreSQL** - Full SQL database
- ✅ **Persistent data** - Data survives deployments
- ✅ **Real-time** - Live updates (optional)
- ✅ **Free tier** - 500MB storage, 50K users/month
- ✅ **Open source** - Self-hostable

## Admin Account

After first deployment, you can create an admin account:

**Email**: `admin@gitmap.com`
**Password**: `admin123`

Or create your own account through the signup form.

## Troubleshooting

### Database Connection Issues
- Verify your `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Make sure your project is not paused

### Authentication Issues
- Check that `JWT_SECRET` is set
- Verify the database tables were created properly

### Performance Issues
- Supabase has a free tier limit of 50,000 monthly active users
- Consider upgrading for high-traffic applications
