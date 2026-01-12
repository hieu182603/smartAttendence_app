# SmartAttendance - React Native App

Ứng dụng quản lý chấm công nhân viên được chuyển đổi từ React Web sang React Native với Expo.

## 🚀 Setup & Installation

### Prerequisites
- Node.js (version 18+)
- npm hoặc yarn
- Expo CLI: `npm install -g @expo/cli`

### Installation
```bash
npm install
```

### Run App
```bash
# Development server
npm start

# Platform specific
npm run android    # Android
npm run ios        # iOS
npm run web        # Web browser
```

## 📱 Features

### 🔐 Authentication
- Login với 3 roles: Employee, Manager, Admin
- Persistent authentication với AsyncStorage
- Auto logout

### 👤 Employee Features
- **Dashboard** với thời gian thực
- Check-in/Check-out status
- Schedule viewing
- Request submission
- Notifications

### 👔 Manager Features
- Team management
- Request approvals
- Schedule management
- Dashboard analytics

### ⚙️ Admin Features
- User management
- System settings
- Audit logs
- Reports & analytics

## 🏗️ Project Structure

```
smartattendance/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BottomNav.tsx    # Custom bottom tab bar với floating button
│   │   ├── Sidebar.tsx      # Custom drawer với branding
│   │   ├── Icon.tsx         # Icon system
│   │   └── Layout.tsx       # Layout wrapper
│   ├── screens/             # App screens by role
│   │   ├── SplashScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   ├── employee/        # Employee screens
│   │   ├── manager/         # Manager screens
│   │   └── admin/           # Admin screens
│   ├── navigation/          # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── utils/               # Utilities & styles
│   │   └── styles.ts
│   └── types/               # TypeScript types
│       └── index.ts
├── App.tsx                  # Main app với Auth Context
├── app.json                 # Expo configuration
├── babel.config.js          # Babel config
└── metro.config.js          # Metro bundler config
```

## 🎨 Design System

### Colors
- **Primary**: `#4245f0`
- **Background Dark**: `#101122`
- **Surface Dark**: `#1e1f3a`
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#9293c9`

### Components
- **BottomNav**: Custom tab bar với floating button giữa (Requests)
- **Sidebar**: Custom drawer với SmartAtt branding
- **Layout**: SafeAreaView wrapper
- **Icon**: Vector icons system

## 📋 Navigation

### Employee (Bottom Tabs)
- Home
- Schedule
- Requests (floating button)
- Notifications
- Profile

### Manager/Admin (Drawer)
- Dashboard
- Team/Users
- Approvals/Reports
- Schedule/Settings
- Profile

## 🔧 Configuration

### app.json
- Dark theme UI
- Hermes engine enabled
- Web support configured

### Dependencies
- React Navigation v7
- Expo SDK 54
- React Native Reanimated
- AsyncStorage
- Linear Gradient

## ✅ Status

- ✅ Project structure setup
- ✅ All components created
- ✅ Navigation system implemented
- ✅ All screens created
- ✅ TypeScript configured
- ✅ No linter errors
- ✅ Ready for development

## 🚀 Next Steps

1. API integration
2. Real-time features
3. Push notifications
4. Offline support
5. Testing & optimization

## 📄 License

MIT License

