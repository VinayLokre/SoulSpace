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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';
import { generateAIResponse, speakText, stopSpeaking, detectEmotion } from '../ai/aiManager';

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
            {message.emotion.charAt(0).toUpperCase() + message.emotion.slice(1)}
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
  const flatListRef = useRef(null);

  // Format timestamp
  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Send a message
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
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
      // Generate AI response
      const response = await generateAIResponse(inputText, aiPersonality);
      
      // Detect emotion in user's message
      const emotion = detectEmotion(inputText);

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
      speakText(response);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsTyping(false);
    }
  };

  // Toggle voice recording
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and process speech
      setIsRecording(false);
      // In a real app, this would use the Voice API to convert speech to text
      // For now, we'll just simulate it
      setTimeout(() => {
        setInputText('This is a simulated voice message.');
      }, 1000);
    } else {
      // Start recording
      setIsRecording(true);
      // In a real app, this would start the Voice API
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    stopSpeaking();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
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

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.text.disabled}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && !isRecording ? styles.disabledButton : null,
          ]}
          onPress={isRecording ? toggleRecording : sendMessage}
          disabled={!inputText.trim() && !isRecording}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : inputText.trim() ? 'send' : 'mic'}
            size={24}
            color={
              !inputText.trim() && !isRecording
                ? colors.text.disabled
                : colors.text.primary
            }
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
    borderRadius: borderRadius.lg,
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
    borderRadius: 4,
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
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    ...shadows.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
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
