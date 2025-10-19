# 🔑 Login Credentials - Quatex Platform

## Admin Account
**Email:** admin@quatex.com  
**Password:** admin123  
**Role:** Administrator  
**Access:** Full admin panel + all features

**Admin Panel URL:** http://localhost:3000/admin/login

---

## User Accounts

### Main Demo User
**Email:** user@quatex.com  
**Password:** user123  
**Balance:** $1,000  
**Demo Balance:** $10,000  
**Tournament Balance:** $0

### Trader 1
**Email:** trader1@test.com  
**Password:** demo123  
**Balance:** $1,000  
**Demo Balance:** $10,000

### Trader 2
**Email:** trader2@test.com  
**Password:** demo123  
**Balance:** $1,000  
**Demo Balance:** $10,000

**User Login URL:** http://localhost:3000/auth/login

---

## Quick Commands

### Create New Admin:
```bash
ADMIN_EMAIL=youremail@example.com ADMIN_PASSWORD=yourpassword npm run create:admin
```

### Create New User:
```bash
USER_EMAIL=user@example.com USER_PASSWORD=password USER_NAME="User Name" node scripts/createDemoUser.js
```

### Check All Users:
```bash
node scripts/checkUsers.js
```

---

## Login Issue Fixed ✅

**Problem:** Database had no users, causing 401 error on login
**Solution:** Created admin and demo users
**Status:** Login now working for all accounts

---

## Testing Tournament System

1. **Login as User:**
   - Email: user@quatex.com
   - Password: user123
   
2. **Browse Tournaments:**
   - Go to: http://localhost:3000/tournaments
   
3. **Join a Tournament:**
   - Click "Join Tournament" on active tournament
   - Entry fee will be deducted
   - You'll receive $10,000 tournament balance
   
4. **Place Trades:**
   - Trade normally
   - Stats will auto-update on trade close
   
5. **Check Leaderboard:**
   - View your rank in real-time
   - See profit, trades, win rate

---

## Admin Testing

1. **Login as Admin:**
   - Email: admin@quatex.com
   - Password: admin123
   
2. **Create Tournament:**
   - Go to: http://localhost:3000/admin/tournaments
   - Click "Create Tournament"
   - Fill form and submit
   
3. **Manage Tournaments:**
   - View all tournaments
   - See participant stats
   - Monitor prize pools

---

**Last Updated:** 2025-10-12  
**Status:** All accounts active and ready to use
