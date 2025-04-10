import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../utils/theme';
import { generateAIResponse, speakText, stopSpeaking } from '../ai/aiManager';
// Removed Voice import as we're using a simulated approach instead
import VoiceRecordingOverlay from './VoiceRecordingOverlay';

// Message bubble component
const MessageBubble = ({ message, isUser }) => {
  // Animation for message appearance
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get emotion color for AI messages
  const getEmotionColor = () => {
    if (isUser || !message.emotion) return null;

    switch (message.emotion) {
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
        return colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {!isUser && message.emotion && (
        <View style={styles.emotionContainer}>
          <View
            style={[
              styles.emotionDot,
              { backgroundColor: getEmotionColor() },
            ]}
          />
          <Text style={styles.emotionText}>
            {message.emotion && typeof message.emotion === 'string'
              ? message.emotion.charAt(0).toUpperCase() + message.emotion.slice(1)
              : 'Neutral'}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {message.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>{message.timestamp}</Text>
    </Animated.View>
  );
};

// Typing indicator component for AI responses
const TypingIndicator = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  useEffect(() => {
    const animateDot = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);

    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <Animated.View
          style={[
            styles.typingDot,
            {
              opacity: dot1,
              transform: [
                {
                  translateY: dot1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.typingDot,
            {
              opacity: dot2,
              transform: [
                {
                  translateY: dot2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.typingDot,
            {
              opacity: dot3,
              transform: [
                {
                  translateY: dot3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};

// Main ChatInterface component
const ChatInterface = ({ aiPersonality = 'listener' }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0.3); // Voice level for animation (0-1)
  const [showOverlay, setShowOverlay] = useState(false); // Control overlay visibility
  const flatListRef = useRef(null);
  const voiceLevelInterval = useRef(null);

  // Simulated voice recognition implementation
  useEffect(() => {
    // No initialization needed for simulated approach
    return () => {
      // Clean up any intervals
      if (voiceLevelInterval.current) {
        clearInterval(voiceLevelInterval.current);
      }
    };
  }, []);

  // Format timestamp
  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Send a message
  const sendMessage = async (messageText = null) => {
    // Use provided messageText or inputText from state
    const textToSend = messageText || inputText;

    if (!textToSend.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: formatTimestamp(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Generate AI response - this already includes emotion detection
      const response = await generateAIResponse(textToSend, aiPersonality);

      // The emotion is now detected inside generateAIResponse
      // We'll use a default emotion if none is detected
      const emotion = 'neutral';

      // Add AI message
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: formatTimestamp(),
        emotion,
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setIsTyping(false);

      // Speak the AI response
      setIsSpeaking(true);
      speakText(response).then(() => {
        setIsSpeaking(false);
      }).catch(error => {
        console.error('Error speaking text:', error);
        setIsSpeaking(false);
      });

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsTyping(false);
    }
  };

  // Simulated voice recording function
  const toggleRecording = () => {
    if (isRecording) {
      // Stop simulated recording
      setIsRecording(false);
      setShowOverlay(false);

      // Clear the voice level interval
      if (voiceLevelInterval.current) {
        clearInterval(voiceLevelInterval.current);
        voiceLevelInterval.current = null;
      }

      // Simulate receiving voice recognition results
      const simulatedText = "This is a simulated voice message from the AI companion.";
      setInputText(simulatedText);

      // Auto-send the message after a short delay
      setTimeout(() => {
        sendMessage(simulatedText);
      }, 500);

    } else {
      // Start simulated recording
      // Hide keyboard if it's open
      Keyboard.dismiss();

      setIsRecording(true);
      setShowOverlay(true);

      // Simulate voice level changes for animation
      voiceLevelInterval.current = setInterval(() => {
        // Random voice level between 0.3 and 1.0 for animation effect
        setVoiceLevel(0.3 + Math.random() * 0.7);
      }, 150);

      // Simulate recording for 3 seconds then automatically stop
      setTimeout(() => {
        if (isRecording) {
          toggleRecording();
        }
      }, 3000);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    stopSpeaking();
    setIsSpeaking(false);
  };

  // Stop AI from speaking
  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Voice Recording Overlay */}
      {showOverlay && (
        <VoiceRecordingOverlay
          isRecording={isRecording}
          onStop={toggleRecording}
          voiceLevel={voiceLevel}
        />
      )}
      {/* Chat header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Companion</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
          <Ionicons name="trash-outline" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isUser={item.isUser} />
        )}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Send a message to start a conversation with your AI companion.
            </Text>
          </View>
        }
      />

      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}

      {/* Stop speaking button */}
      {isSpeaking && (
        <View style={styles.stopSpeakingContainer}>
          <TouchableOpacity
            style={styles.stopSpeakingButton}
            onPress={handleStopSpeaking}
          >
            <Ionicons name="stop-circle" size={24} color={colors.status.error} />
            <Text style={styles.stopSpeakingText}>Stop AI Speaking</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input area */}
      <View style={styles.inputContainer}>
        {/* Mic button on the left */}
        <TouchableOpacity
          style={[
            styles.micButton,
            isRecording ? styles.activeButton : null
          ]}
          onPress={toggleRecording}
          disabled={isSpeaking}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic'}
            size={24}
            color={isRecording ? colors.accent.primary : colors.text.secondary}
          />
        </TouchableOpacity>

        {/* Text input in the middle */}
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.text.disabled}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />

        {/* Send button on the right */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() ? styles.disabledButton : null
          ]}
          onPress={() => inputText.trim() && sendMessage()}
          disabled={!inputText.trim() || isSpeaking}
        >
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() ? colors.accent.primary : colors.text.disabled}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  stopSpeakingContainer: {
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.medium,
  },
  stopSpeakingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  stopSpeakingText: {
    color: colors.status.error,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  clearButton: {
    padding: spacing.xs,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  aiBubble: {
    backgroundColor: colors.background.medium,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: colors.text.primary,
  },
  aiText: {
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.disabled,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emotionDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    marginRight: 4,
  },
  emotionText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  typingContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.medium,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    ...shadows.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.text.secondary,
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.background.medium,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.medium,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    maxHeight: 100,
    marginHorizontal: spacing.sm,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: colors.accent.secondary,
  },
  disabledButton: {
    backgroundColor: colors.background.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 16,
  },
});

export default ChatInterface;
