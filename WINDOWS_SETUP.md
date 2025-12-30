# 💰 Expense Manager - Windows Setup Guide

This guide will help you set up and run the MERN Expense Manager on Windows.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js (v18 or higher)
- Download from: https://nodejs.org/
- Choose the LTS version
- Verify installation:
  ```cmd
  node --version
  npm --version
  ```

### 2. MongoDB Community Edition
- Download from: https://www.mongodb.com/try/download/community
- **Important**: During installation, select "Install MongoDB as a Service"
- This will automatically start MongoDB on system boot
- Default installation path: `C:\Program Files\MongoDB\Server\7.0\`

**Alternative**: Use MongoDB Atlas (Cloud)
- Sign up at: https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Update `backend/.env` with your Atlas connection string

### 3. Git (Optional, for version control)
- Download from: https://git-scm.com/download/win
- Use default installation options

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Run the setup script**:
   ```cmd
   setup.bat
   ```
   This will:
   - Check Node.js and NPM installation
   - Check MongoDB installation
   - Install all backend dependencies
   - Install all frontend dependencies

2. **Start the application**:
   ```cmd
   start.bat
   ```
   This will:
   - Start MongoDB service (if not running)
   - Start backend server on http://localhost:5000
   - Start frontend server on http://localhost:3000
   - Open your browser automatically

3. **Stop the application**:
   ```cmd
   stop.bat
   ```

### Option 2: Manual Setup

#### Backend Setup

1. Open Command Prompt or PowerShell
2. Navigate to backend folder:
   ```cmd
   cd backend
   ```

3. Install dependencies:
   ```cmd
   npm install
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values:
     ```env
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/expense-manager
     JWT_SECRET=your-secret-key-change-in-production
     GOOGLE_AI_API_KEY=your-google-api-key-here
     ```

5. Start the backend server:
   ```cmd
   npm run dev
   ```
   Backend will run on: http://localhost:5000

#### Frontend Setup

1. Open a new Command Prompt or PowerShell window
2. Navigate to frontend folder:
   ```cmd
   cd frontend
   ```

3. Install dependencies:
   ```cmd
   npm install
   ```

4. Start the frontend server:
   ```cmd
   npm run dev
   ```
   Frontend will run on: http://localhost:3000

## 🔧 MongoDB Setup on Windows

### Starting MongoDB Service

```cmd
net start MongoDB
```

### Stopping MongoDB Service

```cmd
net stop MongoDB
```

### Checking MongoDB Status

```cmd
sc query MongoDB
```

### Manual MongoDB Start (if not installed as service)

```cmd
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

Note: You may need to create the `C:\data\db` directory first:
```cmd
mkdir C:\data\db
```

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:
1. Check if MongoDB service is running:
   ```cmd
   sc query MongoDB
   ```

2. Start MongoDB service:
   ```cmd
   net start MongoDB
   ```

3. If service doesn't exist, install MongoDB as a service:
   ```cmd
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --install --serviceName MongoDB --dbpath "C:\data\db"
   ```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000` or `:::3000`

**Solution**: Kill the process using the port

For port 5000 (Backend):
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

For port 3000 (Frontend):
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or simply run:
```cmd
stop.bat
```

### Node Modules Issues

**Error**: Module not found or dependency errors

**Solution**: Reinstall dependencies

Backend:
```cmd
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install
```

Frontend:
```cmd
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Permission Denied Errors

**Solution**: Run Command Prompt as Administrator
- Right-click on Command Prompt
- Select "Run as administrator"

### AI Features Not Working

1. Check if `GOOGLE_AI_API_KEY` is set in `backend/.env`
2. Get API key from: https://makersuite.google.com/app/apikey
3. The app will use smart fallback parser if AI fails

## 📁 Project Structure

```
Expense Manager 2/
├── setup.bat              # Windows setup script
├── start.bat              # Start all servers
├── stop.bat               # Stop all servers
├── push-to-github.bat     # GitHub push script
├── backend/               # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env              # Environment variables
│   └── server.js         # Entry point
└── frontend/              # React frontend
    ├── src/
    ├── public/
    └── package.json
```

## 🔐 Environment Variables

Create a `.env` file in the `backend` folder:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/expense-manager

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# Google AI (Optional - for AI features)
GOOGLE_AI_API_KEY=your-google-gemini-api-key-here
```

## 🌐 Accessing the Application

Once both servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

## 📝 Available Scripts

### Windows Batch Scripts

| Script | Description |
|--------|-------------|
| `setup.bat` | Initial setup - installs all dependencies |
| `start.bat` | Starts both backend and frontend servers |
| `stop.bat` | Stops all running servers |
| `push-to-github.bat` | Push code to GitHub repository |

### Backend Scripts (in backend folder)

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |

### Frontend Scripts (in frontend folder)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🎯 Next Steps

1. **Register a new account** at http://localhost:3000
2. **Add your first expense** using the Smart Add feature
3. **Set monthly budgets** for different categories
4. **Explore AI features** - Chat with the financial advisor
5. **Track recurring expenses** like subscriptions
6. **Export reports** to CSV or PDF

## 🔗 Useful Links

- **Node.js**: https://nodejs.org/
- **MongoDB**: https://www.mongodb.com/
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Google AI Studio**: https://makersuite.google.com/
- **Project Documentation**: See main README.md

## 💡 Tips for Windows Users

1. **Use PowerShell or CMD**: Both work fine, but PowerShell is recommended
2. **Run as Administrator**: Some operations (like starting MongoDB service) require admin privileges
3. **Antivirus**: Add project folder to antivirus exceptions if you face issues
4. **Firewall**: Allow Node.js through Windows Firewall when prompted
5. **Path Issues**: Use quotes for paths with spaces: `cd "C:\My Projects\Expense Manager 2"`

## 🆘 Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Review the main README.md
3. Check the error logs in the server windows
4. Ensure all prerequisites are installed correctly
5. Try running `setup.bat` again

## 🎉 Success!

If you see both servers running without errors, you're all set! Open http://localhost:3000 and start managing your expenses.

---

**Happy Expense Tracking on Windows! 💰📊**
