# ⚠️ Important Notes for Windows Users

## Hardcoded Paths in Linux Scripts

The Linux shell scripts (`start.sh`, `stop.sh`, etc.) contain hardcoded paths specific to the original Linux environment:

```bash
cd "/home/aryan/aryan/Expense Manager 2/backend"
cd "/home/aryan/aryan/Expense Manager 2/frontend"
```

**These paths will NOT work on Windows or other Linux systems.**

## Solutions

### ✅ Use Windows Batch Scripts (Recommended)

We've created Windows-compatible batch scripts that use relative paths:
- `setup.bat`
- `start.bat`
- `stop.bat`
- `push-to-github.bat`

These scripts will work on any Windows system regardless of installation path.

### ✅ Fix Linux Scripts (Optional)

If you want to use the Linux scripts on a different system, you need to either:

1. **Update the hardcoded paths** in `start.sh` (lines 41 and 61):
   ```bash
   # Change from:
   cd "/home/aryan/aryan/Expense Manager 2/backend"
   
   # To your actual path:
   cd "/your/actual/path/Expense Manager 2/backend"
   ```

2. **Use relative paths** (better approach):
   ```bash
   # Change from:
   cd "/home/aryan/aryan/Expense Manager 2/backend"
   
   # To:
   cd "$(dirname "$0")/backend"
   ```

## Platform-Specific Differences

### MongoDB

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl stop mongod
```

**Windows:**
```cmd
net start MongoDB
net stop MongoDB
```

### Process Management

**Linux:**
```bash
pkill -f "vite"
pkill -f "nodemon"
```

**Windows:**
```cmd
taskkill /F /FI "WINDOWTITLE eq Expense Manager*"
# Or kill by port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Path Separators

**Linux/Mac:** `/` (forward slash)
```bash
cd /home/user/project
```

**Windows:** `\` (backslash) or `/` (also works)
```cmd
cd C:\Users\user\project
cd C:/Users/user/project  # Also works
```

## Recommended Approach

### For Windows Users:
✅ Use the `.bat` scripts provided
✅ Follow the [WINDOWS_SETUP.md](WINDOWS_SETUP.md) guide
✅ Ignore the `.sh` scripts

### For Linux/Mac Users:
✅ Update hardcoded paths in `.sh` scripts
✅ Or use relative paths
✅ Ignore the `.bat` scripts

## Cross-Platform Alternative

For a truly cross-platform solution, consider using **npm scripts** in `package.json`:

```json
{
  "scripts": {
    "start:backend": "cd backend && npm run dev",
    "start:frontend": "cd frontend && npm run dev",
    "install:all": "cd backend && npm install && cd ../frontend && npm install"
  }
}
```

Then run:
```bash
npm run start:backend    # Works on all platforms
npm run start:frontend   # Works on all platforms
```

## Summary

| Platform | Use These Scripts |
|----------|------------------|
| Windows | `*.bat` files |
| Linux/Mac | `*.sh` files (after updating paths) |
| Any | npm scripts (if configured) |

---

**For Windows setup, see:** [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
**For quick commands, see:** [WINDOWS_QUICK_REFERENCE.md](WINDOWS_QUICK_REFERENCE.md)
