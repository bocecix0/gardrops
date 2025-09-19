import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export function useAuthPrompt() {
  const { currentUser } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [showingAuthPrompt, setShowingAuthPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [actionName, setActionName] = useState('');

  /**
   * Check if user is authenticated and show prompt if not
   * @param actionName - Name of the action that requires authentication
   * @param onAuthenticated - Callback to execute when user is authenticated
   * @returns boolean - Whether user is authenticated
   */
  const requireAuth = (
    actionName: string, 
    onAuthenticated: () => void
  ): boolean => {
    if (showingAuthPrompt) return false;

    if (currentUser) {
      // User is authenticated, proceed with the action
      onAuthenticated();
      return true;
    } else {
      // User is not authenticated, show prompt
      setActionName(actionName);
      setPendingAction(() => onAuthenticated);
      setShowingAuthPrompt(true);
      return false;
    }
  };

  const handleSignIn = () => {
    setShowingAuthPrompt(false);
    // Navigate to login screen
    navigation.navigate('Login');
  };

  const handleSignUp = () => {
    setShowingAuthPrompt(false);
    // Navigate to signup screen
    navigation.navigate('Signup');
  };

  const handleClose = () => {
    setShowingAuthPrompt(false);
    setPendingAction(null);
    setActionName('');
  };

  return { 
    requireAuth, 
    isAuthenticated: !!currentUser,
    showingAuthPrompt,
    pendingAction,
    actionName,
    handleSignIn,
    handleSignUp,
    handleClose
  };
}