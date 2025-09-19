// Utility functions for clothing item management

export const generateUniqueId = (): string => {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const validateClothingItem = (item: Partial<any>): boolean => {
  return !!(
    item.name &&
    item.category &&
    item.colors &&
    item.colors.length > 0
  );
};

export const formatColorName = (color: string): string => {
  return color.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
};

export const getSeasonFromCurrentDate = (): string => {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
};

export const getCategoryIcon = (category: string): string => {
  const iconMap: { [key: string]: string } = {
    'top': 'shirt',
    'bottom': 'footsteps',
    'dress': 'woman',
    'shoes': 'footsteps',
    'outerwear': 'umbrella',
    'accessories': 'watch',
    'underwear': 'body'
  };
  
  return iconMap[category] || 'shirt';
};