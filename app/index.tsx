import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useState, useEffect } from 'react';

interface Movie {
  title: string;
  year: number;
  genre: string;
}

const movies: Movie[] = [
  {
    title: "The Shawshank Redemption",
    year: 1994,
    genre: "Drama"
  },
  {
    title: "The Godfather",
    year: 1972,
    genre: "Crime/Drama"
  },
  {
    title: "Pulp Fiction",
    year: 1994,
    genre: "Crime/Drama"
  },
  {
    title: "The Dark Knight",
    year: 2008,
    genre: "Action/Drama"
  },
  {
    title: "Fight Club",
    year: 1999,
    genre: "Drama"
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
        <Text style={styles.placeholder}>Click the button to get a movie recommendation!</Text>
      )}
      
      <TouchableOpacity 
        style={[styles.button, timeLeft > 0 && styles.buttonDisabled]}
        onPress={getRandomMovie}
        disabled={timeLeft > 0}
      >
        <Text style={styles.buttonText}>
          {movie ? 'Get Another Movie' : 'Get Movie Recommendation'}
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  details: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 15,
    letterSpacing: 2,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
