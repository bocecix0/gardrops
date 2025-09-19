import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ClothingCategory, Season, Occasion, ClothingItem, RootStackParamList } from '../types';
import { useEnhancedImageAnalysis } from '../hooks/useEnhancedImageAnalysis';
import { useWardrobe } from '../hooks/useWardrobe';
import { generateUniqueId } from '../utils/clothingUtils';
import { useTheme } from '../hooks/useTheme';
import PrimaryButton from '../components/PrimaryButton';
import CustomInput from '../components/CustomInput';
import CustomCard from '../components/CustomCard';
import CustomHeader from '../components/CustomHeader';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AddItemScreen() {
  const { colors, typography, spacing } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { processingStatus, processImage, isBackgroundRemovalAvailable } = useEnhancedImageAnalysis();
  const { addClothingItem, state } = useWardrobe();
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>([]);
  const [brand, setBrand] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [enableBackgroundRemoval, setEnableBackgroundRemoval] = useState(true);

  const categories = [
    { key: ClothingCategory.TOP, label: 'Top', icon: 'shirt' },
    { key: ClothingCategory.BOTTOM, label: 'Bottom', icon: 'footsteps' },
    { key: ClothingCategory.DRESS, label: 'Dress', icon: 'woman' },
    { key: ClothingCategory.SHOES, label: 'Shoes', icon: 'footsteps' },
    { key: ClothingCategory.OUTERWEAR, label: 'Outerwear', icon: 'umbrella' },
    { key: ClothingCategory.ACCESSORIES, label: 'Accessories', icon: 'watch' },
  ];

  const colorOptions = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#ffffff' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
  ];

  const seasons = [
    { key: Season.SPRING, label: 'Spring', icon: 'flower' },
    { key: Season.SUMMER, label: 'Summer', icon: 'sunny' },
    { key: Season.FALL, label: 'Fall', icon: 'leaf' },
    { key: Season.WINTER, label: 'Winter', icon: 'snow' },
  ];

  const occasions = [
    { key: Occasion.CASUAL, label: 'Casual' },
    { key: Occasion.BUSINESS, label: 'Business' },
    { key: Occasion.FORMAL, label: 'Formal' },
    { key: Occasion.DATE, label: 'Date' },
    { key: Occasion.PARTY, label: 'Party' },
    { key: Occasion.SPORTS, label: 'Sports' },
  ];

  const toggleSelection = <T,>(item: T, selectedArray: T[], setArray: (items: T[]) => void) => {
    if (selectedArray.includes(item)) {
      setArray(selectedArray.filter(i => i !== item));
    } else {
      setArray([...selectedArray, item]);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to add photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show picker options
      Alert.alert(
        'Select Image',
        'Choose how you want to add a photo',
        [
          {
            text: 'Camera',
            onPress: () => openCamera()
          },
          {
            text: 'Photo Library',
            onPress: () => openImageLibrary()
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        await analyzeImageAndFillForm(uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        await analyzeImageAndFillForm(uri);
      }
    } catch (error) {
      console.error('Error opening image library:', error);
    }
  };

  const analyzeImageAndFillForm = async (uri: string) => {
    const result = await processImage(uri, undefined, enableBackgroundRemoval);
    
    if (result.analysis) {
      // Show success message that AI filled the form
      setIsAutoFilled(true);
      
      // Set processed image if background removal was successful
      if (result.processedImage) {
        setProcessedImageUri(result.processedImage);
      }
      
      // Auto-fill the form with AI analysis results
      if (result.analysis.name) setItemName(result.analysis.name);
      if (result.analysis.category) setSelectedCategory(result.analysis.category as ClothingCategory);
      if (result.analysis.subcategory) setSubcategory(result.analysis.subcategory);
      if (result.analysis.colors) setSelectedColors(result.analysis.colors);
      if (result.analysis.season) setSelectedSeasons(result.analysis.season as Season[]);
      if (result.analysis.occasion) setSelectedOccasions(result.analysis.occasion as Occasion[]);
      if (result.analysis.tags) setTags(result.analysis.tags);
      if (result.analysis.brand) setBrand(result.analysis.brand);
    }
  };

  const handleSave = async () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!imageUri) {
      Alert.alert('Error', 'Please add an image');
      return;
    }

    setIsSaving(true);

    try {
      const newItem: ClothingItem = {
        id: generateUniqueId(),
        name: itemName.trim(),
        category: selectedCategory,
        subcategory: subcategory.trim(),
        colors: selectedColors,
        season: selectedSeasons,
        occasion: selectedOccasions,
        brand: brand.trim(),
        tags: tags,
        imageUri: processedImageUri || imageUri,
        dateAdded: new Date().toISOString(),
        isAvailable: true,
      };

      await addClothingItem(newItem);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderImagePicker = () => (
    <CustomCard title="Item Image" icon="image">
      <TouchableOpacity 
        style={styles.imagePicker}
        onPress={handleImagePicker}
      >
        {imageUri ? (
          <Image 
            source={{ uri: processedImageUri || imageUri }} 
            style={styles.imagePreview} 
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera" size={48} color={colors.primary} />
            <Text style={styles.imagePlaceholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {isBackgroundRemovalAvailable && (
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Remove Background</Text>
          <Switch
            value={enableBackgroundRemoval}
            onValueChange={setEnableBackgroundRemoval}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={enableBackgroundRemoval ? colors.primary : colors.surface}
          />
        </View>
      )}
    </CustomCard>
  );

  const renderCategorySelection = () => (
    <CustomCard title="Category" icon="shirt">
      <View style={styles.selectionGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.selectionItem,
              selectedCategory === category.key && styles.selectionItemSelected,
            ]}
            onPress={() => setSelectedCategory(category.key as ClothingCategory)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={24} 
              color={selectedCategory === category.key ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.selectionItemText,
                selectedCategory === category.key && styles.selectionItemTextSelected,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </CustomCard>
  );

  const renderColorSelection = () => (
    <CustomCard title="Colors" icon="color-palette">
      <View style={styles.selectionGrid}>
        {colorOptions.map((color) => (
          <TouchableOpacity
            key={color.name}
            style={[
              styles.colorItem,
              { backgroundColor: color.value },
              selectedColors.includes(color.name) && styles.colorItemSelected,
            ]}
            onPress={() => toggleSelection(color.name, selectedColors, setSelectedColors)}
          >
            {selectedColors.includes(color.name) && (
              <Ionicons name="checkmark" size={20} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </CustomCard>
  );

  const renderSeasonSelection = () => (
    <CustomCard title="Seasons" icon="calendar">
      <View style={styles.selectionGrid}>
        {seasons.map((season) => (
          <TouchableOpacity
            key={season.key}
            style={[
              styles.selectionItem,
              selectedSeasons.includes(season.key) && styles.selectionItemSelected,
            ]}
            onPress={() => toggleSelection(season.key, selectedSeasons, setSelectedSeasons)}
          >
            <Ionicons 
              name={season.icon as any} 
              size={24} 
              color={selectedSeasons.includes(season.key) ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.selectionItemText,
                selectedSeasons.includes(season.key) && styles.selectionItemTextSelected,
              ]}
            >
              {season.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </CustomCard>
  );

  const renderOccasionSelection = () => (
    <CustomCard title="Occasions" icon="star">
      <View style={styles.chipContainer}>
        {occasions.map((occasion) => (
          <TouchableOpacity
            key={occasion.key}
            style={[
              styles.chip,
              selectedOccasions.includes(occasion.key) && styles.chipSelected,
            ]}
            onPress={() => toggleSelection(occasion.key, selectedOccasions, setSelectedOccasions)}
          >
            <Text 
              style={[
                styles.chipText,
                selectedOccasions.includes(occasion.key) && styles.chipTextSelected,
              ]}
            >
              {occasion.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </CustomCard>
  );

  const renderTextInputFields = () => (
    <View style={styles.textInputContainer}>
      <CustomInput
        label="Item Name"
        placeholder="e.g., Blue T-Shirt"
        value={itemName}
        onChangeText={setItemName}
        icon="shirt"
      />
      
      <CustomInput
        label="Brand (Optional)"
        placeholder="e.g., Nike, Zara"
        value={brand}
        onChangeText={setBrand}
        icon="pricetag"
      />
      
      <CustomInput
        label="Subcategory (Optional)"
        placeholder="e.g., T-Shirt, Jeans"
        value={subcategory}
        onChangeText={setSubcategory}
        icon="pricetag"
      />
      
      <CustomInput
        label="Tags (Optional)"
        placeholder="e.g., casual, summer"
        value={tags.join(', ')}
        onChangeText={(text) => setTags(text.split(',').map(tag => tag.trim()).filter(tag => tag))}
        icon="pricetags"
      />
    </View>
  );

  if (processingStatus.isProcessing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Analyzing your item..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderImagePicker()}
        {renderTextInputFields()}
        {renderCategorySelection()}
        {renderColorSelection()}
        {renderSeasonSelection()}
        {renderOccasionSelection()}
        
        <PrimaryButton
          title={isSaving ? "Saving..." : "Save Item"}
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving}
          icon="save"
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  imagePicker: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  textInputContainer: {
    marginBottom: 16,
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  selectionItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectionItemSelected: {
    backgroundColor: '#F0F4FF',
    borderColor: '#6366F1',
  },
  selectionItemText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  selectionItemTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorItemSelected: {
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  chipSelected: {
    backgroundColor: '#6366F1',
  },
  chipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: 'white',
  },
  saveButton: {
    marginTop: 16,
  },
});