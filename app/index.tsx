import { View, StyleSheet, TouchableOpacity, Text, I18nManager, Modal } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

// Force RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface Item {
  title: string;
  category: 'movies' | 'plays' | 'songs';
}

interface CategorySettings {
  movies: boolean;
  plays: boolean;
  songs: boolean;
}

const plays: Item[] = [
  { title: "مدرسة المشاغبين", category: 'plays' },
  { title: "الزعيم", category: 'plays' },
  { title: "الواد سيد الشغال", category: 'plays' },
  { title: "البيجامة الحمراء", category: 'plays' },
  { title: "السلطان الحائر", category: 'plays' },
  { title: "اللعب على الحبلين", category: 'plays' },
  { title: "الزير سالم", category: 'plays' },
  { title: "السلطان الحائر", category: 'plays' },
  { title: "البيجامة الحمراء", category: 'plays' },
  { title: "اللعب على الحبلين", category: 'plays' }
];

const songs: Item[] = [
  { title: "أه يا سلام", category: 'songs' },
  { title: "أنا عندي نصيب", category: 'songs' },
  { title: "بتلوموني ليه", category: 'songs' },
  { title: "حبيبي دايماً", category: 'songs' },
  { title: "خدني معاك", category: 'songs' },
  { title: "رايحين فين", category: 'songs' },
  { title: "سألوني الناس", category: 'songs' },
  { title: "شمس الأصيل", category: 'songs' },
  { title: "عاش اللي قال", category: 'songs' },
  { title: "كان عندي قلب", category: 'songs' }
];

const csvAsset = require('../movies.csv');
const parseMoviesCsv = (csvContent: string): Item[] => {
  return csvContent
    .split(/\r?\n/)
    .map(line => line.split(',')[0]?.trim())
    .filter((title): title is string => Boolean(title))
    .map(title => ({
      title,
      category: 'movies',
    }));
};

export default function App() {
  const [movies, setMovies] = useState<Item[]>([]);
  const [item, setItem] = useState<Item | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [categorySettings, setCategorySettings] = useState<CategorySettings>({
    movies: true,
    plays: true,
    songs: true,
  });
  const [loadingMovies, setLoadingMovies] = useState<boolean>(true);

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

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const asset = Asset.fromModule(csvAsset);
        await asset.downloadAsync();
        const fileUri = asset.localUri ?? asset.uri;
        if (!fileUri) {
          throw new Error('لم يتم العثور على ملف الأفلام.');
        }
        const csvFile = new FileSystem.File(fileUri);
        const csvContent = await csvFile.text();
        setMovies(parseMoviesCsv(csvContent));
      } catch (error) {
        console.error('Failed to load movies from CSV:', error);
      } finally {
        setLoadingMovies(false);
      }
    };

    loadMovies();
  }, []);

  const allItems = useMemo(() => {
    return [...movies, ...plays, ...songs];
  }, [movies]);

  const getRandomItem = () => {
    // Filter items based on enabled categories
    const enabledItems = allItems.filter(item => categorySettings[item.category]);

    if (enabledItems.length === 0) {
      return; // Don't select if no categories are enabled
    }

    const randomIndex = Math.floor(Math.random() * enabledItems.length);
    setItem(enabledItems[randomIndex]);
    setTimeLeft(120); // 2 minutes in seconds
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
    }
  };

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
      {item ? (
        <View style={styles.itemContainer}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{getCategoryTitle(item.category)}</Text>
            <Ionicons 
              name={item.category === 'movies' ? 'film-outline' : item.category === 'plays' ? 'ticket-outline' : 'musical-notes-outline'} 
              size={18} 
              color="#4A90E2" 
              style={styles.categoryIcon} 
            />
          </View>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      ) : (
        <Text style={styles.placeholder}>
          {loadingMovies ? 'جاري تحميل قائمة الأفلام...' : 'اضغط على الزر للحصول على اقتراح!'}
        </Text>
      )}
      
      <TouchableOpacity 
        style={styles.button}
        onPress={getRandomItem}
      >
        <Text style={styles.buttonText}>
          اقترح آخر
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
                {categorySettings.movies && (
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                )}
                {!categorySettings.movies && (
                  <Ionicons name="ellipse-outline" size={24} color="#888888" />
                )}
                <Text style={[styles.categoryToggleText, categorySettings.movies && styles.categoryToggleTextActive]}>
                  أفلام
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryToggle, categorySettings.plays && styles.categoryToggleActive]}
              onPress={() => toggleCategory('plays')}
            >
              <View style={styles.categoryToggleContent}>
                {categorySettings.plays && (
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                )}
                {!categorySettings.plays && (
                  <Ionicons name="ellipse-outline" size={24} color="#888888" />
                )}
                <Text style={[styles.categoryToggleText, categorySettings.plays && styles.categoryToggleTextActive]}>
                  مسرحيات
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryToggle, categorySettings.songs && styles.categoryToggleActive]}
              onPress={() => toggleCategory('songs')}
            >
              <View style={styles.categoryToggleContent}>
                {categorySettings.songs && (
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                )}
                {!categorySettings.songs && (
                  <Ionicons name="ellipse-outline" size={24} color="#888888" />
                )}
                <Text style={[styles.categoryToggleText, categorySettings.songs && styles.categoryToggleTextActive]}>
                  أغاني
                </Text>
              </View>
            </TouchableOpacity>

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
    justifyContent: 'center',
    padding: 20,
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
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    width: '100%',
    shadowColor: '#FFB74D', // Warm orange shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  categoryIcon: {
    marginLeft: 6,
  },
  category: {
    fontSize: 16,
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
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    writingDirection: 'rtl',
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
  categoryToggleText: {
    fontSize: 18,
    color: '#666666',
    writingDirection: 'rtl',
    fontWeight: '400',
  },
  categoryToggleTextActive: {
    color: '#FFFFFF',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#4A90E2',
  },
});
