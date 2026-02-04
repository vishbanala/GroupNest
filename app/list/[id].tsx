import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createComment, createListItem, deleteComment, deleteListItem, getComments, getCurrentUser, getList, getListItems, getPhotos, toggleListItem, voteItem } from '@/lib/database';
import type { Comment, List, ListItem, Photo, User } from '@/types';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<ListItem[]>([]);
  const [list, setList] = useState<List | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [addItemModal, setAddItemModal] = useState(false);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
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
      setUser(currentUser);
      const [itemsData, listData] = await Promise.all([
        getListItems(id),
        getList(id),
      ]);
      setItems(itemsData);
      
      if (listData) {
        setList(listData);
        // Load photos for this list
        if (listData.group_id) {
          const photosData = await getPhotos(listData.group_id, id);
          setPhotos(photosData);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !id || !user) return;

    try {
      const newItem = await createListItem({
        list_id: id,
        title: newItemTitle.trim(),
        description: newItemDescription.trim() || undefined,
        added_by: user.id,
      });
      setItems([newItem, ...items]);
      setAddItemModal(false);
      setNewItemTitle('');
      setNewItemDescription('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add item');
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    try {
      await toggleListItem(itemId, !completed);
      setItems(items.map((item) => (item.id === itemId ? { ...item, completed: !completed } : item)));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update item');
    }
  };

  const handleVote = async (itemId: string) => {
    if (!user) return;
    try {
      await voteItem(itemId, user.id);
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to vote');
    }
  };

  const handleOpenComments = async (item: ListItem) => {
    setSelectedItem(item);
    try {
      const commentsData = await getComments(item.id);
      setComments(commentsData);
      setCommentModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load comments');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedItem || !user) return;

    try {
      const comment = await createComment({
        item_id: selectedItem.id,
        user_id: user.id,
        content: newComment.trim(),
      });
      setComments([...comments, comment]);
      setNewComment('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(commentId);
              setComments(comments.filter((c) => c.id !== commentId));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = async (itemId: string, itemTitle: string) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${itemTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteListItem(itemId);
              // Update state immediately
              const updatedItems = items.filter((item) => item.id !== itemId);
              setItems(updatedItems);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete item');
              // Reload on error to ensure state is correct
              await loadData();
            }
          },
        },
      ]
    );
  };

  const getVoteCount = (item: ListItem) => item.votes?.length || 0;
  const hasUserVoted = (item: ListItem) => user && item.votes?.some((v) => v.user_id === user.id);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  const sortedItems = [...items].sort((a, b) => {
    const aVotes = getVoteCount(a);
    const bVotes = getVoteCount(b);
    if (aVotes !== bVotes) return bVotes - aVotes;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.icon + '20' }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {list?.title || 'List Items'}
          </Text>
          {list && (
            <View style={styles.headerStats}>
              <Text style={[styles.headerStat, { color: colors.icon }]}>
                {items.length} items
              </Text>
              {photos.length > 0 && (
                <Text style={[styles.headerStat, { color: colors.icon }]}>
                  • {photos.length} photos
                </Text>
              )}
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setAddItemModal(true)}>
          <IconSymbol name="plus" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff' }]}>
            <View style={styles.itemHeader}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleToggleItem(item.id, item.completed)}>
                <IconSymbol
                  name={item.completed ? 'checkmark.circle.fill' : 'circle'}
                  size={24}
                  color={item.completed ? colors.tint : colors.icon}
                />
              </TouchableOpacity>
              <View style={styles.itemContent}>
                <Text
                  style={[
                    styles.itemTitle,
                    { color: colors.text },
                    item.completed && styles.itemTitleCompleted,
                  ]}>
                  {item.title}
                </Text>
                {item.description && (
                  <Text style={[styles.itemDescription, { color: colors.icon }]}>
                    {item.description}
                  </Text>
                )}
                {item.tags && item.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {item.tags.map((tag, index) => (
                      <View key={index} style={[styles.tag, { backgroundColor: colors.tint + '20' }]}>
                        <Text style={[styles.tagText, { color: colors.tint }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {item.photo_url && (
                  <ExpoImage source={{ uri: item.photo_url }} style={styles.itemPhoto} />
                )}
                {item.link_url && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(item.link_url!)}
                    style={styles.linkButton}>
                    <IconSymbol name="link" size={16} color={colors.tint} />
                    <Text style={[styles.linkText, { color: colors.tint }]}>Open link</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={[styles.voteButton, hasUserVoted(item) && { backgroundColor: colors.tint + '20' }]}
                onPress={() => handleVote(item.id)}>
                <IconSymbol
                  name="arrow.up"
                  size={18}
                  color={hasUserVoted(item) ? colors.tint : colors.icon}
                />
                <Text
                  style={[
                    styles.voteCount,
                    { color: hasUserVoted(item) ? colors.tint : colors.icon },
                  ]}>
                  {getVoteCount(item)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.commentButton}
                onPress={() => handleOpenComments(item)}>
                <IconSymbol name="bubble.left" size={18} color={colors.icon} />
                <Text style={[styles.commentCount, { color: colors.icon }]}>
                  {item.comments?.length || 0}
                </Text>
              </TouchableOpacity>
              {user && item.added_by === user.id && (
                <TouchableOpacity
                  style={styles.deleteItemButton}
                  onPress={() => handleDeleteItem(item.id, item.title)}>
                  <IconSymbol name="trash" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="list.bullet" size={64} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              No items yet. Add one to get started!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Add Item Modal */}
      <Modal
        visible={addItemModal}
        animationType="slide"
        transparent
        onRequestClose={() => setAddItemModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Item</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>Item Title</Text>
              <TextInput
                style={{
                  height: 50,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  fontSize: 16,
                  marginBottom: 16,
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', 
                  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: colorScheme === 'dark' ? '#444' : '#ddd', 
                  borderWidth: 1 
                }}
                placeholder="Enter item title"
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                value={newItemTitle}
                onChangeText={setNewItemTitle}
                selectionColor={colorScheme === 'dark' ? '#0a7ea4' : '#0a7ea4'}
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>Description (optional)</Text>
              <TextInput
                style={{
                  height: 80,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingTop: 12,
                  fontSize: 16,
                  marginBottom: 16,
                  textAlignVertical: 'top',
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', 
                  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: colorScheme === 'dark' ? '#444' : '#ddd', 
                  borderWidth: 1 
                }}
                placeholder="Enter description"
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                value={newItemDescription}
                onChangeText={setNewItemDescription}
                multiline
                numberOfLines={3}
                selectionColor={colorScheme === 'dark' ? '#0a7ea4' : '#0a7ea4'}
                autoCorrect={false}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.icon + '20' }]}
                onPress={() => setAddItemModal(false)}>
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colorScheme === 'dark' ? '#ffffff' : '#f0f0f0' }]}
                onPress={handleAddItem}>
                <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={commentModal}
        animationType="slide"
        transparent
        onRequestClose={() => setCommentModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.commentsModal, { backgroundColor: colors.background }]}>
            <View style={styles.commentsHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedItem?.title}
              </Text>
              <TouchableOpacity onPress={() => setCommentModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentInfo}>
                      <Text style={[styles.commentAuthor, { color: colors.text }]}>
                        {item.user?.name || 'Unknown'}
                      </Text>
                      <Text style={[styles.commentContent, { color: colors.text }]}>{item.content}</Text>
                      <Text style={[styles.commentTime, { color: colors.icon }]}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    {user && item.user_id === user.id && (
                      <TouchableOpacity
                        style={styles.deleteCommentButton}
                        onPress={() => handleDeleteComment(item.id)}>
                        <IconSymbol name="trash" size={16} color="#FF6B6B" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.icon }]}>No comments yet</Text>
              }
            />
            <View style={styles.commentInputContainer}>
              <TextInput
                style={[styles.commentInput, { 
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', 
                  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: colorScheme === 'dark' ? '#444' : '#ddd', 
                  borderWidth: 1 
                }]}
                placeholder="Add a comment..."
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                selectionColor={colorScheme === 'dark' ? '#0a7ea4' : '#0a7ea4'}
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.tint }]}
                onPress={handleAddComment}>
                <IconSymbol name="paperplane.fill" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerStat: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemAddedBy: {
    fontSize: 12,
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
  },
  itemPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteItemButton: {
    padding: 4,
  },
  commentCount: {
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
  inputContainer: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    // Don't set default color here - let inline styles handle it
  },
  modalTextArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
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
  commentsModal: {
    maxHeight: '80%',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentItem: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  commentInfo: {
    flex: 1,
    marginRight: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 14,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
  },
  deleteCommentButton: {
    padding: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

