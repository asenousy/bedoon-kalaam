import { View, StyleSheet, TouchableOpacity, Text, I18nManager, Modal, Animated, Vibration } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import moviesList from '../movies.json';
import playsList from '../plays.json';
import songsList from '../songs.json';
import seriesList from '../series.json';

// Force RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface Item {
  title: string;
  category: 'movies' | 'plays' | 'songs' | 'series';
}

interface CategorySettings {
  movies: boolean;
  plays: boolean;
  songs: boolean;
  series: boolean;
}

const movies: Item[] = (moviesList as string[]).map(title => ({
  title,
  category: 'movies',
}));

const plays: Item[] = (playsList as string[]).map(title => ({
  title,
  category: 'plays',
}));

const songs: Item[] = (songsList as string[]).map(title => ({
  title,
  category: 'songs',
}));

const series: Item[] = (seriesList as string[]).map(title => ({
  title,
  category: 'series',
}));

const CATEGORY_EMOJI: Record<Item['category'], string> = {
  movies: '🎥',
  plays: '🎭',
  songs: '🎵',
  series: '📺',
};

const allItems = [...movies, ...plays, ...songs, ...series];
const TIME_UP_SOUND = require('../assets/sounds/time-up.mp3');
const TIMER_MIN_MINUTES = 1;
const TIMER_STEP_MINUTES = 1;
const TIME_UP_VIBRATION_PATTERN = [0, 500, 250, 500, 250, 500];

export default function App() {
  const [item, setItem] = useState<Item | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerMinutes, setTimerMinutes] = useState<number>(2);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showTimeUp, setShowTimeUp] = useState<boolean>(false);
  const [categorySettings, setCategorySettings] = useState<CategorySettings>({
    movies: true,
    plays: true,
    songs: true,
    series: true,
  });
  const flashAnim = useRef(new Animated.Value(0)).current;
  const flashAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const timeUpPlayer = useAudioPlayer(TIME_UP_SOUND, { keepAudioSessionActive: false });

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'doNotMix',
          interruptionModeAndroid: 'doNotMix',
          allowsRecording: false,
          shouldPlayInBackground: false,
          shouldRouteThroughEarpiece: false,
        });
      } catch (error) {
        console.warn('Failed to configure audio mode', error);
      }
    };

    configureAudio();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft]);

  const stopFlashAnimation = useCallback(() => {
    if (flashAnimationRef.current) {
      flashAnimationRef.current.stop();
      flashAnimationRef.current = null;
    }
    flashAnim.setValue(0);
  }, [flashAnim]);

  const startFlashAnimation = useCallback(() => {
    stopFlashAnimation();

    flashAnimationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    );

    flashAnimationRef.current.start();
  }, [flashAnim, stopFlashAnimation]);

  const timeUpStatus = useAudioPlayerStatus(timeUpPlayer);

  const playTimeUpSound = useCallback(async () => {
    if (!timeUpPlayer || !timeUpStatus) {
      return;
    }

    try {
      if (!timeUpStatus.isLoaded) {
        return;
      }

      if (timeUpStatus.playing) {
        timeUpPlayer.pause();
      }

      await timeUpPlayer.seekTo(0);
      timeUpPlayer.play();
    } catch (error) {
      console.warn('Failed to play time up sound', error);
    }
  }, [timeUpPlayer, timeUpStatus]);

  useEffect(() => {
    if (timeLeft === 0 && item) {
      if (!showTimeUp) {
        setShowTimeUp(true);
        startFlashAnimation();
        playTimeUpSound();
        Vibration.vibrate(TIME_UP_VIBRATION_PATTERN);
      }
    } else {
      if (showTimeUp) {
        setShowTimeUp(false);
      }
      stopFlashAnimation();
      Vibration.cancel();
    }

    return () => {
      stopFlashAnimation();
      Vibration.cancel();
    };
  }, [
    timeLeft,
    item,
    showTimeUp,
    startFlashAnimation,
    stopFlashAnimation,
    playTimeUpSound,
  ]);

  const getRandomItem = () => {
    stopFlashAnimation();
    setShowTimeUp(false);

    // Filter items based on enabled categories
    const enabledItems = allItems.filter(item => categorySettings[item.category]);

    if (enabledItems.length === 0) {
      return; // Don't select if no categories are enabled
    }

    const randomIndex = Math.floor(Math.random() * enabledItems.length);
    setItem(enabledItems[randomIndex]);
    setTimeLeft(timerMinutes * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCategory = (category: keyof CategorySettings) => {
    setCategorySettings(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'movies': return 'فيلم';
      case 'plays': return 'مسرحية';
      case 'songs': return 'أغنية';
      case 'series': return 'مسلسل';
    }
  };

  const getCategoryEmoji = (category: Item['category']) => CATEGORY_EMOJI[category];
  
  const adjustTimer = (deltaMinutes: number) => {
    setTimerMinutes(prev => {
      const nextMinutes = Math.max(TIMER_MIN_MINUTES, prev + deltaMinutes);
      setTimeLeft(current => (current > 0 ? Math.min(current, nextMinutes * 60) : current));
      return nextMinutes;
    });
  };

  const flashOpacity = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const flashScale = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.settingsIcon}
        onPress={() => setShowSettings(true)}
      >
        <Ionicons name="settings-outline" size={32} color="#4A90E2" />
      </TouchableOpacity>

      {timeLeft > 0 && (
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      )}
      {showTimeUp && (
        <Animated.View
          style={[
            styles.timeUpContainer,
            {
              opacity: flashOpacity,
              transform: [{ scale: flashScale }],
            },
          ]}
        >
          <Ionicons name="alarm-outline" size={32} color="#FFFFFF" style={styles.timeUpIcon} />
          <Text style={styles.timeUpText}>انتهى الوقت!</Text>
        </Animated.View>
      )}
      {item ? (
        <View style={styles.itemContainer}>
          <View style={styles.itemTextContainer}>
            <Text style={styles.category}>{getCategoryTitle(item.category)}</Text>
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.category)}</Text>
        </View>
      ) : (
        <Text style={styles.placeholder}>اضغط على الزر للحصول على اقتراح!</Text>
      )}
      
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]}
        onPress={getRandomItem}
      >
        <Text style={[styles.buttonText, styles.primaryButtonText]}>
          اقتراح آخر
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>اختر الفئات</Text>
            
            <TouchableOpacity 
              style={[styles.categoryToggle, categorySettings.movies && styles.categoryToggleActive]}
              onPress={() => toggleCategory('movies')}
            >
              <View style={styles.categoryToggleContent}>
                <View style={styles.categoryToggleCheck}>
                  {categorySettings.movies ? (
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color="#888888" />
                  )}
                </View>
                <View style={styles.categoryToggleLabelGroup}>
                  <Text style={[styles.categoryToggleText, categorySettings.movies && styles.categoryToggleTextActive]}>
                    أفلام
                  </Text>
                  <Text style={styles.categoryToggleEmoji}>{getCategoryEmoji('movies')}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryToggle, categorySettings.plays && styles.categoryToggleActive]}
              onPress={() => toggleCategory('plays')}
            >
              <View style={styles.categoryToggleContent}>
                <View style={styles.categoryToggleCheck}>
                  {categorySettings.plays ? (
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color="#888888" />
                  )}
                </View>
                <View style={styles.categoryToggleLabelGroup}>
                  <Text style={[styles.categoryToggleText, categorySettings.plays && styles.categoryToggleTextActive]}>
                    مسرحيات
                  </Text>
                  <Text style={styles.categoryToggleEmoji}>{getCategoryEmoji('plays')}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryToggle, categorySettings.series && styles.categoryToggleActive]}
              onPress={() => toggleCategory('series')}
            >
              <View style={styles.categoryToggleContent}>
                <View style={styles.categoryToggleCheck}>
                  {categorySettings.series ? (
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color="#888888" />
                  )}
                </View>
                <View style={styles.categoryToggleLabelGroup}>
                  <Text style={[styles.categoryToggleText, categorySettings.series && styles.categoryToggleTextActive]}>
                    مسلسلات
                  </Text>
                  <Text style={styles.categoryToggleEmoji}>{getCategoryEmoji('series')}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryToggle, categorySettings.songs && styles.categoryToggleActive]}
              onPress={() => toggleCategory('songs')}
            >
              <View style={styles.categoryToggleContent}>
                <View style={styles.categoryToggleCheck}>
                  {categorySettings.songs ? (
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color="#888888" />
                  )}
                </View>
                <View style={styles.categoryToggleLabelGroup}>
                  <Text style={[styles.categoryToggleText, categorySettings.songs && styles.categoryToggleTextActive]}>
                    أغاني
                  </Text>
                  <Text style={styles.categoryToggleEmoji}>{getCategoryEmoji('songs')}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.timerSection}>
              <Text style={styles.timerLabel}>مدة المؤقت (بالدقائق)</Text>
              <View style={styles.timerStepper}>
                <TouchableOpacity
                  style={[
                    styles.stepperButton,
                    timerMinutes === TIMER_MIN_MINUTES && styles.stepperButtonDisabled
                  ]}
                  onPress={() => adjustTimer(-TIMER_STEP_MINUTES)}
                  disabled={timerMinutes === TIMER_MIN_MINUTES}
                >
                  <Ionicons name="remove-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.timerValue}>{timerMinutes}</Text>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => adjustTimer(TIMER_STEP_MINUTES)}
                >
                  <Ionicons name="add-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.timerHint}>سيبدأ العد التنازلي من القيمة المحددة عند اختيار عنصر جديد.</Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.closeButton]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.buttonText}>
                إغلاق
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6', // Warm light yellow background
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
  },
  settingsIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFB74D',
    marginBottom: 40,
    letterSpacing: 2,
    fontFamily: 'System',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 28,
    paddingVertical: 32,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    width: '100%',
    minHeight: 220,
    shadowColor: '#FFB74D', // Warm orange shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  itemTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 56,
    marginLeft: 16,
  },
  category: {
    fontSize: 20,
    color: '#4A90E2',
    fontWeight: '500',
    marginBottom: 10,
    writingDirection: 'rtl',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    writingDirection: 'rtl',
    color: '#FF6B6B', // Warm coral red
  },
  placeholder: {
    fontSize: 18,
    color: '#4A90E2', // Bright blue text
    textAlign: 'center',
    marginBottom: 30,
    writingDirection: 'rtl',
  },
  timeUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#E53935',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
    marginBottom: 40,
  },
  timeUpIcon: {
    marginStart: 12,
  },
  timeUpText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1,
    writingDirection: 'rtl',
  },
  button: {
    backgroundColor: '#FF6B6B', // Warm coral red button
    padding: 15,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#FF6B6B', // Warm coral red shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButton: {
    paddingVertical: 26,
    paddingHorizontal: 32,
    borderRadius: 22,
    marginTop: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  primaryButtonText: {
    fontSize: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
    writingDirection: 'rtl',
  },
  categoryToggle: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryToggleActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#E05050',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryToggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  categoryToggleCheck: {
    minWidth: 32,
    alignItems: 'flex-start',
  },
  categoryToggleLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  categoryToggleText: {
    fontSize: 18,
    color: '#666666',
    writingDirection: 'rtl',
    fontWeight: '400',
    textAlign: 'right',
    marginLeft: 8,
  },
  categoryToggleTextActive: {
    color: '#FFFFFF',
  },
  categoryToggleEmoji: {
    fontSize: 32,
    marginLeft: 8,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#4A90E2',
  },
  timerSection: {
    width: '100%',
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F7FB',
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 12,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  timerStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  stepperButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 8,
  },
  stepperButtonDisabled: {
    backgroundColor: '#A9B8D9',
  },
  timerValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A90E2',
  },
  timerHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7A99',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 16,
  },
});
