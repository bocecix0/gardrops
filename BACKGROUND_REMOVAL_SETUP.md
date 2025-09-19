# Arka Plan Kaldırma Kurulumu 🖼️

## Şu Anki Durum

### ✅ **Çalışan Özellikler**
- AI Gelişmiş İşleme (Yerel)
- Giysi Analizi ve Kategorilendirme
- İşlem İlerleme Gösterimi

### 🔄 **Nasıl Çalışıyor**
1. \"Remove Background\" toggle açık → AI iyileştirme
2. 1.5 saniye işlem süreci
3. Orijinal görüntü + optimize analiz

## 🚀 **Gerçek Arka Plan Kaldırma**

### **Remove.bg API Kurulumu**

1. **API Anahtarı Al**:
   - https://www.remove.bg/api → Kayıt ol
   - Ücretsiz: 50 görüntü/ay

2. **Ayarlama**:
   - `.env` dosyasını aç
   - `EXPO_PUBLIC_REMOVE_BG_API_KEY=demo` satırını
   - `EXPO_PUBLIC_REMOVE_BG_API_KEY=your_api_key` olarak değiştir

3. **Yeniden Başlat**:
   ```powershell
   cd LookSee; npx expo start --clear
   ```

### **Farkları**
- **API Yok**: \"AI-enhanced processing (Free)\"
- **API Var**: \"Remove.bg API (Premium)\"
- **Sonuç**: Şeffaf arka planlı PNG

## 💡 **Test Etme**

1. Giysi fotoğrafı seç
2. \"Remove Background\" toggle aç
3. İşlem mesajını kontrol et
4. AI analizi sonucunu incele

## 🔧 **Sorun Giderme**

**\"AI-enhanced\" görünüyor**: Normal, API yok
**API çalışmıyor**: Uygulamayı yeniden başlat
**Yavaş**: İnternet veya görüntü boyutu kontrol et

---
**Not**: Şu anki AI modu da giysi analizi için yeterli!