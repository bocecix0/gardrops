import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type OutfitDetailsScreenRouteProp = RouteProp<RootStackParamList, 'OutfitDetails'>;

export default function OutfitDetailsScreen() {
  const route = useRoute<OutfitDetailsScreenRouteProp>();
  const { outfitId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Outfit Details</Text>
        <Text style={styles.subtitle}>Outfit ID: {outfitId}</Text>
        <Text style={styles.description}>
          This screen will show detailed information about a specific outfit,
          including all clothing items, styling notes, occasion suggestions,
          and the ability to save or share the outfit.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#2563EB',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
});