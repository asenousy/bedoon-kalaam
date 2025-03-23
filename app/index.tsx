import { View, StyleSheet, TouchableOpacity, Text, I18nManager } from 'react-native';
import { useState, useEffect } from 'react';

// Force RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface Movie {
  title: string;
  year: number;
  genre: string;
}

const movies: Movie[] = [
  {
    title: "شاوشانك ريديمبشن",
    year: 1994,
    genre: "دراما"
  },
  {
    title: "العراب",
    year: 1972,
    genre: "جريمة/دراما"
  },
  {
    title: "بولب فيكشن",
    year: 1994,
    genre: "جريمة/دراما"
  },
  {
    title: "فارس الظلام",
    year: 2008,
    genre: "أكشن/دراما"
  },
  {
    title: "نادي القتال",
    year: 1999,
    genre: "دراما"
  }
];

export default function App() {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

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

  const getRandomMovie = () => {
    const randomIndex = Math.floor(Math.random() * movies.length);
    setMovie(movies[randomIndex]);
    setTimeLeft(120); // 2 minutes in seconds
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {movie ? (
        <View style={styles.movieContainer}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.details}>{movie.year} • {movie.genre}</Text>
          {timeLeft > 0 && (
            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          )}
        </View>
      ) : (
        <Text style={styles.placeholder}>اضغط على الزر للحصول على اقتراح فيلم!</Text>
      )}
      
      <TouchableOpacity 
        style={[styles.button, timeLeft > 0 && styles.buttonDisabled]}
        onPress={getRandomMovie}
        disabled={timeLeft > 0}
      >
        <Text style={styles.buttonText}>
          {movie ? 'اقترح فيلم آخر' : 'احصل على اقتراح فيلم'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  movieContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    writingDirection: 'rtl',
  },
  details: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    writingDirection: 'rtl',
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 15,
    letterSpacing: 2,
    fontFamily: 'System',
  },
  placeholder: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    writingDirection: 'rtl',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
