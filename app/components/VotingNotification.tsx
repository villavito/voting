import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface VotingNotificationProps {
  visible: boolean;
  cycleName: string;
  onClose: () => void;
  cycleId: string;
}

const { width } = Dimensions.get('window');

export default function VotingNotification({
  visible,
  cycleName,
  onClose,
  cycleId,
}: VotingNotificationProps) {
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    checkIfNotificationShown();
  }, [cycleId]);

  const checkIfNotificationShown = async () => {
    try {
      const shownNotifications = await AsyncStorage.getItem('shownVotingNotifications');
      const notifications = shownNotifications ? JSON.parse(shownNotifications) : [];
      
      // Check if this cycle's notification has been shown
      if (!notifications.includes(cycleId) && visible) {
        setShowModal(true);
        animateIn();
      }
    } catch (error) {
      console.error('Error checking notification status:', error);
      if (visible) {
        setShowModal(true);
        animateIn();
      }
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      callback();
    });
  };

  const markNotificationAsShown = async () => {
    try {
      const shownNotifications = await AsyncStorage.getItem('shownVotingNotifications');
      const notifications = shownNotifications ? JSON.parse(shownNotifications) : [];
      
      if (!notifications.includes(cycleId)) {
        notifications.push(cycleId);
        await AsyncStorage.setItem('shownVotingNotifications', JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error saving notification status:', error);
    }
  };

  const handleVoteNow = () => {
    animateOut(async () => {
      await markNotificationAsShown();
      onClose();
      router.push('/vote');
    });
  };

  const handleLater = () => {
    animateOut(async () => {
      await markNotificationAsShown();
      onClose();
    });
  };

  if (!showModal) return null;

  return (
    <Modal
      transparent
      visible={showModal}
      animationType="none"
      onRequestClose={handleLater}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Header with icon */}
          <View style={styles.header}>
            <Text style={styles.icon}>🗳️</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Voting is Now Open!</Text>
          
          {/* Cycle Name */}
          <View style={styles.cycleContainer}>
            <Text style={styles.cycleLabel}>Current Cycle:</Text>
            <Text style={styles.cycleName}>{cycleName}</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            The voting period is now active. Cast your vote to make your voice heard!
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleVoteNow}
            >
              <Text style={styles.primaryButtonText}>Cast Your Vote</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleLater}
            >
              <Text style={styles.secondaryButtonText}>Later</Text>
            </Pressable>
          </View>

          {/* Footer note */}
          <Text style={styles.footerNote}>
            You can access voting anytime from the home screen
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  icon: {
    fontSize: 48,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  cycleContainer: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  cycleLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  cycleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
