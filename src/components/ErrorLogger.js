import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../utils/theme';

// Global error log array
const errorLogs = [];

// Function to add error to logs
export const logError = (error, source = 'App') => {
  const timestamp = new Date().toISOString();
  const errorObj = {
    timestamp,
    message: error?.message || String(error),
    stack: error?.stack,
    source,
  };
  
  console.error(`[${source}] ${errorObj.message}`);
  errorLogs.push(errorObj);
  
  // Keep only the last 50 errors
  if (errorLogs.length > 50) {
    errorLogs.shift();
  }
};

// Error Logger Component
const ErrorLogger = () => {
  const [visible, setVisible] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [logs, setLogs] = useState([]);

  // Update logs when modal is opened
  useEffect(() => {
    if (visible) {
      setLogs([...errorLogs]);
    }
  }, [visible]);

  // Check if there are errors
  useEffect(() => {
    setHasErrors(errorLogs.length > 0);
  }, [errorLogs.length]);

  // Toggle modal visibility
  const toggleModal = () => {
    setVisible(!visible);
  };

  // Clear all logs
  const clearLogs = () => {
    errorLogs.length = 0;
    setLogs([]);
    setHasErrors(false);
  };

  return (
    <>
      {hasErrors && (
        <TouchableOpacity
          style={styles.logButton}
          onPress={toggleModal}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle" size={24} color={colors.status.error} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{errorLogs.length}</Text>
          </View>
        </TouchableOpacity>
      )}

      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Error Logs</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.logContainer}>
              {logs.length === 0 ? (
                <Text style={styles.emptyText}>No errors logged</Text>
              ) : (
                logs.map((log, index) => (
                  <View key={index} style={styles.logItem}>
                    <Text style={styles.logTimestamp}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </Text>
                    <Text style={styles.logSource}>[{log.source}]</Text>
                    <Text style={styles.logMessage}>{log.message}</Text>
                    {log.stack && (
                      <Text style={styles.logStack}>{log.stack}</Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  logButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.background.dark,
    borderRadius: 30,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.7,
    backgroundColor: colors.background.medium,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.dark,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  clearButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.xs,
  },
  logContainer: {
    flex: 1,
    padding: spacing.md,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  logItem: {
    backgroundColor: colors.background.dark,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  logTimestamp: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  logSource: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  logMessage: {
    color: colors.text.primary,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  logStack: {
    color: colors.text.disabled,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});

export default ErrorLogger;
