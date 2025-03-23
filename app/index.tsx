import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';

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

  const getRandomMovie = () => {
    const randomIndex = Math.floor(Math.random() * movies.length);
    setMovie(movies[randomIndex]);
  };

  return (
    <View style={styles.container}>
      {movie ? (
        <View style={styles.movieContainer}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.details}>{movie.year} • {movie.genre}</Text>
        </View>
      ) : (
        <Text style={styles.placeholder}>Click the button to get a movie recommendation!</Text>
      )}
      
      <TouchableOpacity 
        style={styles.button}
        onPress={getRandomMovie}
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
