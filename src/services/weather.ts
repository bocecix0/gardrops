import * as Location from 'expo-location';
import { WeatherInfo } from '../types';

interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
  wind: {
    speed: number;
  };
  name: string;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor() {
    // For demo purposes, using a free API key or you can add your own
    this.apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY || 'demo';
  }

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number; city: string }> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Return default location if permission denied
        return {
          latitude: 41.0082,
          longitude: 28.9784,
          city: 'Istanbul'
        };
      }

      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const city = reverseGeocode[0]?.city || 'Unknown City';

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city
      };
    } catch (error) {
      console.error('Error getting location:', error);
      // Return default location
      return {
        latitude: 41.0082,
        longitude: 28.9784,
        city: 'Istanbul'
      };
    }
  }

  async getWeatherInfo(latitude?: number, longitude?: number): Promise<WeatherInfo & { city: string }> {
    try {
      let lat = latitude;
      let lon = longitude;
      let city = 'Istanbul';

      if (!lat || !lon) {
        const location = await this.getCurrentLocation();
        lat = location.latitude;
        lon = location.longitude;
        city = location.city;
      }

      // If no API key, return mock data
      if (this.apiKey === 'demo') {
        return this.getMockWeatherData(city);
      }

      const response = await fetch(
        `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: OpenWeatherResponse = await response.json();

      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main.toLowerCase(),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        city: data.name || city
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Return mock data as fallback
      return this.getMockWeatherData('Istanbul');
    }
  }

  private getMockWeatherData(city: string): WeatherInfo & { city: string } {
    // Generate realistic mock weather data
    const conditions = ['sunny', 'cloudy', 'rainy', 'partly_cloudy'];
    const temps = [15, 18, 22, 25, 28];
    
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const randomTemp = temps[Math.floor(Math.random() * temps.length)];

    return {
      temperature: randomTemp,
      condition: randomCondition,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
      city
    };
  }

  getWeatherIcon(condition: string): string {
    const iconMap: { [key: string]: string } = {
      'sunny': 'sunny',
      'clear': 'sunny',
      'cloudy': 'cloudy',
      'clouds': 'cloudy',
      'partly_cloudy': 'partly-sunny',
      'rainy': 'rainy',
      'rain': 'rainy',
      'snowy': 'snow',
      'snow': 'snow',
      'stormy': 'thunderstorm',
      'thunderstorm': 'thunderstorm'
    };

    return iconMap[condition.toLowerCase()] || 'partly-sunny';
  }

  getWeatherDescription(condition: string, temperature: number): string {
    const temp = temperature;
    const cond = condition.toLowerCase();

    if (cond.includes('sunny') || cond.includes('clear')) {
      if (temp > 25) return 'Hot and sunny';
      if (temp > 20) return 'Warm and sunny';
      return 'Cool and sunny';
    }

    if (cond.includes('rain')) {
      return 'Rainy weather';
    }

    if (cond.includes('cloud')) {
      if (temp > 20) return 'Warm and cloudy';
      return 'Cool and cloudy';
    }

    if (cond.includes('snow')) {
      return 'Cold and snowy';
    }

    return 'Mixed weather';
  }
}

export const weatherService = new WeatherService();