import { useState, useEffect } from 'react';
import { WeatherInfo, ClothingItem, ClothingCategory, Season, Occasion } from '../types';
import { weatherService } from '../services/weather';
import { openAIService } from '../services/openai';
import { useWardrobe } from './useWardrobe';

export interface WeatherOutfitSuggestion {
  items: {
    top?: ClothingItem;
    bottom?: ClothingItem;
    outerwear?: ClothingItem;
    shoes?: ClothingItem;
    accessories?: ClothingItem[];
  };
  reasoning: string;
  confidence: number;
}

export const useWeatherOutfit = () => {
  const [weather, setWeather] = useState<(WeatherInfo & { city: string }) | null>(null);
  const [outfitSuggestion, setOutfitSuggestion] = useState<WeatherOutfitSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);
  const { state } = useWardrobe();

  useEffect(() => {
    loadWeatherAndOutfit();
  }, []);

  const loadWeatherAndOutfit = async () => {
    try {
      setIsLoading(true);
      
      // Get weather data
      const weatherData = await weatherService.getWeatherInfo();
      setWeather(weatherData);

      // Generate outfit suggestion based on weather
      await generateWeatherOutfit(weatherData);
    } catch (error) {
      console.error('Error loading weather and outfit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeatherOutfit = async (weatherData: WeatherInfo) => {
    try {
      setIsGeneratingOutfit(true);

      // Get available items from wardrobe
      const availableItems = state.clothingItems?.filter((item: ClothingItem) => item.isAvailable) || [];
      
      if (availableItems.length === 0) {
        // Create mock outfit if no items available
        setOutfitSuggestion(createMockOutfit(weatherData));
        return;
      }

      // Generate AI-powered outfit suggestion
      const prompt = createWeatherOutfitPrompt(weatherData, availableItems);
      const aiResponse = await openAIService.generateOutfitSuggestion({
        userPreferences: state.userProfile?.preferences || {
          bodyType: 'hourglass' as any,
          style: [],
          colors: [],
          brands: [],
          occasions: []
        },
        availableItems,
        occasion: Occasion.CASUAL,
        weather: weatherData
      });

      // Parse AI response into our format
      const suggestion: WeatherOutfitSuggestion = {
        items: categorizeOutfitItems(aiResponse.outfit.items),
        reasoning: aiResponse.reasoning,
        confidence: aiResponse.confidence
      };

      setOutfitSuggestion(suggestion);
    } catch (error) {
      console.error('Error generating weather outfit:', error);
      // Fallback to mock outfit
      setOutfitSuggestion(createMockOutfit(weatherData));
    } finally {
      setIsGeneratingOutfit(false);
    }
  };

  const createWeatherOutfitPrompt = (weather: WeatherInfo, items: ClothingItem[]): string => {
    return `
    Current weather: ${weather.condition}, ${weather.temperature}°C
    Available clothing items: ${items.map(item => `${item.name} (${item.category})`).join(', ')}
    
    Please suggest a complete outfit that's appropriate for this weather.
    Consider comfort, style, and weather appropriateness.
    `;
  };

  const categorizeOutfitItems = (items: ClothingItem[]) => {
    const categorized: any = {
      accessories: []
    };

    items.forEach(item => {
      switch (item.category) {
        case ClothingCategory.TOP:
          categorized.top = item;
          break;
        case ClothingCategory.BOTTOM:
          categorized.bottom = item;
          break;
        case ClothingCategory.OUTERWEAR:
          categorized.outerwear = item;
          break;
        case ClothingCategory.SHOES:
          categorized.shoes = item;
          break;
        case ClothingCategory.ACCESSORIES:
          categorized.accessories.push(item);
          break;
      }
    });

    return categorized;
  };

  const createMockOutfit = (weather: WeatherInfo): WeatherOutfitSuggestion => {
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();

    let reasoning = '';
    const items: any = { accessories: [] };

    // Generate reasoning based on weather
    if (temp > 25) {
      reasoning = `It's quite warm today at ${temp}°C. I recommend light, breathable fabrics to keep you comfortable. `;
      if (condition.includes('sunny')) {
        reasoning += 'The sunny weather calls for sun protection with stylish accessories.';
      }
    } else if (temp > 15) {
      reasoning = `The temperature is pleasant at ${temp}°C. Perfect for layering! `;
      if (condition.includes('cloudy')) {
        reasoning += 'The cloudy weather allows for versatile styling without worrying about strong sun.';
      }
    } else {
      reasoning = `It's quite cool at ${temp}°C. I suggest layering for warmth and comfort. `;
      if (condition.includes('rain')) {
        reasoning += 'Don\'t forget a waterproof layer for the rainy weather!';
      }
    }

    // Add outfit recommendations based on temperature
    if (temp > 25) {
      reasoning += ' A light top with comfortable bottoms and breathable shoes would be perfect.';
    } else if (temp > 15) {
      reasoning += ' A comfortable top with a light jacket and versatile bottoms work great.';
    } else {
      reasoning += ' A warm top with a cozy outerwear piece and protective footwear are essential.';
    }

    return {
      items,
      reasoning,
      confidence: 0.8
    };
  };

  const refreshOutfit = async () => {
    if (weather) {
      await generateWeatherOutfit(weather);
    }
  };

  return {
    weather,
    outfitSuggestion,
    isLoading,
    isGeneratingOutfit,
    refreshOutfit,
    loadWeatherAndOutfit
  };
};