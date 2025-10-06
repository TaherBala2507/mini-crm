# Setup Guide - Mini-CRM/PMS

Complete setup instructions for the Mini-CRM/PMS project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20 or higher - [Download](https://nodejs.org/)
- **MongoDB** 7.0 or higher - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **Docker & Docker Compose** (Optional but recommended) - [Download](https://www.docker.com/)

## Installation Options

### Option 1: Docker Compose (Recommended - Easiest)

This is the easiest way to get started. Docker will handle MongoDB installation automatically.

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop

2. **Start the application**
   ```bash
   cd mini-crm
   docker-compose up -d
   ```

3. **Check if services are running**
   ```bash
   docker-compose ps
   ```

4. **View logs**
   ```bash
   docker-compose logs -f backend
   ```

5. **Access the API**
   - Backend: http://localhost:5000/api
   - Health check: http://localhost:5000/health

6. **Stop services**
   ```bash
   docker-compose down
   ```

### Option 2: Manual Setup (More Control)

#### Step 1: Install MongoDB

**On Ubuntu/Debian:**
```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

**On macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Verify MongoDB is running
brew services list
```

**On Windows:**
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service
5. MongoDB will start automatically

#### Step 2: Verify MongoDB Installation

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# You should see the MongoDB version (e.g., 7.0.x)
```

#### Step 3: Setup Backend

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file**
   
   Open `.env` in your text editor and update:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mini-crm
   JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production-12345678
   JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production-87654321
   ```

   ⚠️ **Important**: In production, use strong random secrets (32+ characters)

5. **Start the backend**
   ```bash
   npm run dev
   ```

6. **Verify backend is running**
   
   Open http://localhost:5000/health in your browser
   
   You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-15T10:30:00.000Z",
     "uptime": 5.123
   }
   ```

#### Step 4: Seed Demo Data (Optional)

```bash
cd backend
npm run db:seed
```

This will create:
- 1 Demo organization (Acme Corp)
- 5 Roles (SuperAdmin, Admin, Manager, Agent, Auditor)
- 5 Demo users (one for each role)
- 5 Sample leads
- 5 Sample projects
- 8 Sample tasks

**Demo Credentials:**
- Email: `superadmin@acme.test` | Password: `Passw0rd!`
- Email: `admin@acme.test` | Password: `Passw0rd!`
- Email: `manager@acme.test` | Password: `Passw0rd!`
- Email: `agent@acme.test` | Password: `Passw0rd!`
- Email: `auditor@acme.test` | Password: `Passw0rd!`

## Testing the API

### Using cURL

1. **Health Check**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Register New Organization**
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

3. **Login**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "superadmin@acme.test",
       "password": "Passw0rd!"
     }'
   ```

4. **Get Current User** (replace TOKEN with your access token)
   ```bash
   curl http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Using Postman

1. **Import Collection**
   - Open Postman
   - Click "Import"
   - Select `Mini-CRM-API.postman_collection.json` from project root
   - The collection will be imported with all endpoints

2. **Test Endpoints**
   - Start with "Login" request
   - Access token will be automatically saved
   - Try other endpoints

### Using VS Code REST Client

If you have the REST Client extension installed:

1. Create a file `test.http` in the project root
2. Add requests:
   ```http
   ### Health Check
   GET http://localhost:5000/health

   ### Register
   POST http://localhost:5000/api/auth/register
   Content-Type: application/json

   {
     "organizationName": "Test Corp",
     "organizationDomain": "testcorp",
     "name": "Test User",
     "email": "test@testcorp.com",
     "password": "SecurePass123!"
   }

   ### Login
   POST http://localhost:5000/api/auth/login
   Content-Type: application/json

   {
     "email": "superadmin@acme.test",
     "password": "Passw0rd!"
   }
   ```

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoServerError: connect ECONNREFUSED"**

Solution:
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list             # macOS

# Start MongoDB if not running
sudo systemctl start mongod    # Linux
brew services start mongodb-community@7.0  # macOS
```

**Error: "MongoParseError: Invalid connection string"**

Solution: Check your `MONGODB_URI` in `.env` file. It should be:
```
MONGODB_URI=mongodb://localhost:27017/mini-crm
```

### Port Already in Use

**Error: "EADDRINUSE: address already in use :::5000"**

Solution:
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change the port in .env
PORT=5001
```

### JWT Secret Errors

**Error: "Invalid environment variables: JWT_ACCESS_SECRET: String must contain at least 32 character(s)"**

Solution: Update your `.env` file with longer secrets:
```env
JWT_ACCESS_SECRET=this-is-a-very-long-secret-key-for-access-tokens-minimum-32-chars
JWT_REFRESH_SECRET=this-is-a-very-long-secret-key-for-refresh-tokens-minimum-32-chars
```

### TypeScript Compilation Errors

Solution:
```bash
# Clean and rebuild
cd backend
rm -rf dist node_modules
npm install
npm run build
```

### Permission Denied Errors

**Error: "EACCES: permission denied"**

Solution:
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules

# Or use sudo (not recommended)
sudo npm install
```

## Development Workflow

### Starting Development

1. **Start MongoDB** (if not using Docker)
   ```bash
   sudo systemctl start mongod  # Linux
   brew services start mongodb-community@7.0  # macOS
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **In another terminal, watch logs**
   ```bash
   cd backend
   tail -f logs/app.log  # if you have file logging
   ```

### Making Changes

1. Edit files in `backend/src/`
2. Server will automatically restart (nodemon)
3. Test your changes
4. Run tests: `npm test`

### Before Committing

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test

# Build to check for TypeScript errors
npm run build
```

## Production Deployment

### Environment Variables

Create a `.env.production` file with:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db:27017/mini-crm
JWT_ACCESS_SECRET=<generate-strong-random-secret-64-chars>
JWT_REFRESH_SECRET=<generate-strong-random-secret-64-chars>
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=info
```

### Build and Run

```bash
cd backend
npm run build
NODE_ENV=production npm start
```

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name mini-crm-api

# View logs
pm2 logs mini-crm-api

# Monitor
pm2 monit

# Restart
pm2 restart mini-crm-api

# Stop
pm2 stop mini-crm-api
```

## Next Steps

1. ✅ Backend is running
2. 📝 Test API endpoints with Postman
3. 🔨 Implement remaining API endpoints (Leads, Projects, Tasks, etc.)
4. 🎨 Build frontend with React + Vite
5. 🚀 Deploy to production

## Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run db:seed      # Seed demo data

# MongoDB
mongosh              # Open MongoDB shell
mongosh --eval "use mini-crm; db.users.find()"  # Query database

# Docker
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # View backend logs
docker-compose restart backend    # Restart backend
```

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify environment variables are set correctly

## Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Happy coding! 🚀