import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getGroups, createGroup, joinGroup, deleteAccount } from '@/lib/database';
import { getCurrentUser } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import type { Group, User } from '@/types';

const GROUP_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80',
];

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0]);
  const [joinCode, setJoinCode] = useState('');
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user: authUser, logout } = useAuth();

  useEffect(() => {
    loadData();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.replace('/auth/login');
        return;
      }

      setUser(currentUser);
      const userGroups = await getGroups(currentUser.id);
      setGroups(userGroups);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return;

    try {
      const newGroup = await createGroup({
        name: newGroupName.trim(),
        color: selectedColor,
        created_by: user.id,
      });
      setGroups([...groups, newGroup]);
      setCreateModalVisible(false);
      setNewGroupName('');
      router.push(`/group/${newGroup.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create group');
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim() || !user) return;

    try {
      const group = await joinGroup(joinCode.trim().toUpperCase(), user.id);
      await loadData();
      setJoinModalVisible(false);
      setJoinCode('');
      router.push(`/group/${group.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join group');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.icon + '20' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Groups</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.tint + '20' }]}
            onPress={() => setJoinModalVisible(true)}>
            <IconSymbol name="plus.circle" size={24} color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.tint + '20' }]}
            onPress={() => setCreateModalVisible(true)}>
            <IconSymbol name="plus" size={24} color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.tint + '20' }]}
            onPress={() => setProfileModalVisible(true)}>
            <IconSymbol name="person.circle" size={24} color={colors.tint} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.groupCard, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff' }]}
            onPress={() => router.push(`/group/${item.id}`)}
            onLongPress={() => router.push(`/(tabs)/photos?groupId=${item.id}`)}>
            <View style={[styles.groupIcon, { backgroundColor: item.color + '20' }]}>
              <Text style={[styles.groupIconText, { color: item.color }]}>
                {item.icon || item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={[styles.groupName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.groupMembers, { color: colors.icon }]}>
                {item.members?.length || 0} members
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.icon} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="person.3" size={64} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              No groups yet. Create or join one to get started!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Create Group Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Group</Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>Group Name</Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', 
                  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: colorScheme === 'dark' ? '#444' : '#ddd', 
                  borderWidth: 1 
                }]}
                placeholder="Enter group name"
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                value={newGroupName}
                onChangeText={setNewGroupName}
                selectionColor={colorScheme === 'dark' ? '#0a7ea4' : '#0a7ea4'}
                autoCorrect={false}
              />
            </View>

            <Text style={[styles.modalLabel, { color: colors.text }]}>Color</Text>
            <View style={styles.colorGrid}>
              {GROUP_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.icon + '20' }]}
                onPress={() => setCreateModalVisible(false)}>
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colorScheme === 'dark' ? '#ffffff' : '#f0f0f0' }]}
                onPress={handleCreateGroup}>
                <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Group Modal */}
      <Modal
        visible={joinModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setJoinModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Join Group</Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>Join Code</Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', 
                  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: colorScheme === 'dark' ? '#444' : '#ddd', 
                  borderWidth: 1 
                }]}
                placeholder="Enter join code"
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
                selectionColor={colorScheme === 'dark' ? '#0a7ea4' : '#0a7ea4'}
                autoCorrect={false}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.icon + '20' }]}
                onPress={() => setJoinModalVisible(false)}>
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colorScheme === 'dark' ? '#ffffff' : '#f0f0f0' }]}
                onPress={handleJoinGroup}>
                <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProfileModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Profile</Text>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {authUser && (
              <View style={styles.profileInfo}>
                <View style={[styles.userAvatar, { backgroundColor: colors.tint + '20' }]}>
                  <Text style={[styles.userAvatarText, { color: colors.tint }]}>
                    {authUser.email.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.userName, { color: colors.text }]}>{authUser.email}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: '#FF6B6B' }]}
              onPress={async () => {
                await logout();
                setProfileModalVisible(false);
                router.replace('/auth/login');
              }}>
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteAccountButton, { backgroundColor: '#8B0000', marginTop: 12 }]}
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'Are you sure you want to permanently delete your account? This action cannot be undone and will delete all your data including groups, lists, photos, and comments.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        // Second confirmation
                        Alert.alert(
                          'Final Confirmation',
                          'This will permanently delete your account and all your data. Type DELETE to confirm.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete Account',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  setProfileModalVisible(false);
                                  await deleteAccount();
                                  Alert.alert(
                                    'Account Deleted',
                                    'Your account has been successfully deleted.',
                                    [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
                                  );
                                } catch (error: any) {
                                  Alert.alert(
                                    'Error',
                                    error.message || 'Failed to delete account. Please try again or contact support.'
                                  );
                                }
                              },
                            },
                          ]
                        );
                      },
                    },
                  ]
                );
              }}>
              <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.icon + '20', marginTop: 12 }]}
              onPress={() => setProfileModalVisible(false)}>
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupIconText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  modalInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 0,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#000',
    transform: [{ scale: 1.1 }],
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  logoutButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAccountButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  deleteAccountButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

