# 🚀 Get Started with Mini-CRM/PMS

Welcome! This guide will help you get the project running quickly.

## 📋 What You Have

A **production-grade RBAC Mini-CRM/PMS backend** with:
- ✅ Complete authentication system (register, login, password reset)
- ✅ Role-based access control (5 roles, 25+ permissions)
- ✅ Multi-tenant architecture
- ✅ All database models ready
- ✅ Security features (JWT, rate limiting, validation)
- ✅ Comprehensive documentation

## 🎯 Quick Start (3 Steps)

### Step 1: Install MongoDB

**Choose your OS:**

<details>
<summary><b>Ubuntu/Linux</b></summary>

```bash
# Import MongoDB GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start
sudo systemctl start mongod
sudo systemctl enable mongod
```
</details>

<details>
<summary><b>macOS</b></summary>

```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start
brew services start mongodb-community@7.0
```
</details>

<details>
<summary><b>Windows</b></summary>

1. Download from: https://www.mongodb.com/try/download/community
2. Run installer, choose "Complete"
3. Install as Windows Service
4. MongoDB starts automatically
</details>

### Step 2: Start the Backend

```bash
# Navigate to backend
cd backend

# Start development server
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
📊 Database: mini-crm
🚀 Server running on port 5000
```

### Step 3: Test It!

Open your browser: http://localhost:5000/health

Or use curl:
```bash
curl http://localhost:5000/health
```

**Success!** 🎉 Your backend is running!

## 🌱 Add Demo Data (Optional)

```bash
cd backend
npm run db:seed
```

This creates:
- 1 organization (Acme Corp)
- 5 users (one per role)
- 5 sample leads
- 5 sample projects
- 8 sample tasks

**Demo Login:**
- Email: `superadmin@acme.test`
- Password: `Passw0rd!`

## 🧪 Test the API

### Option 1: Using cURL

**Register your organization:**
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

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@acme.test",
    "password": "Passw0rd!"
  }'
```

### Option 2: Using Postman

1. Open Postman
2. Import `Mini-CRM-API.postman_collection.json`
3. Use the "Login" request
4. Access token is saved automatically!

### Option 3: Using VS Code REST Client

Create `test.http`:
```http
### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "superadmin@acme.test",
  "password": "Passw0rd!"
}
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Project overview and features |
| [QUICKSTART.md](./QUICKSTART.md) | 5-minute quick start |
| [SETUP.md](./SETUP.md) | Detailed setup instructions |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture diagrams |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | What's done and what's next |
| [backend/README.md](./backend/README.md) | API documentation |

## 🎓 Understanding the Project

### Project Structure

```
mini-crm/
├── backend/
│   ├── src/
│   │   ├── controllers/    ← Request handlers
│   │   ├── services/       ← Business logic
│   │   ├── models/         ← Database models
│   │   ├── routes/         ← API endpoints
│   │   ├── middleware/     ← Auth, RBAC, validation
│   │   └── ...
│   └── package.json
├── docker-compose.yml      ← Easy deployment
└── *.md                    ← Documentation
```

### Key Concepts

**1. Multi-Tenant**
- Each organization is isolated
- Users can only see their org's data
- Automatic filtering by `orgId`

**2. RBAC (Role-Based Access Control)**
- 5 roles: SuperAdmin, Admin, Manager, Agent, Auditor
- 25+ fine-grained permissions
- Middleware checks permissions on every request

**3. JWT Authentication**
- Access token (15 min) for API calls
- Refresh token (7 days) to get new access token
- Tokens stored securely, can be revoked

**4. Audit Logging**
- Every change is logged
- Tracks who, what, when, before/after
- Complete audit trail

## 🔧 Common Tasks

### View Database

```bash
# Open MongoDB shell
mongosh

# Switch to database
use mini-crm

# View users
db.users.find().pretty()

# View leads
db.leads.find().pretty()

# View audit logs
db.auditlogs.find().sort({createdAt: -1}).limit(10).pretty()
```

### Reset Database

```bash
cd backend
mongosh mini-crm --eval "db.dropDatabase()"
npm run db:seed
```

### Check Logs

```bash
cd backend
npm run dev
# Logs appear in terminal
```

### Run Tests

```bash
cd backend
npm test
```

## 🚧 What's Next?

The backend core is complete! Here's what to build next:

### Phase 1: Complete API Endpoints (1-2 weeks)
- [ ] Lead management (CRUD + assign)
- [ ] Project management (CRUD)
- [ ] Task management (CRUD)
- [ ] User management (invite, list, update)
- [ ] Role management
- [ ] Notes and attachments
- [ ] Audit log viewing

### Phase 2: Frontend (2-3 weeks)
- [ ] React + Vite setup
- [ ] Authentication pages
- [ ] Dashboard
- [ ] Lead management UI
- [ ] Project/Task board
- [ ] User management UI

### Phase 3: Advanced Features
- [ ] Real-time updates (WebSocket)
- [ ] File uploads
- [ ] CSV import/export
- [ ] Advanced search
- [ ] Email notifications

## 💡 Tips

1. **Use Postman Collection**
   - Import `Mini-CRM-API.postman_collection.json`
   - Easiest way to test APIs

2. **Check Documentation**
   - Each file has detailed comments
   - README files explain everything

3. **Use Demo Data**
   - Run `npm run db:seed`
   - Test with different roles

4. **Read the Code**
   - Start with `backend/src/index.ts`
   - Follow the flow: routes → controllers → services → models

5. **Ask Questions**
   - Check [SETUP.md](./SETUP.md) for troubleshooting
   - Review [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions

## 🆘 Troubleshooting

### MongoDB not connecting?
```bash
# Check if running
sudo systemctl status mongod  # Linux
brew services list             # macOS

# Start it
sudo systemctl start mongod    # Linux
brew services start mongodb-community@7.0  # macOS
```

### Port 5000 in use?
```bash
# Change port in backend/.env
PORT=5001
```

### Dependencies not installed?
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Need to reset everything?
```bash
# Stop server (Ctrl+C)
# Drop database
mongosh mini-crm --eval "db.dropDatabase()"
# Restart
cd backend
npm run dev
npm run db:seed
```

## 📞 Resources

- **MongoDB Docs**: https://docs.mongodb.com/
- **Express.js Guide**: https://expressjs.com/
- **Mongoose Docs**: https://mongoosejs.com/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

## ✅ Checklist

Before you start coding:

- [ ] MongoDB is installed and running
- [ ] Backend dependencies are installed (`npm install`)
- [ ] Backend server starts successfully (`npm run dev`)
- [ ] Health check works (http://localhost:5000/health)
- [ ] Demo data is seeded (`npm run db:seed`)
- [ ] You can login via Postman/cURL
- [ ] You've read the documentation

## 🎉 You're Ready!

Everything is set up and ready to go. Start building the remaining API endpoints or jump into the frontend!

**Happy coding!** 🚀

---

**Need help?** Check [SETUP.md](./SETUP.md) for detailed troubleshooting.

**Want to understand the architecture?** Read [ARCHITECTURE.md](./ARCHITECTURE.md).

**Ready to code?** See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for what to build next.