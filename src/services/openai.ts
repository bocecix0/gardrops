import Constants from 'expo-constants';
import { 
  AIRequest, 
  OutfitSuggestion, 
  ClothingItem, 
  Occasion, 
  Season, 
  Outfit,
  VirtualTryOnRequest,
  VirtualTryOnResult,
  ModelType,
  BodyType,
  PoseType,
  BackgroundType,
  AvatarFeatures,
  PersonalizedAvatar
} from '../types';
import * as FileSystem from 'expo-file-system';
import { googleNanoBananaService } from './googleNanoBanana';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

class OpenAIService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private imageModel: string;
  private imageSize: string;
  private imageQuality: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    this.apiUrl = process.env.EXPO_PUBLIC_OPENAI_API_URL || 'https://api.openai.com/v1';
    this.model = process.env.EXPO_PUBLIC_AI_MODEL || 'gpt-4o-mini';
    this.imageModel = process.env.EXPO_PUBLIC_IMAGE_MODEL || 'dall-e-3';
    this.imageSize = process.env.EXPO_PUBLIC_IMAGE_SIZE || '1024x1024';
    this.imageQuality = process.env.EXPO_PUBLIC_IMAGE_QUALITY || 'standard';
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file');
    }
  }

  private async makeRequest(messages: OpenAIMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: parseInt(process.env.EXPO_PUBLIC_MAX_TOKENS || '1000'),
          temperature: parseFloat(process.env.EXPO_PUBLIC_TEMPERATURE || '0.7'),
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API request failed:', error);
      throw error;
    }
  }

  async generateOutfitSuggestion(request: AIRequest): Promise<OutfitSuggestion> {
    const systemPrompt = `You are a professional fashion stylist AI assistant for the LookSee app. 
    You help users create stylish outfit combinations based on their wardrobe, preferences, and occasion.
    
    IMPORTANT RULES:
    1. ONLY use clothing items provided in the availableItems list
    2. Create outfits using item IDs from the provided list
    3. Consider color coordination, style coherence, and occasion appropriateness
    4. Provide reasoning for your choices
    5. Suggest alternative items for variety
    
    CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include any explanation, markdown formatting, or additional text.
    
    Response format:
    {
      "outfit": {
        "name": "descriptive_outfit_name",
        "itemIds": ["item_id_1", "item_id_2", "item_id_3"],
        "occasion": "occasion_from_request",
        "season": "appropriate_season"
      },
      "confidence": 0.85,
      "reasoning": "Detailed explanation of why this combination works well for the occasion, including color harmony, style coherence, and appropriateness.",
      "alternatives": {
        "top": ["alternative_top_id_1", "alternative_top_id_2"],
        "bottom": ["alternative_bottom_id_1"],
        "shoes": ["alternative_shoe_id_1"]
      },
      "styleNotes": ["tip_1", "tip_2", "tip_3"]
    }`;

    // Prepare the wardrobe context for AI
    const wardrobeContext = this.prepareWardrobeContext(request.availableItems);
    
    const userPrompt = `Create a stylish outfit for the following request:
    
    OCCASION: ${request.occasion}
    SEASON: ${this.getCurrentSeason()}
    ${request.weather ? `WEATHER: ${JSON.stringify(request.weather)}` : ''}
    
    USER PREFERENCES:
    - Style: ${request.userPreferences?.style?.join(', ') || 'Any'}
    - Preferred Colors: ${request.userPreferences?.colors?.join(', ') || 'Any'}
    - Occasions: ${request.userPreferences?.occasions?.join(', ') || 'Any'}
    
    AVAILABLE CLOTHING ITEMS:
    ${wardrobeContext}
    
    ${request.constraints?.length ? `CONSTRAINTS: ${request.constraints.join(', ')}` : ''}
    
    Please create the perfect outfit combination using ONLY the item IDs provided above. Focus on color coordination, style harmony, and appropriateness for the occasion.`;

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: parseInt(process.env.EXPO_PUBLIC_MAX_TOKENS || '1500'),
          temperature: 0.3, // Lower temperature for more consistent styling
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse and validate the response
      let aiResponse;
      try {
        aiResponse = JSON.parse(content);
      } catch (parseError) {
        console.error('JSON Parse Error in outfit generation:', parseError);
        return this.getFallbackSuggestion(request);
      }
      
      // Validate the AI response and create outfit
      return this.validateAndCreateOutfit(aiResponse, request);
      
    } catch (error) {
      console.error('Failed to generate outfit suggestion:', error);
      return this.getFallbackSuggestion(request);
    }
  }

  async analyzeClothingItemFromImage(imageUri: string, userDescription?: string): Promise<Partial<ClothingItem>> {
    const systemPrompt = `You are a professional fashion expert AI that analyzes clothing items from photos.
    
    Your task is to:
    1. Identify the exact clothing type and category
    2. Determine the primary and secondary colors
    3. Suggest appropriate seasons for wearing
    4. Recommend suitable occasions
    5. Provide relevant style tags
    6. Generate a descriptive name
    
    IMPORTANT: Map categories to these exact values:
    - "top" for shirts, blouses, t-shirts, sweaters, jackets worn as tops
    - "bottom" for pants, jeans, skirts, shorts, trousers
    - "dress" for dresses, gowns, jumpsuits
    - "shoes" for all footwear
    - "outerwear" for coats, blazers, cardigans, heavy jackets
    - "accessories" for belts, bags, jewelry, scarves, hats
    - "underwear" for undergarments
    
    CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include any explanation, markdown formatting, or additional text. Just the JSON object.
    
    Response format:
    {
      "name": "Descriptive item name (e.g., 'Blue Cotton Button-Up Shirt')",
      "category": "exact_category_from_list_above",
      "subcategory": "specific_type (e.g., 'button-up shirt', 'skinny jeans')",
      "colors": ["primary_color", "secondary_color"],
      "season": ["spring", "summer", "fall", "winter"],
      "occasion": ["casual", "business", "formal", "party", "sports", "travel", "date", "vacation"],
      "tags": ["style_tags", "material_if_visible", "pattern_if_any"]
    }`;

    try {
      // Convert image to base64 if it's a local file
      const base64Image = await this.convertImageToBase64(imageUri);
      
      const messages = [
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: `Analyze this clothing item image and return ONLY the JSON response as specified in the system prompt. ${userDescription ? `Additional context: ${userDescription}` : ''}`
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ];

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Vision model
          messages,
          max_tokens: 1000,
          temperature: 0.1, // Very low temperature for consistent JSON formatting
          response_format: { type: "json_object" }, // Force JSON response
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse JSON response with better error handling
      let analysisResult;
      try {
        // Clean the response text first
        let cleanedContent = content.trim();
        
        // Remove any markdown code blocks if present
        if (cleanedContent.startsWith('```json')) {
          cleanedContent = cleanedContent.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to find JSON content if there's extra text
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedContent = jsonMatch[0];
        }
        
        analysisResult = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw AI Response:', content);
        
        // Try to extract partial information from text response
        analysisResult = this.extractInfoFromText(content);
      }
      
      // Validate and clean the response
      return this.validateAndCleanAnalysis(analysisResult);
      
    } catch (error) {
      console.error('Failed to analyze clothing item:', error);
      
      // Return a fallback analysis
      return this.getFallbackAnalysis(userDescription);
    }
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      // If it's already a data URL, extract the base64 part
      if (imageUri.startsWith('data:')) {
        return imageUri.split(',')[1];
      }
      
      // For local files, we'll need to read the file
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  private extractInfoFromText(text: string): Partial<ClothingItem> {
    console.log('Attempting to extract info from text response:', text);
    
    // Basic fallback analysis based on common words in the response
    const lowerText = text.toLowerCase();
    
    // Detect category
    let category = 'top';
    if (lowerText.includes('pant') || lowerText.includes('jean') || lowerText.includes('trouser') || lowerText.includes('short')) {
      category = 'bottom';
    } else if (lowerText.includes('dress') || lowerText.includes('gown')) {
      category = 'dress';
    } else if (lowerText.includes('shoe') || lowerText.includes('boot') || lowerText.includes('sneaker')) {
      category = 'shoes';
    } else if (lowerText.includes('jacket') || lowerText.includes('coat') || lowerText.includes('blazer')) {
      category = 'outerwear';
    } else if (lowerText.includes('bag') || lowerText.includes('belt') || lowerText.includes('hat') || lowerText.includes('scarf')) {
      category = 'accessories';
    }
    
    // Detect colors
    const colors = [];
    const colorWords = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'brown', 'gray', 'orange'];
    for (const color of colorWords) {
      if (lowerText.includes(color)) {
        colors.push(color.charAt(0).toUpperCase() + color.slice(1));
      }
    }
    
    if (colors.length === 0) {
      colors.push('Unknown');
    }
    
    // Generate a basic name
    let name = 'Clothing Item';
    if (lowerText.includes('shirt')) name = 'Shirt';
    else if (lowerText.includes('t-shirt') || lowerText.includes('tshirt')) name = 'T-Shirt';
    else if (lowerText.includes('dress')) name = 'Dress';
    else if (lowerText.includes('pant')) name = 'Pants';
    else if (lowerText.includes('jean')) name = 'Jeans';
    
    if (colors.length > 0 && colors[0] !== 'Unknown') {
      name = `${colors[0]} ${name}`;
    }
    
    return {
      name,
      category: category as any,
      subcategory: category,
      colors,
      season: [Season.SPRING, Season.SUMMER],
      occasion: [Occasion.CASUAL],
      tags: ['extracted-from-text']
    };
  }

  private validateAndCleanAnalysis(analysis: any): Partial<ClothingItem> {
    // Validate category mapping
    const validCategories = ['top', 'bottom', 'dress', 'shoes', 'outerwear', 'accessories', 'underwear'];
    const category = validCategories.includes(analysis.category) ? analysis.category : 'top';
    
    // Clean and validate colors
    const colors = Array.isArray(analysis.colors) ? analysis.colors.slice(0, 3) : ['Unknown'];
    
    // Validate seasons
    const validSeasons = ['spring', 'summer', 'fall', 'winter'];
    const seasons = Array.isArray(analysis.season) 
      ? analysis.season.filter((s: string) => validSeasons.includes(s))
      : ['spring', 'summer'];
    
    // Validate occasions
    const validOccasions = ['casual', 'business', 'formal', 'party', 'sports', 'travel', 'date', 'vacation'];
    const occasions = Array.isArray(analysis.occasion)
      ? analysis.occasion.filter((o: string) => validOccasions.includes(o))
      : ['casual'];
    
    return {
      name: analysis.name || 'Clothing Item',
      category: category as any,
      subcategory: analysis.subcategory || '',
      colors,
      season: seasons,
      occasion: occasions,
      tags: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 5) : []
    };
  }

  private getFallbackAnalysis(userDescription?: string): Partial<ClothingItem> {
    return {
      name: userDescription || 'Clothing Item',
      category: 'top' as any,
      subcategory: 'shirt',
      colors: ['Unknown'],
      season: [Season.SPRING, Season.SUMMER],
      occasion: [Occasion.CASUAL],
      tags: ['basic']
    };
  }

  private prepareWardrobeContext(items: ClothingItem[]): string {
    return items
      .filter(item => item.isAvailable)
      .map(item => {
        return `ID: ${item.id}
Name: ${item.name}
Category: ${item.category}
Colors: ${item.colors.join(', ')}
Season: ${item.season.join(', ')}
Occasion: ${item.occasion.join(', ')}
Brand: ${item.brand || 'Unknown'}${item.tags.length ? `
Tags: ${item.tags.join(', ')}` : ''}
---`;
      })
      .join('\n');
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  }

  private validateAndCreateOutfit(aiResponse: any, request: AIRequest): OutfitSuggestion {
    try {
      // Validate the AI response structure
      if (!aiResponse.outfit || !aiResponse.outfit.itemIds || !Array.isArray(aiResponse.outfit.itemIds)) {
        console.log('Invalid AI response structure, using fallback');
        throw new Error('Invalid outfit structure in AI response');
      }

      // Filter valid item IDs and log for debugging
      const validItemIds = aiResponse.outfit.itemIds.filter((id: string) => {
        const exists = request.availableItems.some(item => item.id === id);
        if (!exists) {
          console.log(`Item ID ${id} not found in available items`);
        }
        return exists;
      });

      console.log(`Found ${validItemIds.length} valid items out of ${aiResponse.outfit.itemIds.length} suggested`);

      // If we have few valid items, try to add some fallback items
      if (validItemIds.length < 2 && request.availableItems.length >= 2) {
        console.log('Adding fallback items to ensure minimum outfit size');
        const additionalItems = request.availableItems
          .filter(item => !validItemIds.includes(item.id) && item.isAvailable)
          .slice(0, 3 - validItemIds.length)
          .map(item => item.id);
        validItemIds.push(...additionalItems);
      }

      if (validItemIds.length === 0) {
        console.log('No valid items found, throwing error for fallback');
        throw new Error('No valid items found in AI suggestion');
      }

      // Get the actual clothing items
      const outfitItems = validItemIds.map((id: string) => 
        request.availableItems.find(item => item.id === id)
      ).filter(Boolean) as ClothingItem[];

      console.log(`Created outfit with ${outfitItems.length} items`);

      // Create the outfit object
      const outfit: Outfit = {
        id: `ai_generated_${Date.now()}`,
        name: aiResponse.outfit.name || `${request.occasion} Outfit`,
        items: outfitItems,
        occasion: request.occasion,
        season: aiResponse.outfit.season || this.getCurrentSeason(),
        isGenerated: true,
        dateCreated: new Date().toISOString(), // Convert to string
        rating: undefined
      };

      // Process alternatives
      const alternatives: ClothingItem[][] = [];
      if (aiResponse.alternatives && typeof aiResponse.alternatives === 'object') {
        Object.values(aiResponse.alternatives).forEach((altIds: any) => {
          if (Array.isArray(altIds)) {
            const altItems = altIds
              .map((id: string) => request.availableItems.find(item => item.id === id))
              .filter(Boolean) as ClothingItem[];
            if (altItems.length > 0) {
              alternatives.push(altItems);
            }
          }
        });
      }

      return {
        outfit,
        confidence: Math.min(Math.max(aiResponse.confidence || 0.7, 0), 1),
        reasoning: aiResponse.reasoning || 'AI-generated stylish combination',
        alternatives
      };

    } catch (error) {
      console.error('Error validating AI outfit response:', error);
      throw error;
    }
  }

  private getFallbackSuggestion(request: AIRequest): OutfitSuggestion {
    // Smart fallback logic - create a basic but coordinated outfit
    const availableItems = request.availableItems.filter(item => item.isAvailable);
    const selectedItems: ClothingItem[] = [];
    
    // Try to get one item from each main category based on occasion
    const preferredCategories = this.getCategoriesForOccasion(request.occasion);
    
    preferredCategories.forEach(category => {
      const categoryItems = availableItems.filter(item => 
        item.category === category && 
        item.occasion.includes(request.occasion)
      );
      
      if (categoryItems.length === 0) {
        // Fallback to any item in this category
        const anyItem = availableItems.find(item => item.category === category);
        if (anyItem) selectedItems.push(anyItem);
      } else {
        // Pick the first suitable item
        selectedItems.push(categoryItems[0]);
      }
    });

    // If we don't have enough items, add any available items
    if (selectedItems.length < 2) {
      availableItems
        .filter(item => !selectedItems.includes(item))
        .slice(0, 3 - selectedItems.length)
        .forEach(item => selectedItems.push(item));
    }

    return {
      outfit: {
        id: `fallback_${Date.now()}`,
        name: `${request.occasion} Outfit`,
        items: selectedItems,
        occasion: request.occasion,
        season: this.getCurrentSeason() as any,
        isGenerated: true,
        dateCreated: new Date().toISOString(), // Convert to string
        rating: undefined
      },
      confidence: 0.5,
      reasoning: 'Basic combination of available items suitable for the occasion',
      alternatives: []
    };
  }

  private getCategoriesForOccasion(occasion: Occasion): string[] {
    const occasionMap = {
      [Occasion.CASUAL]: ['top', 'bottom', 'shoes'],
      [Occasion.BUSINESS]: ['top', 'bottom', 'shoes', 'outerwear'],
      [Occasion.FORMAL]: ['top', 'bottom', 'shoes', 'outerwear'],
      [Occasion.PARTY]: ['dress', 'top', 'bottom', 'shoes'],
      [Occasion.SPORTS]: ['top', 'bottom', 'shoes'],
      [Occasion.DATE]: ['dress', 'top', 'bottom', 'shoes'],
      [Occasion.TRAVEL]: ['top', 'bottom', 'shoes', 'outerwear'],
      [Occasion.VACATION]: ['top', 'bottom', 'shoes', 'dress']
    };
    
    return occasionMap[occasion] || ['top', 'bottom', 'shoes'];
  }

  /**
   * Generate virtual try-on image using DALL-E
   */
  async generateVirtualTryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResult> {
    const startTime = Date.now();
    
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Create detailed prompt for outfit visualization
      const prompt = this.createTryOnPrompt(request);
      
      console.log('Generated prompt for virtual try-on:', prompt);

      const response = await fetch(`${this.apiUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.imageModel,
          prompt: prompt,
          size: this.imageSize,
          quality: this.imageQuality,
          n: 1,
          response_format: 'url'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DALL-E API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const imageUrl = data.data[0]?.url;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E');
      }

      const processingTime = Date.now() - startTime;

      return {
        imageUrl,
        confidence: 0.9, // DALL-E generally produces high-quality results
        processingTime,
        modelUsed: this.imageModel
      };
    } catch (error) {
      console.error('Virtual try-on generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate virtual try-on using Google's Nano Banana API (fallback option)
   */
  async generateVirtualTryOnWithNanoBanana(request: VirtualTryOnRequest): Promise<VirtualTryOnResult> {
    try {
      // Try to use Google's Nano Banana API
      console.log('Attempting to use Google Nano Banana API for virtual try-on');
      return await googleNanoBananaService.generateVirtualTryOn(request);
    } catch (error) {
      console.error('Google Nano Banana API failed, falling back to DALL-E:', error);
      // Fallback to DALL-E if Nano Banana fails
      return await this.generateVirtualTryOn(request);
    }
  }

  /**
   * Create detailed prompt for virtual try-on
   */
  private createTryOnPrompt(request: VirtualTryOnRequest): string {
    const { outfit, modelType = ModelType.CASUAL_FEMALE, bodyType = BodyType.HOURGLASS, pose = PoseType.STANDING, background = BackgroundType.STUDIO } = request;
    
    // Model description based on type
    const modelDescription = this.getModelDescription(modelType, bodyType);
    
    // Outfit description
    const outfitDescription = this.getOutfitDescription(outfit);
    
    // Pose and setting description
    const poseDescription = this.getPoseDescription(pose);
    const backgroundDescription = this.getBackgroundDescription(background);
    
    // Style and quality modifiers
    const styleModifiers = [
      'high fashion photography',
      'professional lighting',
      'sharp focus',
      'detailed fabric textures',
      'realistic proportions',
      'stylish pose',
      'modern fashion aesthetic'
    ].join(', ');

    const prompt = `A ${modelDescription} wearing ${outfitDescription}, ${poseDescription} in a ${backgroundDescription}. ${styleModifiers}. The clothing should fit naturally and look realistic on the model. High quality, detailed, photorealistic style.`;
    
    return prompt;
  }

  private getModelDescription(modelType: ModelType, bodyType: BodyType): string {
    const gender = modelType.includes('male') ? (modelType.includes('female') ? 'female' : 'male') : 'person';
    const style = modelType.split('_')[0]; // casual, business, formal
    
    const bodyTypeDescriptions = {
      [BodyType.HOURGLASS]: 'hourglass figure with balanced proportions',
      [BodyType.PEAR]: 'pear-shaped body with wider hips',
      [BodyType.APPLE]: 'apple-shaped body with broader midsection',
      [BodyType.RECTANGLE]: 'rectangular body shape with straight silhouette',
      [BodyType.INVERTED_TRIANGLE]: 'inverted triangle body with broader shoulders'
    };

    return `${style} ${gender} model with ${bodyTypeDescriptions[bodyType]}`;
  }

  private getOutfitDescription(outfit: Outfit): string {
    const descriptions: string[] = [];
    
    outfit.items.forEach(item => {
      const colorStr = item.colors.join(' and ');
      const itemDesc = `${colorStr} ${item.subcategory || item.category}`;
      
      if (item.brand) {
        descriptions.push(`${item.brand} ${itemDesc}`);
      } else {
        descriptions.push(itemDesc);
      }
    });

    return descriptions.join(', ');
  }

  private getPoseDescription(pose: PoseType): string {
    const poseDescriptions = {
      [PoseType.STANDING]: 'standing confidently with good posture',
      [PoseType.WALKING]: 'walking naturally with movement',
      [PoseType.SITTING]: 'sitting elegantly',
      [PoseType.CASUAL_POSE]: 'in a relaxed, casual pose'
    };

    return poseDescriptions[pose];
  }

  private getBackgroundDescription(background: BackgroundType): string {
    const backgroundDescriptions = {
      [BackgroundType.NEUTRAL]: 'clean neutral background',
      [BackgroundType.STUDIO]: 'professional photography studio with soft lighting',
      [BackgroundType.OUTDOOR]: 'natural outdoor setting',
      [BackgroundType.INDOOR]: 'modern indoor environment',
      [BackgroundType.TRANSPARENT]: 'clean white background'
    };

    return backgroundDescriptions[background];
  }

  /**
   * Enhanced avatar prompt generation for personalized avatars
   */
  async enhanceAvatarPrompt(basePrompt: string, features: AvatarFeatures): Promise<string> {
    try {
      if (!this.apiKey) {
        console.warn('OpenAI API key not available, returning base prompt');
        return basePrompt;
      }

      const systemPrompt = `You are an expert in creating detailed, consistent AI image generation prompts for personalized 2D avatars. Your task is to enhance and optimize avatar descriptions for DALL-E image generation.

Guidelines:
1. Create consistent, repeatable descriptions
2. Focus on 2D illustration/avatar style
3. Ensure the description works well for virtual clothing try-on
4. Maintain anatomical accuracy and realistic proportions
5. Use professional, descriptive language
6. Keep the avatar in a neutral, front-facing pose
7. Emphasize features that will help with clothing visualization

Enhance the following avatar description while keeping it concise but detailed:`;

      const userPrompt = `Please enhance this avatar description for DALL-E image generation:

${basePrompt}

Return an optimized prompt that will generate a consistent, high-quality 2D avatar suitable for virtual clothing try-on. The avatar should be front-facing, neutral pose, with clear body proportions and features.`;

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 800,
          temperature: 0.3, // Lower temperature for more consistent results
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const enhancedPrompt = data.choices[0]?.message?.content;
      
      return enhancedPrompt || basePrompt;
    } catch (error) {
      console.error('Failed to enhance avatar prompt:', error);
      return basePrompt; // Return original prompt as fallback
    }
  }

  /**
   * Generate virtual try-on with personalized avatar
   */
  async generatePersonalizedTryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResult> {
    const startTime = Date.now();
    
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      let prompt: string;
      
      if (request.avatar) {
        // Use personalized avatar
        prompt = this.createPersonalizedTryOnPrompt(request);
      } else {
        // Fallback to generic model
        prompt = this.createTryOnPrompt(request);
      }
      
      console.log('Generated personalized try-on prompt:', prompt);

      const response = await fetch(`${this.apiUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.imageModel,
          prompt: prompt,
          size: this.imageSize,
          quality: this.imageQuality,
          n: 1,
          response_format: 'url'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DALL-E API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const imageUrl = data.data[0]?.url;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E');
      }

      const processingTime = Date.now() - startTime;

      return {
        imageUrl,
        confidence: 0.95, // Higher confidence for personalized avatars
        processingTime,
        modelUsed: this.imageModel
      };
    } catch (error) {
      console.error('Personalized virtual try-on generation failed:', error);
      throw error;
    }
  }

  /**
   * Create personalized try-on prompt using user's avatar
   */
  private createPersonalizedTryOnPrompt(request: VirtualTryOnRequest): string {
    const { outfit, avatar, pose = PoseType.STANDING, background = BackgroundType.STUDIO } = request;
    
    if (!avatar) {
      return this.createTryOnPrompt(request);
    }

    // Use the avatar's enhanced base prompt as foundation
    const avatarDescription = avatar.basePrompt;
    
    // Get detailed outfit description
    const outfitDescription = this.getDetailedOutfitDescription(outfit);
    
    // Enhanced pose and setting description
    const poseDescription = this.getEnhancedPoseDescription(pose);
    const backgroundDescription = this.getBackgroundDescription(background);
    
    // Advanced style and quality modifiers for avatar consistency
    const avatarStyleModifiers = [
      'maintain exact avatar consistency',
      'preserve avatar\'s unique physical characteristics',
      'professional fashion photography',
      'studio lighting with soft shadows',
      'ultra-sharp focus on fabric details',
      'realistic clothing drape and fit',
      'natural body proportions',
      'high-end fashion presentation',
      'photorealistic rendering',
      'consistent avatar features throughout',
      'clothing fits naturally on this specific body type',
      'maintain avatar\'s skin tone and physical attributes',
      'seamless clothing integration'
    ].join(', ');

    const enhancedPrompt = `${avatarDescription}

OUTFIT DETAILS:
${outfitDescription}

POSE AND SETTING:
${poseDescription} in a ${backgroundDescription}

STYLE REQUIREMENTS:
${avatarStyleModifiers}

IMPORTANT: The avatar must remain exactly consistent with the physical description above. The clothing should fit perfectly and naturally on this specific avatar's body type, proportions, and physical characteristics. High quality, detailed, photorealistic style with consistent avatar features. The avatar's unique physical traits (body type, skin tone, facial features, etc.) must be preserved exactly as described.`;
    
    return enhancedPrompt;
  }

  /**
   * Get detailed outfit description for enhanced prompt engineering
   */
  private getDetailedOutfitDescription(outfit: Outfit): string {
    const itemDescriptions = outfit.items.map(item => {
      const colors = item.colors.join(', ');
      const occasions = item.occasion.join(', ');
      return `- ${item.name}: ${item.category} in ${colors}, suitable for ${occasions}`;
    }).join('\n');

    return `The avatar is wearing a complete outfit called "${outfit.name}":\n${itemDescriptions}\n\nThe outfit should look cohesive and well-coordinated, with all pieces working together harmoniously.`;
  }

  /**
   * Get enhanced pose description with more detail
   */
  private getEnhancedPoseDescription(pose: PoseType): string {
    const poseDescriptions = {
      [PoseType.STANDING]: 'standing confidently with natural posture, slight weight shift, relaxed shoulders',
      [PoseType.WALKING]: 'mid-stride walking pose with dynamic movement, one foot forward, natural arm swing',
      [PoseType.SITTING]: 'elegantly seated with good posture, legs positioned naturally, hands relaxed',
      [PoseType.CASUAL_POSE]: 'relaxed casual pose with natural body language, comfortable stance'
    };
    
    return poseDescriptions[pose] || poseDescriptions[PoseType.STANDING];
  }
}

export const openAIService = new OpenAIService();