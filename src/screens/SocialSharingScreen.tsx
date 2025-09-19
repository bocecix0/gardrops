import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { socialSharingService } from '../services/socialSharingService';
import { useWardrobe } from '../hooks/useWardrobe';
import { ClothingItem } from '../types';
import { SharedClothingItem } from '../types/social';

export default function SocialSharingScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { state } = useWardrobe();
  
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sharedItems, setSharedItems] = useState<SharedClothingItem[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    try {
      setLoading(true);
      
      // Load pending share requests
      const requests = await socialSharingService.getPendingShareRequests('current_user_id');
      setPendingRequests(requests);
      
      // Load shared items
      const items = await socialSharingService.getSharedItems('current_user_id');
      setSharedItems(items);
      
      // Load connections
      const conns = await socialSharingService.getConnections();
      setConnections(conns);
    } catch (error) {
      console.error('Error loading social data:', error);
      Alert.alert('Error', 'Failed to load social data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const sharedItem = await socialSharingService.acceptSharedItem(
        requestId,
        { id: 'current_user_id', name: 'Current User' }
      );
      
      if (sharedItem) {
        Alert.alert('Success', 'Item accepted and added to your wardrobe!');
        // Refresh data
        loadSocialData();
      } else {
        Alert.alert('Error', 'Failed to accept the item');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept the item');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const success = await socialSharingService.declineSharedItem(
        requestId,
        { id: 'current_user_id', name: 'Current User' }
      );
      
      if (success) {
        Alert.alert('Success', 'Item declined');
        // Refresh data
        loadSocialData();
      } else {
        Alert.alert('Error', 'Failed to decline the item');
      }
    } catch (error) {
      console.error('Error declining request:', error);
      Alert.alert('Error', 'Failed to decline the item');
    }
  };

  const renderPendingRequest = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{item.fromUserName}</Text>
        <Text style={styles.requestDate}>
          {new Date(item.sharedDate).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.requestMessage} numberOfLines={2}>
        {item.message || `Shared a clothing item with you`}
      </Text>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDeclineRequest(item.itemId)}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.itemId)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSharedItem = ({ item }: { item: SharedClothingItem }) => (
    <View style={styles.itemCard}>
      <TouchableOpacity style={styles.itemImageContainer}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="shirt-outline" size={24} color="#9ca3af" />
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.sharedFromText}>
          Shared by {item.sharedFromUserName}
        </Text>
        <Text style={styles.sharedDateText}>
          {new Date(item.sharedDate).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderConnection = ({ item }: { item: any }) => (
    <View style={styles.connectionCard}>
      <View style={styles.connectionHeader}>
        <Text style={styles.connectionName}>{item.userName}</Text>
        <View style={[
          styles.connectionStatus,
          item.connectionStatus === 'accepted' ? styles.statusAccepted : styles.statusPending
        ]}>
          <Text style={[
            styles.statusText,
            item.connectionStatus === 'accepted' ? styles.statusAcceptedText : styles.statusPendingText
          ]}>
            {item.connectionStatus}
          </Text>
        </View>
      </View>
      <Text style={styles.connectionDate}>
        Connected on {new Date(item.connectedDate).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading social data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Pending Requests Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              <Text style={styles.sectionCount}>{pendingRequests.length}</Text>
            </View>
            {pendingRequests.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="mail-unread-outline" size={32} color="#d1d5db" />
                <Text style={styles.emptyText}>No pending requests</Text>
              </View>
            ) : (
              <FlatList
                data={pendingRequests}
                renderItem={renderPendingRequest}
                keyExtractor={(item) => item.itemId}
                scrollEnabled={false}
              />
            )}
          </View>

          {/* Shared Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shared With You</Text>
              <Text style={styles.sectionCount}>{sharedItems.length}</Text>
            </View>
            {sharedItems.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="gift-outline" size={32} color="#d1d5db" />
                <Text style={styles.emptyText}>No shared items yet</Text>
              </View>
            ) : (
              <FlatList
                data={sharedItems}
                renderItem={renderSharedItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sharedItemsList}
              />
            )}
          </View>

          {/* Connections Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Connections</Text>
              <Text style={styles.sectionCount}>{connections.length}</Text>
            </View>
            {connections.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="people-outline" size={32} color="#d1d5db" />
                <Text style={styles.emptyText}>No connections yet</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>Add Friends</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={connections}
                renderItem={renderConnection}
                keyExtractor={(item) => item.userId}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionCount: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  addButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  
  // Request Card Styles
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  requestDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  requestMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  declineButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#2563EB',
  },
  acceptButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  
  // Shared Item Styles
  sharedItemsList: {
    paddingVertical: 8,
  },
  itemCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemImageContainer: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 100,
  },
  placeholderImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sharedFromText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  sharedDateText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  
  // Connection Styles
  connectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAccepted: {
    backgroundColor: '#ECFDF5',
  },
  statusPending: {
    backgroundColor: '#FFFBEB',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusAcceptedText: {
    color: '#059669',
  },
  statusPendingText: {
    color: '#D97706',
  },
  connectionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
});