# React Native Todo App

A modern, feature-rich todo application built with React Native and Expo.

## Features

- ✅ Create, read, update, and delete tasks
- 📱 Clean and responsive UI
- 🎨 Light/Dark theme support
- 🔍 Search functionality
- 📂 Category-based organization (General, Work, Personal)
- ⭐ Priority levels (Low, Medium, High)
- 📋 Task completion tracking
- 🔄 Swipe gestures for category navigation
- 💫 Smooth animations and transitions
- 📱 Haptic feedback

## Tech Stack

- React Native
- Expo
- TypeScript
- React Native Paper
- React Native Animatable
- Expo Vector Icons
- Expo Haptics

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd CrudReactNativeExpo
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npx expo start
```

4. Run on your device or simulator

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Project Structure

```
todo-app-frontend/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # Main todo list screen
│   │   └── _layout.tsx    # Tab navigation layout
│   ├── components/        # Reusable components
│   ├── config/           # API configuration
│   ├── constants/        # Theme and constant values
│   └── hooks/           # Custom hooks
└── assets/             # Images and fonts
```

## Features in Detail

### Task Management

- Add new tasks with title, category, and priority
- Edit existing tasks
- Mark tasks as complete/incomplete
- Delete tasks
- Expandable completed tasks section

### Categories

- Filter tasks by category (All, General, Work, Personal)
- Swipe gesture navigation between categories
- Visual indicators for current category

### UI/UX

- Smooth animations for task actions
- Haptic feedback for interactions
- Responsive chip designs
- Search functionality
- Pull-to-refresh
- Modern modal interfaces

### Theme Support

- Automatic light/dark theme detection
- Theme-aware components and styles
- Consistent color scheme

## API Integration

The app connects to a backend API for data persistence. API calls are centralized in the `config/api.ts` file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
