# GitMap - Modern Git Management Interface

GitMap is a comprehensive web-based Git management tool built with Next.js that provides a modern, intuitive interface for managing Git repositories, commits, branches, and more.

## Features

### 🚀 Core Git Operations
- **Repository Management**: Initialize new repositories, clone existing ones
- **File Staging**: Stage/unstage files with visual status indicators
- **Committing**: Create commits with custom messages
- **Branch Management**: Create, switch, and delete branches
- **Remote Operations**: Push, pull, and fetch changes

### 📊 Visual Interface
- **Status Panel**: Real-time repository status with branch info and change counts
- **File Browser**: Visual file status with staging controls
- **Branch Manager**: Easy branch switching and management
- **Repository Actions**: Quick access to push/pull/fetch operations

### 🎨 Modern UI
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Sidebar**: Clean navigation with repository list
- **Real-time Updates**: Live status updates and notifications
- **Toast Notifications**: User-friendly error and success messages

## Getting Started

### Prerequisites
- Node.js 18+ 
- Git installed on your system
- Access to Git repositories

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd gitmap
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Deployment (Vercel)

The app is configured to work on Vercel with a simple database solution:

1. **Set Environment Variables**:
   ```env
   JWT_SECRET=your-secure-jwt-secret
   ```
2. **Deploy**: `vercel --prod`

**Admin Account** (created automatically):
- **Email**: `admin@gitmap.com`
- **Password**: `admin123`

**Features**:
- ✅ **Works on Vercel** - No file system issues
- ✅ **SQLite compatibility** - Same SQL you know
- ✅ **Simple setup** - No external database required
- ✅ **Serverless ready** - Perfect for Vercel

**Note**: For production use with persistent data, consider:
- **Turso** (cloud SQLite): `npm install @libsql/client`
- **PlanetScale** (MySQL): `npm install @planetscale/database`
- **Supabase** (PostgreSQL): `npm install @supabase/supabase-js`

## Usage

### Repository Management

1. **Create New Repository**:
   - Click "Initialize New" in the Repository Creator
   - Enter the path for your new repository
   - Click "Initialize Repository"

2. **Clone Existing Repository**:
   - Click "Clone Existing" in the Repository Creator
   - Enter the repository URL
   - Optionally specify a target path
   - Click "Clone Repository"

### Working with Files

1. **View File Status**:
   - Select a repository from the sidebar
   - View file changes in the File Browser panel
   - Files are color-coded by status (modified, untracked, deleted, staged)

2. **Stage Files**:
   - Check the files you want to stage
   - Click "Stage Selected" or "Stage All"
   - Staged files appear in the green "Staged Files" section

3. **Commit Changes**:
   - Write a commit message in the Commit Panel
   - Click "Commit" to create a new commit

### Branch Management

1. **Switch Branches**:
   - View all branches in the Branch Manager
   - Click "Checkout" on any branch to switch to it

2. **Create New Branch**:
   - Click "New Branch" in the Branch Manager
   - Enter the branch name
   - Click "Create"

3. **Delete Branch**:
   - Click "Delete" on any non-current branch
   - Confirm the deletion

### Remote Operations

1. **Push Changes**:
   - Click "Push" in the Repository Actions panel
   - Your local commits will be uploaded to the remote

2. **Pull Changes**:
   - Click "Pull" to download and merge remote changes
   - Use "Fetch" to download without merging

## Technical Details

### Architecture
- **Frontend**: Next.js 15 with React 19
- **State Management**: Zustand for global state
- **Git Operations**: simple-git library
- **Styling**: Tailwind CSS
- **Notifications**: react-hot-toast

### File Structure
```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/         # React components
│   ├── sidebar.tsx     # Repository navigation
│   ├── status-panel.tsx # Git status display
│   ├── file-browser.tsx # File management
│   ├── commit-panel.tsx # Commit interface
│   ├── branch-manager.tsx # Branch management
│   ├── repo-actions.tsx # Remote operations
│   └── repo-creator.tsx # Repository creation
├── lib/               # Utility functions
│   ├── utils.ts       # General utilities
│   └── git.ts         # Git operations wrapper
└── store/             # State management
    └── git-store.ts   # Zustand store
```

### Key Components

- **GitManager**: Wrapper around simple-git for Git operations
- **useGitStore**: Zustand store for application state
- **Sidebar**: Repository navigation and selection
- **StatusPanel**: Real-time Git status display
- **FileBrowser**: File staging and management interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
