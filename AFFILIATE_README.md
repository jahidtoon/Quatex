# Quatex Affiliate Program

## Overview
A complete affiliate program system with professional dashboard, analytics, and earnings tracking.

## Features
- 🎯 **Professional Landing Page** - Modern design with statistics and testimonials
- 🔐 **Combined Auth System** - Login/Signup on single page with toggle
- 📊 **Enhanced Dashboard** - 6-tab navigation with comprehensive features
- 💰 **Earnings Tracking** - Real-time commission tracking and payout management
- 👥 **Referral Management** - Advanced table with search, filter, and export
- 📈 **Analytics** - Performance metrics, country data, traffic sources
- ⚙️ **Settings** - Profile, payment, and notification preferences
- 📱 **Responsive Design** - Works perfectly on all devices

## Demo User Login

### Access the Affiliate System:
1. **Landing Page**: http://localhost:3002/affiliate
2. **Auth Page**: http://localhost:3002/affiliate/auth
3. **Dashboard**: http://localhost:3002/affiliate/dashboard (requires login)

### Demo Login Credentials:
- **Email**: `affiliate@quatex.com`
- **Password**: `affiliate123`

**OR**

Use the demo signup feature to create a test account with any email/password.

## Dashboard Features

### 📊 Overview Tab
- **Quick Actions**: Copy referral link, export data, request payout
- **Performance Stats**: Clicks, conversions, earnings
- **Real-time Data**: Live statistics and trends

### 👥 Referrals Tab
- **Advanced Table**: Search, filter by status, user avatars
- **Detailed Info**: Country, tier, last activity, earnings
- **Export Feature**: Download referral data as CSV
- **Summary Stats**: Total, active, pending referrals

### 💰 Earnings Tab
- **Earnings Summary**: Available balance, pending payments, total paid
- **Transaction History**: Detailed earnings with transaction IDs
- **Status Tracking**: Paid, pending, processing statuses
- **Export Options**: Download earnings data

### 🎯 Marketing Tools Tab
- **Promotional Materials**: Banner ads, email templates, social assets
- **Commission Structure**: Tier-based commission rates (30%-60%)
- **Download Tracking**: Material download statistics

### 📈 Analytics Tab
- **Performance Charts**: Earnings trends, referral growth
- **Geographic Data**: Top countries with percentages
- **Traffic Sources**: Social media, email, direct traffic
- **Conversion Funnel**: Click-to-deposit conversion tracking

### ⚙️ Settings Tab
- **Profile Management**: Update personal information
- **Payment Settings**: Method, minimum payout, frequency
- **Notifications**: Email preferences for various events

## Enhanced Features

### 🔍 Search & Filter
- Real-time search across referrals
- Filter by status (Active, Pending, All)
- Export filtered results

### 📊 Professional UI
- **Stat Cards**: Color-coded with trend indicators
- **User Avatars**: Auto-generated profile images
- **Status Badges**: Visual status indicators
- **Responsive Tables**: Mobile-friendly data display

### 💡 Interactive Elements
- **Copy to Clipboard**: Referral link copying
- **Refresh Data**: Real-time data updates
- **Export Functions**: CSV download capabilities
- **Action Buttons**: View, edit, delete operations

## Technical Implementation

### Frontend (Next.js 14)
- **React Hooks**: useState, useEffect for state management
- **FontAwesome Icons**: Professional icon system
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach

### Backend API Routes
- **Authentication**: JWT-based login system
- **Dashboard Data**: Mock data for demo purposes
- **Error Handling**: Comprehensive error management

### Mock Data Includes:
- 156 total referrals with 89 active
- $15,420.50 total earnings
- Performance analytics and country data
- Marketing materials and commission tiers

## File Structure
```
app/affiliate/
├── page.jsx                 # Landing page
├── auth/
│   └── page.jsx            # Login/Signup page
├── dashboard/
│   └── page.jsx            # Main dashboard
└── components/
    └── AffiliateComponents.jsx  # Reusable components

app/api/affiliate/
├── login/route.js          # Auth endpoint
├── register/route.js       # Registration endpoint
└── dashboard/route.js      # Dashboard data endpoint
```

## Getting Started

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Visit the affiliate landing page**:
   ```
   http://localhost:3002/affiliate
   ```

3. **Login with demo credentials**:
   - Email: affiliate@quatex.com
   - Password: affiliate123

4. **Explore all dashboard features**:
   - Overview with quick actions
   - Referral management
   - Earnings tracking
   - Marketing tools
   - Analytics dashboard
   - Account settings

## Key Highlights

✅ **Complete Affiliate System** - From landing page to advanced dashboard
✅ **Professional Design** - Modern UI with excellent UX
✅ **Enhanced Functionality** - Search, filter, export, analytics
✅ **Demo Ready** - Pre-loaded with realistic data
✅ **Mobile Responsive** - Works on all devices
✅ **Easy Navigation** - 6-tab structure for organized access

The affiliate system is now ready for use with full functionality and professional appearance!
