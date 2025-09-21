import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import WardrobeScreen from '../screens/WardrobeScreen';
import SuggestionsScreen from '../screens/SuggestionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddItemScreen from '../screens/AddItemScreen';
import ItemDetailsScreen from '../screens/ItemDetailsScreen';
import OutfitDetailsScreen from '../screens/OutfitDetailsScreen';
import VirtualTryOnScreen from '../screens/VirtualTryOnScreen';
import AvatarCreationScreen from '../screens/AvatarCreationScreen';
import SimpleAvatarCreationScreen from '../screens/SimpleAvatarCreationScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import SocialSharingScreen from '../screens/SocialSharingScreen';
import SharedItemsScreen from '../screens/SharedItemsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import AvatarSelectionScreen from '../screens/AvatarSelectionScreen';

// Import auth screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

import { RootStackParamList } from '../types';
import { useTheme } from '../hooks/useTheme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  const { colors, typography, spacing } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Wardrobe') {
            iconName = focused ? 'shirt' : 'shirt-outline';
          } else if (route.name === 'Suggestions') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false, // Hide header for all tab screens
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'LookSee',
        }}
      />
      <Tab.Screen 
        name="Wardrobe" 
        component={WardrobeScreen}
        options={{ title: 'Wardrobe' }}
      />
      <Tab.Screen 
        name="Suggestions" 
        component={SuggestionsScreen}
        options={{ title: 'AI Suggestions' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, typography, spacing } = useTheme();
  
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false, // Hide header for all stack screens
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AvatarSelection" 
        component={AvatarSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Home" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddItem" 
        component={AddItemScreen}
        options={{ 
          title: 'Add New Item',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ItemDetails" 
        component={ItemDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="OutfitDetails" 
        component={OutfitDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="VirtualTryOn" 
        component={VirtualTryOnScreen}
        options={{ 
          title: 'Virtual Try-On',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="AvatarCreation" 
        component={AvatarCreationScreen}
        options={{ 
          title: 'Create Avatar',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="SimpleAvatarCreation" 
        component={SimpleAvatarCreationScreen}
        options={{ 
          title: 'Create Simple Avatar',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{ 
          title: 'Subscription Plans',
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="SocialSharing" 
        component={SocialSharingScreen}
        options={{ 
          title: 'Social Sharing',
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="SharedItems" 
        component={SharedItemsScreen}
        options={{ 
          title: 'Shared Items',
          presentation: 'card',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}