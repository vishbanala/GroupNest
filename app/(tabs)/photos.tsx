import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
  Image,
  Platform,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deletePhoto, deleteComment } from '@/lib/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getPhotos, uploadPhoto, getComments, createComment, getLists, getGroups } from '@/lib/database';
import { getCurrentUser } from '@/lib/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image as ExpoImage } from 'expo-image';
import type { Photo, Comment, User, List, Group } from '@/types';

export default function PhotosScreen() {
  const params = useLocalSearchParams<{ groupId?: string }>();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(params.groupId || null);
  const [selectedListFilter, setSelectedListFilter] = useState<string | null>(null);
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadData();
      loadLists();
    } else {
      setPhotos([]);
      setLists([]);
    }
  }, [selectedGroupId]);

  const loadGroups = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const groupsData = await getGroups(currentUser.id);
        setAllGroups(groupsData);
        // Auto-select first group if none selected
        if (!selectedGroupId && groupsData.length > 0) {
          setSelectedGroupId(groupsData[0].id);
        }
      }
    } catch (error: any) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadData = async () => {
    if (!selectedGroupId) {
      setLoading(false);
      return;
    }

    try {
      const photosData = await getPhotos(selectedGroupId);
      setAllPhotos(photosData);
      if (selectedListFilter) {
        setPhotos(photosData.filter(p => p.list_id === selectedListFilter));
      } else {
        setPhotos(photosData);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroupId && allPhotos.length > 0) {
      if (selectedListFilter === 'general') {
        setPhotos(allPhotos.filter(p => !p.list_id));
      } else if (selectedListFilter) {
        setPhotos(allPhotos.filter(p => p.list_id === selectedListFilter));
      } else {
        setPhotos(allPhotos);
      }
    }
  }, [selectedListFilter, allPhotos]);

  const loadLists = async () => {
    if (!selectedGroupId) return;
    try {
      const listsData = await getLists(selectedGroupId);
      setLists(listsData);
    } catch (error: any) {
      console.error('Failed to load lists:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos');
        return false;
      }
      return true;
    } catch (error: any) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
      return false;
    }
  };

  const handlePickImage = async () => {
    if (!selectedGroupId || !user) {
      Alert.alert('No Group Selected', 'Please select a group first');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPendingImage(result.assets[0].uri);
        setUploadModalVisible(true);
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Error', error.message || 'Failed to pick image. Please try again.');
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedGroupId || !user || !pendingImage) return;

    try {
      const photo = await uploadPhoto({
        group_id: selectedGroupId,
        list_id: selectedListId || undefined,
        url: pendingImage,
        thumbnail_url: pendingImage,
        caption: newCaption.trim() || undefined,
        uploaded_by: user.id,
      });
      setPhotos([photo, ...photos]);
      setNewCaption('');
      setSelectedListId(null);
      setPendingImage(null);
      setUploadModalVisible(false);
      Alert.alert('Success', 'Photo uploaded!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload photo');
    }
  };

  const handleOpenPhoto = async (photo: Photo) => {
    setSelectedPhoto(photo);
    try {
      const commentsData = await getComments(undefined, undefined, photo.id);
      setComments(commentsData);
      setPhotoModalVisible(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load photo details');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPhoto || !user) return;

    try {
      const comment = await createComment({
        photo_id: selectedPhoto.id,
        user_id: user.id,
        content: newComment.trim(),
      });
      setComments([...comments, comment]);
      setNewComment('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    }
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhoto || !user) return;

    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(selectedPhoto.id);
              // Update state immediately
              const updatedPhotos = photos.filter((p) => p.id !== selectedPhoto.id);
              setPhotos(updatedPhotos);
              setPhotoModalVisible(false);
              setSelectedPhoto(null);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete photo');
              // Reload on error to ensure state is correct
              await loadData();
            }
          },
        },
      ]
    );
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

  const getReactionCount = (photo: Photo | null, emoji: string) => {
    if (!photo) return 0;
    return photo.reactions?.filter((r) => r.emoji === emoji).length || 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  if (allGroups.length === 0 && !loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.background }]} edges={['top']}>
        <IconSymbol name="photo" size={64} color={colors.icon} />
        <Text style={[styles.emptyText, { color: colors.text, fontSize: 18, fontWeight: '500', marginBottom: 8 }]}>
          No groups yet
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.icon, fontSize: 14, marginBottom: 24, textAlign: 'center', paddingHorizontal: 40 }]}>
          Create or join a group to start sharing photos
        </Text>
        <TouchableOpacity
          style={[styles.goToGroupsButton, { backgroundColor: colorScheme === 'dark' ? '#ffffff' : '#f0f0f0' }]}
          onPress={() => router.push('/(tabs)/groups')}>
          <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>Go to Groups</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.icon + '20' }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Photo Feed</Text>
          {allGroups.length > 0 && (
            <TouchableOpacity
              style={[styles.groupSelector, { 
                backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                borderColor: colorScheme === 'dark' ? '#444' : '#ddd',
                borderWidth: 1
              }]}
              onPress={() => {
                Alert.alert(
                  'Select Group',
                  '',
                  allGroups.map((group) => ({
                    text: group.name,
                    onPress: () => setSelectedGroupId(group.id),
                  })).concat([
                    { text: 'Cancel', style: 'cancel' }
                  ])
                );
              }}>
              <Text style={[styles.groupSelectorText, { color: colors.text }]}>
                {selectedGroupId 
                  ? allGroups.find(g => g.id === selectedGroupId)?.name || 'Select Group'
                  : 'Select Group'}
              </Text>
              <IconSymbol name="chevron.down" size={16} color={colors.icon} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: colorScheme === 'dark' ? '#ffffff' : '#f0f0f0' }]}
          onPress={handlePickImage}>
          <IconSymbol name="plus" size={20} color="#000000" />
          <Text style={{ color: '#000000', fontSize: 14, fontWeight: '600' }}>Upload</Text>
        </TouchableOpacity>
      </View>

      {selectedListFilter ? (
        // Show photos for selected list
        <FlatList
          key="photo-grid"
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', marginBottom: 16, marginHorizontal: 16 }]}
              onPress={() => setSelectedListFilter(null)}>
              <IconSymbol name="chevron.left" size={20} color={colors.text} />
              <Text style={[styles.backButtonText, { color: colors.text }]}>
                {lists.find(l => l.id === selectedListFilter)?.title || 'Back to Folders'}
              </Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.photoItem}
              onPress={() => handleOpenPhoto(item)}>
              <ExpoImage source={{ uri: item.thumbnail_url || item.url }} style={styles.photoThumbnail} />
              {item.caption && (
                <View style={styles.photoCaption}>
                  <Text style={[styles.photoCaptionText, { color: colors.text }]} numberOfLines={2}>
                    {item.caption}
                  </Text>
                </View>
              )}
              <View style={styles.photoOverlay}>
                <View style={styles.photoStats}>
                  {item.reactions && item.reactions.length > 0 && (
                    <View style={styles.reactionBadge}>
                      <Text style={styles.reactionEmoji}>❤️</Text>
                      <Text style={styles.reactionCount}>{item.reactions.length}</Text>
                    </View>
                  )}
                  {item.comments && item.comments.length > 0 && (
                    <View style={styles.commentBadge}>
                      <IconSymbol name="bubble.left" size={14} color="#fff" />
                      <Text style={styles.commentCount}>{item.comments.length}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <IconSymbol name="photo" size={64} color={colors.icon} />
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                No photos in this list yet
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      ) : (
        // Show list folders
        <FlatList
          key="folder-list"
          data={lists.filter(list => allPhotos.some(p => p.list_id === list.id))}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            allPhotos.filter(p => !p.list_id).length > 0 ? (
              <TouchableOpacity
                style={[styles.listFolder, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff' }]}
                onPress={() => {
                  setSelectedListFilter('general');
                  setPhotos(allPhotos.filter(p => !p.list_id));
                }}>
                <View style={[styles.folderIcon, { backgroundColor: colors.tint + '20' }]}>
                  <IconSymbol name="folder" size={32} color={colors.tint} />
                </View>
                <View style={styles.folderInfo}>
                  <Text style={[styles.folderTitle, { color: colors.text }]}>General Photos</Text>
                  <Text style={[styles.folderCount, { color: colors.icon }]}>
                    {allPhotos.filter(p => !p.list_id).length} photos
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.icon} />
              </TouchableOpacity>
            ) : null
          }
          renderItem={({ item }) => {
            const listPhotos = allPhotos.filter(p => p.list_id === item.id);
            if (listPhotos.length === 0) return null;
            
            return (
              <TouchableOpacity
                style={[styles.listFolder, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff' }]}
                onPress={() => {
                  setSelectedListFilter(item.id);
                  setPhotos(listPhotos);
                }}>
                <View style={[styles.folderIcon, { backgroundColor: colors.tint + '20' }]}>
                  <IconSymbol name="folder" size={32} color={colors.tint} />
                </View>
                <View style={styles.folderInfo}>
                  <Text style={[styles.folderTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.folderCount, { color: colors.icon }]}>
                    {listPhotos.length} photo{listPhotos.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                {listPhotos.length > 0 && (
                  <ExpoImage 
                    source={{ uri: listPhotos[0].thumbnail_url || listPhotos[0].url }} 
                    style={styles.folderPreview} 
                  />
                )}
                <IconSymbol name="chevron.right" size={20} color={colors.icon} />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <IconSymbol name="photo" size={64} color={colors.icon} />
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                No photos yet. Upload one to get started!
              </Text>
            </View>
          }
          contentContainerStyle={styles.folderListContent}
        />
      )}

      {/* Upload Photo Modal */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          Keyboard.dismiss();
          setUploadModalVisible(false);
          setPendingImage(null);
          setSelectedListId(null);
          setNewCaption('');
        }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Upload Photo</Text>

                {pendingImage && (
                  <ExpoImage source={{ uri: pendingImage }} style={styles.uploadPreview} />
                )}

                <View style={styles.inputContainer}>
                  <Text style={[styles.modalLabel, { color: colors.text }]}>Caption (optional)</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalTextArea, { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', 
                      color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                      borderColor: colorScheme === 'dark' ? '#444' : '#ddd', 
                      borderWidth: 1 
                    }]}
                    placeholder="Enter caption"
                    placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                    value={newCaption}
                    onChangeText={setNewCaption}
                    multiline
                    numberOfLines={3}
                    selectionColor={colorScheme === 'dark' ? '#0a7ea4' : '#0a7ea4'}
                    autoCorrect={false}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>Assign to List (optional)</Text>
              <View style={styles.listSelectContainer}>
                <TouchableOpacity
                  style={[styles.listSelectButton, { 
                    backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                    borderColor: colorScheme === 'dark' ? '#444' : '#ddd',
                    borderWidth: 1
                  }]}
                  onPress={() => {
                    Alert.alert(
                      'Select List',
                      '',
                      [
                        { text: 'None', onPress: () => setSelectedListId(null) },
                        ...lists.map((list) => ({
                          text: list.title,
                          onPress: () => setSelectedListId(list.id),
                        })),
                        { text: 'Cancel', style: 'cancel' },
                      ]
                    );
                  }}>
                  <Text style={[styles.listSelectText, { 
                    color: colorScheme === 'dark' ? '#ffffff' : '#000000' 
                  }]}>
                    {selectedListId 
                      ? lists.find(l => l.id === selectedListId)?.title || 'Select list'
                      : 'None (General Photos)'}
                  </Text>
                  <IconSymbol name="chevron.down" size={16} color={colors.icon} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.icon + '20' }]}
                onPress={() => {
                  Keyboard.dismiss();
                  setUploadModalVisible(false);
                  setPendingImage(null);
                  setSelectedListId(null);
                  setNewCaption('');
                }}>
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colorScheme === 'dark' ? '#ffffff' : '#f0f0f0' }]}
                onPress={handleUploadPhoto}>
                <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
        </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Photo Detail Modal */}
      <Modal
        visible={photoModalVisible && selectedPhoto !== null}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setPhotoModalVisible(false);
          setSelectedPhoto(null);
        }}>
        {selectedPhoto && (
        <SafeAreaView style={styles.modalOverlay} edges={['top']}>
          <View style={[styles.photoModal, { 
            backgroundColor: colors.background, 
            paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50 
          }]}>
            <View style={styles.photoModalHeader}>
              <View style={styles.photoModalUser}>
                {selectedPhoto.uploaded_by_user && (
                  <>
                    <View style={[styles.userAvatar, { backgroundColor: colors.tint + '20' }]}>
                      <Text style={[styles.userAvatarText, { color: colors.tint }]}>
                        {selectedPhoto.uploaded_by_user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.userName, { color: colors.text }]}>
                        {selectedPhoto.uploaded_by_user.name}
                      </Text>
                      <Text style={[styles.photoDate, { color: colors.icon }]}>
                        {new Date(selectedPhoto.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </>
                )}
              </View>
              <View style={styles.headerActions}>
                {user && selectedPhoto.uploaded_by === user.id && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeletePhoto}>
                    <IconSymbol name="trash" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => {
                  setPhotoModalVisible(false);
                  setSelectedPhoto(null);
                }}>
                  <IconSymbol name="xmark" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {selectedPhoto && (
              <>
                <ExpoImage source={{ uri: selectedPhoto.url }} style={styles.photoFull} />

                {selectedPhoto.caption && (
                  <View style={styles.photoCaptionFull}>
                    <Text style={[styles.photoCaptionFullText, { color: colors.text }]}>
                      {selectedPhoto.caption}
                    </Text>
                  </View>
                )}

                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <IconSymbol name="heart" size={24} color={colors.icon} />
                    <Text style={[styles.actionCount, { color: colors.icon }]}>
                      {getReactionCount(selectedPhoto, '❤️')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setCommentModalVisible(true)}>
                    <IconSymbol name="bubble.left" size={24} color={colors.icon} />
                    <Text style={[styles.actionCount, { color: colors.icon }]}>
                      {comments.length}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Comments Section */}
            <View style={styles.commentsSection}>
              <Text style={[styles.commentsTitle, { color: colors.text }]}>Comments</Text>
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
                        <Text style={[styles.commentContent, { color: colors.text }]}>
                          {item.content}
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
        </SafeAreaView>
        )}
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
  headerLeft: {
    flex: 1,
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  groupSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 12,
    maxWidth: 200,
  },
  groupSelectorText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 8,
  },
  photoItem: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  photoThumbnail: {
    width: '100%',
    aspectRatio: 1,
  },
  photoCaption: {
    padding: 8,
  },
  photoCaptionText: {
    fontSize: 12,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  photoStats: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  commentCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  photoModal: {
    width: '100%',
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  photoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 10,
    minHeight: 50,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 8,
  },
  photoModalUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  photoDate: {
    fontSize: 12,
  },
  photoFull: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  photoCaptionFull: {
    marginBottom: 16,
  },
  photoCaptionFullText: {
    fontSize: 16,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentsSection: {
    flex: 1,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 14,
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
  goToGroupsButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  goToGroupsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadPreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  listSelectContainer: {
    marginBottom: 16,
  },
  listSelectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  listSelectText: {
    fontSize: 16,
    flex: 1,
  },
  photoListLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  folderListContent: {
    padding: 16,
    gap: 12,
  },
  listFolder: {
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
  folderIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 14,
  },
  folderPreview: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    width: '90%',
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
    marginBottom: 0,
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
    fontSize: 16,
    fontWeight: '600',
  },
});

