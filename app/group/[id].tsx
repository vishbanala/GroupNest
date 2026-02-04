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
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getLists, createList, deleteList, getCategories, createCategory, deleteCategory, getGroups } from '@/lib/database';
import { getCurrentUser } from '@/lib/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { List, Category, Group } from '@/types';

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: '🍔' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Shows/Movies', icon: '🎬' },
  { name: 'Activities', icon: '🎯' },
  { name: 'Goals', icon: '🎯' },
];

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lists, setLists] = useState<List[]>([]);
  const [allLists, setAllLists] = useState<List[]>([]); // Store all lists for counting
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [joinCodeModalVisible, setJoinCodeModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createListModal, setCreateListModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      const [allListsData, categoriesData, groupsData] = await Promise.all([
        getLists(id), // Always load all lists for counting
        getCategories(id),
        getGroups(currentUser.id), // Get groups to find this one
      ]);
      setAllLists(allListsData);
      setCategories(categoriesData);
      
      // Find the current group
      const currentGroup = groupsData.find((g) => g.id === id);
      if (currentGroup) {
        setGroup(currentGroup);
      }
      
      // Filter lists based on selected category
      const filteredLists = selectedCategory
        ? allListsData.filter((list) => list.category_id === selectedCategory)
        : allListsData;
      setLists(filteredLists);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleCreateList = async () => {
    if (!newListTitle.trim() || !id) return;

    try {
      const user = await getCurrentUser();
      if (!user) return;

      const newList = await createList({
        group_id: id,
        category_id: selectedCategoryId,
        title: newListTitle.trim(),
        description: newListDescription.trim() || undefined,
        created_by: user.id,
      });
      // Reload data to ensure counts are updated
      await loadData();
      setCreateListModal(false);
      setNewListTitle('');
      setNewListDescription('');
      setSelectedCategoryId(undefined);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create list');
    }
  };

  const handleDeleteList = async (listId: string, listTitle: string) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${listTitle}"? This will also delete all items in this list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteList(listId);
              // Update state immediately for instant feedback
              const updatedAllLists = allLists.filter((list) => list.id !== listId);
              setAllLists(updatedAllLists);
              const updatedLists = lists.filter((list) => list.id !== listId);
              setLists(updatedLists);
              // Reload to ensure everything is in sync with database
              loadData().catch(() => {
                // Silently reload in background
              });
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete list');
              // Reload on error to ensure state is correct
              await loadData();
            }
          },
        },
      ]
    );
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    // Check if category has any lists
    const listsInCategory = allLists.filter((list) => list.category_id === categoryId);
    
    if (listsInCategory.length > 0) {
      Alert.alert(
        'Cannot Delete Category',
        `This category has ${listsInCategory.length} list(s). Please move or delete the lists first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(categoryId);
              await loadData();
              // If deleted category was selected, reset to "All"
              if (selectedCategory === categoryId) {
                setSelectedCategory(null);
              }
              Alert.alert('Success', 'Category deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  // filteredLists is now handled in loadData

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.icon + '20' }]}>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/groups')}
          style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Lists</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setJoinCodeModalVisible(true)}
            style={styles.headerIconButton}>
            <IconSymbol name="person.2" size={24} color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/photos?groupId=${id}`)}
            style={styles.headerIconButton}>
            <IconSymbol name="photo" size={24} color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCreateListModal(true)}>
            <IconSymbol name="plus" size={24} color={colors.tint} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.categoriesContainer, { borderBottomColor: colors.icon + '20' }]}
          contentContainerStyle={styles.categoriesContent}>
          {categories.map((category) => (
          <View key={category.id} style={styles.categoryChipContainer}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === category.id && { backgroundColor: colors.tint },
                { borderColor: colors.icon + '40' },
              ]}
              onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}>
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && { color: '#fff' },
                  { color: colors.text },
                ]}>
                {category.icon} {category.name} ({allLists.filter((list) => list.category_id === category.id).length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteCategoryButton}
              onPress={() => handleDeleteCategory(category.id, category.name)}>
              <IconSymbol name="xmark.circle.fill" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        ))}
        </ScrollView>
      )}

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.listCard, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff' }]}
            onPress={() => router.push(`/list/${item.id}`)}>
            <View style={styles.listCardHeader}>
              <Text style={[styles.listTitle, { color: colors.text }]}>{item.title}</Text>
              <View style={styles.listCardHeaderRight}>
                {item.category && (
                  <View style={[styles.categoryBadge, { backgroundColor: colors.tint + '20' }]}>
                    <Text style={[styles.categoryBadgeText, { color: colors.tint }]}>
                      {item.category.name}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.deleteListButton}
                  onPress={() => handleDeleteList(item.id, item.title)}>
                  <IconSymbol name="trash" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
            {item.description && (
              <Text style={[styles.listDescription, { color: colors.icon }]} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View style={styles.listCardFooter}>
              <Text style={[styles.listItemCount, { color: colors.icon }]}>
                {item.items?.length || 0} items
              </Text>
              <IconSymbol name="chevron.right" size={16} color={colors.icon} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="list.bullet" size={64} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              No lists yet. Create one to get started!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Create List Modal */}
      <Modal
        visible={createListModal}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateListModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create List</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>List Title</Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', 
                  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: colorScheme === 'dark' ? '#444' : '#ddd', 
                  borderWidth: 1 
                }]}
                placeholder="Enter list title"
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                value={newListTitle}
                onChangeText={setNewListTitle}
                selectionColor={colorScheme === 'dark' ? '#0a7ea4' : '#0a7ea4'}
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>Description (optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea, { 
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', 
                  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: colorScheme === 'dark' ? '#444' : '#ddd', 
                  borderWidth: 1 
                }]}
                placeholder="Enter description"
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                value={newListDescription}
                onChangeText={setNewListDescription}
                multiline
                numberOfLines={3}
                selectionColor={colorScheme === 'dark' ? '#0a7ea4' : '#0a7ea4'}
                autoCorrect={false}
              />
            </View>

            <Text style={[styles.modalLabel, { color: colors.text }]}>Category (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelect}>
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  !selectedCategoryId && { backgroundColor: colors.tint },
                  { borderColor: colors.icon + '40' },
                ]}
                onPress={() => setSelectedCategoryId(undefined)}>
                <Text style={[styles.categoryOptionText, !selectedCategoryId && { color: '#fff' }, { color: colors.text }]}>
                  None
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    selectedCategoryId === cat.id && { backgroundColor: colors.tint },
                    { borderColor: colors.icon + '40' },
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}>
                  <Text style={[styles.categoryOptionText, selectedCategoryId === cat.id && { color: '#fff' }, { color: colors.text }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.icon + '20' }]}
                onPress={() => setCreateListModal(false)}>
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colorScheme === 'dark' ? '#ffffff' : '#f0f0f0' }]}
                onPress={handleCreateList}>
                <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Code Modal */}
      <Modal
        visible={joinCodeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setJoinCodeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Invite to Group</Text>
              <TouchableOpacity onPress={() => setJoinCodeModalVisible(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {group && (
              <>
                <Text style={[styles.modalLabel, { color: colors.text, marginTop: 0 }]}>
                  Share this code with friends to invite them to "{group.name}"
                </Text>
                
                <TouchableOpacity
                  style={[styles.joinCodeContainer, { 
                    backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                    borderColor: colorScheme === 'dark' ? '#444' : '#ddd',
                    borderWidth: 1
                  }]}
                  onLongPress={() => {
                    Alert.alert('Join Code', group.join_code, [
                      { text: 'OK' }
                    ]);
                  }}>
                  <Text style={[styles.joinCodeText, { color: colors.text }]} selectable>
                    {group.join_code}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.modalLabel, { color: colors.icon, fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 16 }]}>
                  Tap and hold the code above to copy, or use Share below
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colorScheme === 'dark' ? '#ffffff' : '#f0f0f0', flex: 1 }]}
                    onPress={async () => {
                      try {
                        await Share.share({
                          message: `Join my group "${group.name}" on GroupNest! Use code: ${group.join_code}`,
                          title: `Join ${group.name}`,
                        });
                      } catch (error: any) {
                        if (error.message !== 'User did not share') {
                          Alert.alert('Error', error.message || 'Failed to share');
                        }
                      }
                    }}>
                    <IconSymbol name="square.and.arrow.up" size={20} color="#000000" />
                    <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>Share Code</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Join Code Modal */}
      <Modal
        visible={joinCodeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setJoinCodeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Invite to Group</Text>
              <TouchableOpacity onPress={() => setJoinCodeModalVisible(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {group && (
              <>
                <Text style={[styles.modalLabel, { color: colors.text, marginTop: 0 }]}>
                  Share this code with friends to invite them to "{group.name}"
                </Text>
                
                <TouchableOpacity
                  style={[styles.joinCodeContainer, { 
                    backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                    borderColor: colorScheme === 'dark' ? '#444' : '#ddd',
                    borderWidth: 1
                  }]}
                  onLongPress={() => {
                    Alert.alert('Join Code', group.join_code, [
                      { text: 'OK' }
                    ]);
                  }}>
                  <Text style={[styles.joinCodeText, { color: colors.text }]} selectable>
                    {group.join_code}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.modalLabel, { color: colors.icon, fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 16 }]}>
                  Tap and hold the code above to copy, or use Share below
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colorScheme === 'dark' ? '#ffffff' : '#f0f0f0', flex: 1 }]}
                    onPress={async () => {
                      try {
                        await Share.share({
                          message: `Join my group "${group.name}" on GroupNest! Use code: ${group.join_code}`,
                          title: `Join ${group.name}`,
                        });
                      } catch (error: any) {
                        if (error.message !== 'User did not share') {
                          Alert.alert('Error', error.message || 'Failed to share');
                        }
                      }
                    }}>
                    <IconSymbol name="square.and.arrow.up" size={20} color="#000000" />
                    <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>Share Code</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIconButton: {
    padding: 4,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteListButton: {
    padding: 4,
  },
  categoryChipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  deleteCategoryButton: {
    marginLeft: 4,
    padding: 2,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemCount: {
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalTextArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  inputContainer: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  categorySelect: {
    marginBottom: 20,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  joinCodeContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  joinCodeText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    gap: 8,
  },
});

