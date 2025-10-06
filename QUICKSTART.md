# Quick Start Guide 🚀

Get the Mini-CRM/PMS backend running in 5 minutes!

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js (need v20+)
node --version

# Check npm
npm --version

# Check if MongoDB is installed
mongod --version
```

If any are missing, see [SETUP.md](./SETUP.md) for installation instructions.

## Quick Start Steps

### 1. Install MongoDB (if not installed)

**Ubuntu/Linux:**
```bash
# Quick install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Windows:**
Download and install from: https://www.mongodb.com/try/download/community

### 2. Start MongoDB

```bash
# Linux
sudo systemctl start mongod

# macOS
brew services start mongodb-community@7.0

# Windows - MongoDB should start automatically as a service
```

### 3. Setup Backend

```bash
# Navigate to backend
cd backend

# Dependencies are already installed!
# If not, run: npm install

# Start the server
npm run dev
```

### 4. Verify It's Working

Open your browser or use curl:

```bash
curl http://localhost:5000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 5.123
}
```

### 5. Seed Demo Data (Optional)

```bash
cd backend
npm run db:seed
```

This creates demo users, leads, projects, and tasks.

### 6. Test the API

**Login with demo user:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@acme.test",
    "password": "Passw0rd!"
  }'
```

**Or register your own organization:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "My Company",
    "organizationDomain": "mycompany",
    "name": "Your Name",
    "email": "you@mycompany.com",
    "password": "SecurePass123!"
  }'
```

## What's Next?

✅ Backend is running!

Now you can:

1. **Import Postman Collection**
   - File: `Mini-CRM-API.postman_collection.json`
   - Test all API endpoints easily

2. **Read the Documentation**
   - [Backend README](./backend/README.md) - Detailed API docs
   - [SETUP.md](./SETUP.md) - Complete setup guide
   - [README.md](./README.md) - Project overview

3. **Start Development**
   - Implement remaining API endpoints
   - Build the frontend
   - Add tests

## Common Issues

### MongoDB not running?
```bash
# Check status
sudo systemctl status mongod  # Linux
brew services list             # macOS

# Start it
sudo systemctl start mongod    # Linux
brew services start mongodb-community@7.0  # macOS
```

### Port 5000 already in use?
```bash
# Change port in backend/.env
PORT=5001
```

### Need help?
Check [SETUP.md](./SETUP.md) for detailed troubleshooting.

## Demo Credentials

After running `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| SuperAdmin | superadmin@acme.test | Passw0rd! |
| Admin | admin@acme.test | Passw0rd! |
| Manager | manager@acme.test | Passw0rd! |
| Agent | agent@acme.test | Passw0rd! |
| Auditor | auditor@acme.test | Passw0rd! |

## Project Structure

```
mini-crm/
├── backend/              ← You are here
│   ├── src/
│   │   ├── controllers/  ← Request handlers
│   │   ├── models/       ← Database models
│   │   ├── routes/       ← API routes
│   │   ├── services/     ← Business logic
│   │   └── ...
│   ├── .env              ← Configuration
│   └── package.json
├── frontend/             ← Coming soon
└── docker-compose.yml    ← Docker setup
```

## Available Scripts

```bash
npm run dev      # Start development server (auto-reload)
npm run build    # Build for production
npm start        # Start production server
npm test         # Run tests
npm run db:seed  # Seed demo data
```

## API Endpoints (Currently Available)

- `POST /api/auth/register` - Register organization
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/password/forgot` - Request password reset
- `POST /api/auth/password/reset` - Reset password

More endpoints coming soon! 🚧

---

**Need more details?** See [SETUP.md](./SETUP.md) for comprehensive setup instructions.

**Ready to code?** Check out [Backend README](./backend/README.md) for API documentation.