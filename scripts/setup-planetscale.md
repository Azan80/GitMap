# Setting up PlanetScale Database for GitMap

## What is PlanetScale?

PlanetScale is a MySQL-compatible serverless database platform that's perfect for serverless applications like Vercel. It provides:
- **MySQL compatibility** - Standard SQL syntax
- **Serverless ready** - Works perfectly with Vercel
- **Free tier** - 1GB storage, 1 billion row reads/month
- **Branch-based development** - Database branching like Git

## Setup Steps

### 1. Create PlanetScale Account

1. Go to [planetscale.com](https://planetscale.com)
2. Sign up for a free account
3. Create a new organization

### 2. Create Database

1. Click "New Database"
2. Choose "Create new database"
3. Name it `gitmap-db`
4. Select your region
5. Click "Create database"

### 3. Get Connection Details

1. Go to your database dashboard
2. Click "Connect"
3. Select "Connect with PlanetScale CLI"
4. Copy the connection details

### 4. Set Environment Variables

Add these to your Vercel project environment variables:

```env
DATABASE_HOST=aws.connect.psdb.cloud
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
JWT_SECRET=your-secure-jwt-secret
```

### 5. Create Database Schema

The app will automatically create the required tables when it first runs.

### 6. Deploy to Vercel

```bash
vercel --prod
```

## Database Schema

The app will automatically create these tables:
- `users` - User accounts
- `user_sessions` - Authentication sessions  
- `repositories` - Git repositories
- `repository_files` - Files in repositories

## Admin Account

After first deployment, you can create an admin account:

**Email**: `admin@gitmap.com`
**Password**: `admin123`

Or create your own account through the signup form.

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_HOST`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` are correct
- Make sure your database is not paused

### Authentication Issues
- Check that `JWT_SECRET` is set
- Verify the database tables were created properly

### Performance Issues
- PlanetScale has a free tier limit of 1 billion row reads/month
- Consider upgrading for high-traffic applications
