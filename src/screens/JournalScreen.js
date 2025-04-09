import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../utils/theme';
import StarryBackground from '../components/StarryBackground';
import GlowingButton from '../components/GlowingButton';
import {
  getJournalEntries,
  saveJournalEntry,
  deleteJournalEntry,
  getRandomPrompt,
} from '../services/journalService';
import { detectEmotion } from '../ai/aiManager';

const JournalScreen = () => {
  // State variables
  const [entries, setEntries] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [journalContent, setJournalContent] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isViewingEntry, setIsViewingEntry] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Load journal entries on component mount
  useEffect(() => {
    loadEntries();
    getNewPrompt();
  }, []);

  // Load journal entries from storage
  const loadEntries = async () => {
    try {
      const journalEntries = await getJournalEntries();
      setEntries(journalEntries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  // Get a new random prompt
  const getNewPrompt = async () => {
    try {
      const prompt = await getRandomPrompt();
      setCurrentPrompt(prompt);
    } catch (error) {
      console.error('Error getting random prompt:', error);
      setCurrentPrompt('How are you feeling today?');
    }
  };

  // Start a new journal entry
  const startNewEntry = () => {
    setJournalContent('');
    setIsWriting(true);
  };

  // Save the current journal entry
  const saveEntry = async () => {
    if (!journalContent.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    try {
      await saveJournalEntry(journalContent, currentPrompt);
      setJournalContent('');
      setIsWriting(false);
      loadEntries();
      getNewPrompt();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    }
  };

  // View a journal entry
  const viewEntry = (entry) => {
    setSelectedEntry(entry);
    setIsViewingEntry(true);
  };

  // Delete a journal entry
  const confirmDeleteEntry = (entryId) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJournalEntry(entryId);
              setIsViewingEntry(false);
              loadEntries();
            } catch (error) {
              console.error('Error deleting journal entry:', error);
              Alert.alert('Error', 'Failed to delete the journal entry. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Toggle voice recording
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and process speech
      setIsRecording(false);
      // In a real app, this would use the Voice API to convert speech to text
      // For now, we'll just simulate it
      setTimeout(() => {
        setJournalContent(
          journalContent + ' This is a simulated voice recording transcription.'
        );
      }, 1000);
    } else {
      // Start recording
      setIsRecording(true);
      // In a real app, this would start the Voice API
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get emotion color
  const getEmotionColor = (emotion) => {
    switch (emotion) {
      case 'happy':
        return colors.mood.happy;
      case 'sad':
        return colors.mood.sad;
      case 'anxious':
        return colors.mood.anxious;
      case 'angry':
        return colors.mood.angry;
      case 'calm':
        return colors.mood.calm;
      case 'tired':
        return colors.mood.tired;
      default:
        return colors.text.secondary;
    }
  };

  // Render a journal entry item
  const renderEntryItem = ({ item }) => {
    const emotion = item.emotion || 'neutral';
    const emotionColor = getEmotionColor(emotion);
    const entryPreview = item.content.length > 80
      ? `${item.content.substring(0, 80)}...`
      : item.content;

    return (
      <TouchableOpacity
        style={styles.entryItem}
        onPress={() => viewEntry(item)}
        activeOpacity={0.7}
      >
        <View style={styles.entryHeader}>
          <Text style={styles.entryDate}>{formatDate(item.timestamp)}</Text>
          <View style={styles.emotionContainer}>
            <View style={[styles.emotionDot, { backgroundColor: emotionColor }]} />
            <Text style={styles.emotionText}>
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </Text>
          </View>
        </View>
        {item.prompt && <Text style={styles.entryPrompt}>{item.prompt}</Text>}
        <Text style={styles.entryPreview}>{entryPreview}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <StarryBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Journal</Text>
          <TouchableOpacity style={styles.newEntryButton} onPress={startNewEntry}>
            <Ionicons name="add" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Journal Entries List */}
        {entries.length > 0 ? (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={renderEntryItem}
            contentContainerStyle={styles.entriesList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyText}>No journal entries yet</Text>
            <Text style={styles.emptySubtext}>
              Start writing to track your thoughts and emotions
            </Text>
            <GlowingButton
              title="Write First Entry"
              onPress={startNewEntry}
              style={styles.emptyButton}
            />
          </View>
        )}

        {/* New Entry Modal */}
        <Modal
          visible={isWriting}
          animationType="slide"
          transparent
          onRequestClose={() => setIsWriting(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
          >
            <View style={styles.journalModal}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsWriting(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>New Journal Entry</Text>
                <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
                  <Ionicons name="checkmark" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.promptContainer}>
                <Text style={styles.promptText}>{currentPrompt}</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={getNewPrompt}>
                  <Ionicons name="refresh" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.journalInput}
                placeholder="Start writing here..."
                placeholderTextColor={colors.text.disabled}
                value={journalContent}
                onChangeText={setJournalContent}
                multiline
                autoFocus
              />

              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordingButton,
                ]}
                onPress={toggleRecording}
              >
                <Ionicons
                  name={isRecording ? 'stop-circle' : 'mic'}
                  size={24}
                  color={colors.text.primary}
                />
                <Text style={styles.recordButtonText}>
                  {isRecording ? 'Stop Recording' : 'Voice Entry'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* View Entry Modal */}
        <Modal
          visible={isViewingEntry}
          animationType="slide"
          transparent
          onRequestClose={() => setIsViewingEntry(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.journalModal}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsViewingEntry(false)}
                >
                  <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Journal Entry</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDeleteEntry(selectedEntry?.id)}
                >
                  <Ionicons name="trash-outline" size={24} color={colors.status.error} />
                </TouchableOpacity>
              </View>

              {selectedEntry && (
                <>
                  <View style={styles.entryMetadata}>
                    <Text style={styles.entryFullDate}>
                      {new Date(selectedEntry.timestamp).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    {selectedEntry.emotion && (
                      <View style={styles.emotionContainer}>
                        <View
                          style={[
                            styles.emotionDot,
                            { backgroundColor: getEmotionColor(selectedEntry.emotion) },
                          ]}
                        />
                        <Text style={styles.emotionText}>
                          {selectedEntry.emotion.charAt(0).toUpperCase() +
                            selectedEntry.emotion.slice(1)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {selectedEntry.prompt && (
                    <View style={styles.viewPromptContainer}>
                      <Text style={styles.viewPromptLabel}>Prompt:</Text>
                      <Text style={styles.viewPromptText}>{selectedEntry.prompt}</Text>
                    </View>
                  )}

                  <ScrollView style={styles.entryContentContainer}>
                    <Text style={styles.entryContent}>{selectedEntry.content}</Text>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.medium,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  newEntryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entriesList: {
    padding: spacing.md,
  },
  entryItem: {
    backgroundColor: colors.background.medium,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  emotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  emotionText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  entryPrompt: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  entryPreview: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  journalModal: {
    backgroundColor: colors.background.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.medium,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  saveButton: {
    padding: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.medium,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light,
  },
  promptText: {
    flex: 1,
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text.primary,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  journalInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.medium,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background.light,
  },
  recordingButton: {
    backgroundColor: colors.primary,
  },
  recordButtonText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
  },
  entryMetadata: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.medium,
  },
  entryFullDate: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  viewPromptContainer: {
    padding: spacing.md,
    backgroundColor: colors.background.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light,
  },
  viewPromptLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  viewPromptText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text.primary,
  },
  entryContentContainer: {
    flex: 1,
    padding: spacing.md,
  },
  entryContent: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
});

export default JournalScreen;
