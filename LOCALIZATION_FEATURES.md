# Localization and Splash Screen Features

## Overview
This document describes the localization and splash screen features implemented in the LookSee app.

## Features Implemented

### 1. Localization System
- **Automatic Language Detection**: The app automatically detects the user's preferred language based on their device locale/region
- **Manual Language Selection**: Users can manually change their preferred language through the language selector
- **Multi-language Support**: Support for 5 languages:
  - English
  - Turkish
  - Spanish
  - French
  - German
- **Persistent Language Preference**: User's language preference is saved and persists between app sessions

### 2. Splash Screen
- **LookSee Logo**: Displays the LookSee logo during app initialization
- **Loading Animation**: Shows a progress bar indicating app loading status
- **Professional Appearance**: Clean, modern design that matches the app's branding

### 3. Updated Screens
All authentication screens have been updated to use the localization system:
- WelcomeScreen
- LoginScreen
- SignupScreen
- ForgotPasswordScreen
- ProfileScreen

## Technical Implementation

### Localization Context
The localization system is implemented using React Context API with the following key components:

1. **LocalizationContext**: Provides language state and translation functions
2. **useLocalization Hook**: Allows components to access the current language and translations
3. **Translation Files**: Comprehensive translation files for all supported languages
4. **Automatic Detection**: Uses `expo-localization` and `react-native-localize` to detect device language

### Language Detection Logic
1. First checks for saved user preference in AsyncStorage
2. If no preference found, detects from device locale using `RNLocalize.getLocales()`
3. Maps device language to supported languages
4. Overrides with region if needed (e.g., Turkey region defaults to Turkish)
5. Defaults to English if detection fails

### Language Selector Component
A reusable LanguageSelector component allows users to:
- View all available languages
- Select their preferred language
- See current selection highlighted

## File Structure
```
src/
├── contexts/
│   └── LocalizationContext.tsx
├── components/
│   ├── SplashScreen.tsx
│   └── LanguageSelector.tsx
├── screens/
│   ├── WelcomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── SignupScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   └── ProfileScreen.tsx
└── App.tsx
```

## Usage

### Using Translations in Components
```typescript
import { useLocalization } from '../contexts/LocalizationContext';

export default function MyComponent() {
  const { t } = useLocalization();
  
  return (
    <Text>{t('welcome')}</Text>
  );
}
```

### Changing Language
```typescript
import { useLocalization } from '../contexts/LocalizationContext';

export default function LanguageChanger() {
  const { setLanguage } = useLocalization();
  
  const changeToTurkish = () => {
    setLanguage('tr');
  };
}
```

## Supported Translation Keys
The system includes translations for all UI elements in the authentication flow:
- Welcome screen messages
- Login form labels and buttons
- Signup form labels and buttons
- Password reset form labels and buttons
- Error messages
- Success messages
- Feature descriptions

## Future Enhancements
- Add more languages based on user demand
- Implement RTL (right-to-left) language support
- Add language-specific date/time formatting
- Include language-specific number formatting