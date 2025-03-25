import { View, StyleSheet, TouchableOpacity, Text, I18nManager, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

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

const movies: Item[] = [
  { title: "الزوجة الثانية", category: 'movies' },
  { title: "الكرنك", category: 'movies' },
  { title: "الرجل الذي فقد ظله", category: 'movies' },
  { title: "الحرام", category: 'movies' },
  { title: "الوسادة الخالية", category: 'movies' },
  { title: "الرصاصة لا تزال في جيبي", category: 'movies' },
  { title: "البداية", category: 'movies' },
  { title: "اللص والكلاب", category: 'movies' },
  { title: "الخروج من الجنة", category: 'movies' },
  { title: "الطوق والإسورة", category: 'movies' }
];

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

const allItems = [...movies, ...plays, ...songs];

export default function App() {
  const [item, setItem] = useState<Item | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [categorySettings, setCategorySettings] = useState<CategorySettings>({
    movies: true,
    plays: true,
    songs: true,
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'movies': return 'film-outline';
      case 'plays': return 'people-outline';
      case 'songs': return 'musical-notes-outline';
      default: return 'help-outline';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.settingsIcon}
        onPress={() => setShowSettings(true)}
      >
        <Ionicons name="settings-outline" size={32} color="#1976D2" />
      </TouchableOpacity>

      {timeLeft > 0 && (
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      )}
      {item ? (
        <View style={styles.itemContainer}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{getCategoryTitle(item.category)}</Text>
            <Ionicons name={getCategoryIcon(item.category)} size={24} color="#1976D2" style={styles.categoryIcon} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      ) : (
        <Text style={styles.placeholder}>اضغط على الزر للحصول على اقتراح!</Text>
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
                <Text style={[styles.categoryToggleText, categorySettings.movies && styles.categoryToggleTextActive]}>
                  أفلام
                </Text>
                <Ionicons 
                  name="film-outline" 
                  size={24} 
                  color={categorySettings.movies ? '#FFFFFF' : '#424242'} 
                  style={styles.categoryToggleIcon}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryToggle, categorySettings.plays && styles.categoryToggleActive]}
              onPress={() => toggleCategory('plays')}
            >
              <View style={styles.categoryToggleContent}>
                <Text style={[styles.categoryToggleText, categorySettings.plays && styles.categoryToggleTextActive]}>
                  مسرحيات
                </Text>
                <Ionicons 
                  name="people-outline" 
                  size={24} 
                  color={categorySettings.plays ? '#FFFFFF' : '#424242'} 
                  style={styles.categoryToggleIcon}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryToggle, categorySettings.songs && styles.categoryToggleActive]}
              onPress={() => toggleCategory('songs')}
            >
              <View style={styles.categoryToggleContent}>
                <Text style={[styles.categoryToggleText, categorySettings.songs && styles.categoryToggleTextActive]}>
                  أغاني
                </Text>
                <Ionicons 
                  name="musical-notes-outline" 
                  size={24} 
                  color={categorySettings.songs ? '#FFFFFF' : '#424242'} 
                  style={styles.categoryToggleIcon}
                />
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
    backgroundColor: '#FFF8E1', // Slightly darker warm background for better contrast
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
    shadowColor: '#1976D2', // Darker blue for better contrast
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timer: {
    fontSize: 64, // Slightly smaller but still prominent
    fontWeight: '700',
    color: '#E65100', // Darker orange for better contrast
    marginBottom: 40,
    letterSpacing: 2,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
  itemContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    width: '100%',
    shadowColor: '#E65100', // Darker orange shadow
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    height: 32, // Fixed height to ensure consistent vertical alignment
  },
  categoryIcon: {
    marginLeft: 16,
    height: 24, // Match icon size
  },
  categoryToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32, // Fixed height to ensure consistent vertical alignment
  },
  categoryToggleIcon: {
    marginLeft: 16,
    height: 24, // Match icon size
  },
  category: {
    fontSize: 20,
    color: '#1976D2',
    writingDirection: 'rtl',
    fontWeight: '600',
  },
  title: {
    fontSize: 28, // Slightly smaller but still prominent
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    writingDirection: 'rtl',
    color: '#D32F2F', // Darker red for better contrast
  },
  placeholder: {
    fontSize: 20, // Increased font size
    color: '#1976D2', // Darker blue for better contrast
    textAlign: 'center',
    marginBottom: 30,
    writingDirection: 'rtl',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#D32F2F', // Darker red for better contrast
    padding: 15,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#D32F2F', // Darker red shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20, // Increased font size
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for better contrast
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
    fontSize: 26, // Increased font size
    fontWeight: '700',
    color: '#D32F2F', // Darker red for better contrast
    marginBottom: 20,
    writingDirection: 'rtl',
  },
  categoryToggle: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
    alignItems: 'center',
  },
  categoryToggleActive: {
    backgroundColor: '#D32F2F', // Darker red for better contrast
  },
  categoryToggleText: {
    fontSize: 20, // Increased font size
    color: '#424242', // Darker gray for better contrast
    writingDirection: 'rtl',
    fontWeight: '500',
  },
  categoryToggleTextActive: {
    color: '#FFFFFF',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#1976D2', // Darker blue for better contrast
  },
});
