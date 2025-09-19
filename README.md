# LookSee - AI-Powered Wardrobe Assistant

LookSee is a React Native app built with Expo and TypeScript that provides AI-powered outfit suggestions for your wardrobe. Using ChatGPT API, the app analyzes your clothing items and creates personalized outfit recommendations based on occasions, weather, and your personal style preferences.

## Features

- 🤖 **AI-Powered Suggestions**: Get intelligent outfit recommendations using ChatGPT
- 👔 **Digital Wardrobe**: Organize and manage your clothing items
- 🎯 **Occasion-Based Styling**: Get suggestions for work, casual, formal, and more
- 📱 **Beautiful UI**: Modern, user-friendly interface built with React Native
- 🎨 **Style Preferences**: Set your personal style, colors, and brand preferences
- 📸 **Photo Integration**: Add photos of your clothing items
- 🌟 **Smart Categories**: Organize items by type, season, and occasion

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **AI Service**: OpenAI ChatGPT API
- **UI Components**: Custom components with modern styling
- **State Management**: React Hooks (Context API can be added later)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your phone (for testing)
- OpenAI API key

## Installation & Setup

1. **Clone or navigate to the project directory**:
   ```bash
   cd LookSee
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy the `.env` file and add your OpenAI API key:
   ```env
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   EXPO_PUBLIC_OPENAI_API_URL=https://api.openai.com/v1
   EXPO_PUBLIC_APP_NAME=LookSee
   EXPO_PUBLIC_APP_VERSION=1.0.0
   EXPO_PUBLIC_AI_MODEL=gpt-4o-mini
   EXPO_PUBLIC_MAX_TOKENS=1000
   EXPO_PUBLIC_TEMPERATURE=0.7
   EXPO_PUBLIC_ENV=development
   ```

4. **Start the development server**:
   ```bash
   npm start
   # or
   npx expo start
   ```

5. **Run on your device**:
   - Install Expo Go from App Store (iOS) or Google Play (Android)
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)

## Getting Your OpenAI API Key

1. Go to [OpenAI's website](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

**Note**: Keep your API key secure and never commit it to version control.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # App screens
│   ├── HomeScreen.tsx
│   ├── WardrobeScreen.tsx
│   ├── SuggestionsScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── AddItemScreen.tsx
│   ├── ItemDetailsScreen.tsx
│   └── OutfitDetailsScreen.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── services/          # API services
│   └── openai.ts     # OpenAI integration
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Utility functions
└── hooks/            # Custom React hooks
```

## Current Features

### ✅ Completed
- Basic app structure with TypeScript
- Navigation between main screens
- Home screen with quick actions
- Wardrobe screen (empty state)
- AI Suggestions screen with occasion selection
- Profile screen with settings options
- Add Item screen with photo upload and categorization
- Environment variable setup for ChatGPT API
- Modern UI design with consistent styling

### 🚧 Next Steps (Future Development)
- Storage management (AsyncStorage/SecureStore)
- Image picker integration for clothing photos
- ChatGPT API integration for outfit suggestions
- Outfit creation and management
- User preference system
- Style learning algorithms
- Weather integration
- Favorites and history

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser

## Development Commands

- `npx expo start --clear` - Start with cache cleared
- `npx expo install --fix` - Fix package version conflicts
- `npx expo doctor` - Check for common issues

## Screens Overview

1. **Home Screen**: Dashboard with quick actions and stats
2. **Wardrobe Screen**: Browse and manage clothing items
3. **Suggestions Screen**: Get AI-powered outfit recommendations
4. **Profile Screen**: User settings and preferences
5. **Add Item Screen**: Add new clothing items with photos and details
6. **Item Details**: View detailed information about items
7. **Outfit Details**: View and manage outfit combinations

## API Integration

The app uses OpenAI's ChatGPT API to:
- Analyze clothing items from photos
- Generate outfit suggestions based on occasion and preferences
- Provide styling advice and reasoning
- Suggest alternative combinations

## Contributing

This is a foundational version. Future contributions can include:
- Backend integration
- User authentication
- Cloud storage for images
- Social features
- Advanced AI features

## License

This project is for educational and personal use.

## Contact

For questions or suggestions about the LookSee app, please feel free to reach out!

---

**Ready to get started?** Make sure you have your OpenAI API key ready and run `npm start` to begin your styling journey! 🎉