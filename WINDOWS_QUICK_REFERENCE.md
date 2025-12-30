# Quick Reference - Windows Commands

## 🚀 Getting Started

### First Time Setup
```cmd
setup.bat
```

### Start Application
```cmd
start.bat
```

### Stop Application
```cmd
stop.bat
```

## 🔧 MongoDB Commands

### Start MongoDB Service
```cmd
net start MongoDB
```

### Stop MongoDB Service
```cmd
net stop MongoDB
```

### Check MongoDB Status
```cmd
sc query MongoDB
```

## 🛠️ Development Commands

### Backend (in backend folder)
```cmd
cd backend
npm install          # Install dependencies
npm start           # Start production server
npm run dev         # Start development server with nodemon
```

### Frontend (in frontend folder)
```cmd
cd frontend
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🐛 Troubleshooting Commands

### Kill Process on Port 5000 (Backend)
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Kill Process on Port 3000 (Frontend)
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Reinstall Dependencies (Backend)
```cmd
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Reinstall Dependencies (Frontend)
```cmd
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

## 📦 Git Commands

### Initialize and Push to GitHub
```cmd
push-to-github.bat
```

### Manual Git Commands
```cmd
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

## 📝 Environment Variables

Edit `backend\.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-manager
JWT_SECRET=your-secret-key
GOOGLE_AI_API_KEY=your-api-key
```

## 🔍 Check Versions

```cmd
node --version
npm --version
mongod --version
git --version
```

## 💡 Tips

1. **Run as Administrator**: Some commands need admin privileges
2. **Use PowerShell**: Better than CMD for modern Windows
3. **Check Firewall**: Allow Node.js through Windows Firewall
4. **Antivirus**: Add project folder to exceptions if needed

## 🆘 Common Issues

### MongoDB Not Starting
```cmd
# Run as Administrator
net start MongoDB

# Or manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### Port Already in Use
```cmd
# Use stop.bat or manually kill processes
stop.bat
```

### Permission Denied
```cmd
# Right-click Command Prompt → Run as administrator
```

---

For detailed troubleshooting, see [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
