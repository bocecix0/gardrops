import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define supported languages
export type Language = 'en' | 'tr' | 'es' | 'fr' | 'de';
export type LanguageName = 'English' | 'Türkçe' | 'Español' | 'Français' | 'Deutsch';

// Language mapping
export const LANGUAGE_NAMES: Record<Language, LanguageName> = {
  en: 'English',
  tr: 'Türkçe',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
};

// Default translations
const translations = {
  en: {
    welcome: 'Welcome to LookSee!',
    loading: 'Loading...',
    getStarted: 'Get Started',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',
    continueWith: 'or continue with',
    signInWithGoogle: 'Sign in with Google',
    signUpWithGoogle: 'Sign up with Google',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    createAccount: 'Create Account',
    joinLookSee: 'Join LookSee to manage your wardrobe',
    resetPasswordSubtitle: 'Enter your email address and we\'ll send you a link to reset your password',
    emailSent: 'Email Sent',
    sending: 'Sending...',
    success: 'Success',
    error: 'Error',
    aiOutfitSuggestions: 'AI Outfit Suggestions',
    virtualTryOn: 'Virtual Try-On',
    cloudSync: 'Cloud Sync',
    securePrivate: 'Secure & Private',
    phoneSignup: 'Sign up with Phone Number',
    emailSignup: 'Sign up with Email',
    sendVerificationCode: 'Send Verification Code',
    phoneNumber: 'Phone Number',
    phoneAuthInfo: 'Phone authentication requires additional Firebase configuration. Please contact support or use email registration for now.',
    learnMore: 'Learn More',
    // Login screen translations
    welcomeBack: 'Welcome Back',
    signInToLookSee: 'Sign in to your LookSee account',
    enterYourEmail: 'Enter your email',
    enterYourPassword: 'Enter your password',
    loggingIn: 'Logging in...',
    failedToLogin: 'Failed to login',
    noUserFound: 'No user found with this email',
    incorrectPassword: 'Incorrect password',
    invalidEmail: 'Invalid email address',
    accountDisabled: 'This account has been disabled',
    loginError: 'Login Error',
    googleSignInError: 'Google Sign-In Error',
    failedToSignInWithGoogle: 'Failed to sign in with Google',
    pleaseFillAllFields: 'Please fill in all fields',
    // Signup screen translations
    enterYourPhoneNumber: 'Enter your phone number',
    sendingCode: 'Sending Code...',
    creatingAccount: 'Creating Account...',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    accountCreated: 'Account created successfully!',
    failedToCreateAccount: 'Failed to create account',
    emailAlreadyInUse: 'This email is already registered',
    weakPassword: 'Password is too weak',
    signupError: 'Signup Error',
    googleSignUpError: 'Google Sign-Up Error',
    failedToSignUpWithGoogle: 'Failed to sign up with Google',
    phoneRegistration: 'Phone Registration',
    createAPassword: 'Create a password',
    confirmYourPassword: 'Confirm your password',
    // Forgot password screen translations
    failedToSendResetEmail: 'Failed to send password reset email',
  },
  tr: {
    welcome: 'LookSee\'e Hoşgeldiniz!',
    loading: 'Yükleniyor...',
    getStarted: 'Başlayın',
    signIn: 'Giriş Yap',
    signUp: 'Kayıt Ol',
    email: 'E-posta',
    password: 'Şifre',
    confirmPassword: 'Şifreyi Onayla',
    forgotPassword: 'Şifremi Unuttum?',
    resetPassword: 'Şifreyi Sıfırla',
    sendResetLink: 'Sıfırlama Bağlantısı Gönder',
    backToLogin: 'Girişe Geri Dön',
    continueWith: 'veya devam edin',
    signInWithGoogle: 'Google ile Giriş Yap',
    signUpWithGoogle: 'Google ile Kayıt Ol',
    dontHaveAccount: 'Hesabınız yok mu?',
    alreadyHaveAccount: 'Zaten bir hesabınız var mı?',
    createAccount: 'Hesap Oluştur',
    joinLookSee: 'LookSee\'e katılarak gardırobunuzu yönetin',
    resetPasswordSubtitle: 'E-posta adresinizi girin, şifrenizi sıfırlamak için bir bağlantı gönderelim',
    emailSent: 'E-posta Gönderildi',
    sending: 'Gönderiliyor...',
    success: 'Başarılı',
    error: 'Hata',
    aiOutfitSuggestions: 'AI Kıyafet Önerileri',
    virtualTryOn: 'Sanal Deneme',
    cloudSync: 'Bulut Senkronizasyonu',
    securePrivate: 'Güvenli ve Özel',
    phoneSignup: 'Telefon Numarası ile Kayıt Ol',
    emailSignup: 'E-posta ile Kayıt Ol',
    sendVerificationCode: 'Doğrulama Kodu Gönder',
    phoneNumber: 'Telefon Numarası',
    phoneAuthInfo: 'Telefon kimlik doğrulaması ek Firebase yapılandırması gerektirir. Lütfen destek ile iletişime geçin veya e-posta kaydı kullanın.',
    learnMore: 'Daha Fazla Bilgi',
    // Login screen translations
    welcomeBack: 'Tekrar Hoşgeldiniz',
    signInToLookSee: 'LookSee hesabınıza giriş yapın',
    enterYourEmail: 'E-postanızı girin',
    enterYourPassword: 'Şifrenizi girin',
    loggingIn: 'Giriş yapılıyor...',
    failedToLogin: 'Giriş yapılamadı',
    noUserFound: 'Bu e-posta ile kullanıcı bulunamadı',
    incorrectPassword: 'Yanlış şifre',
    invalidEmail: 'Geçersiz e-posta adresi',
    accountDisabled: 'Bu hesap devre dışı bırakıldı',
    loginError: 'Giriş Hatası',
    googleSignInError: 'Google Giriş Hatası',
    failedToSignInWithGoogle: 'Google ile giriş yapılamadı',
    pleaseFillAllFields: 'Lütfen tüm alanları doldurun',
    // Signup screen translations
    enterYourPhoneNumber: 'Telefon numaranızı girin',
    sendingCode: 'Kod Gönderiliyor...',
    creatingAccount: 'Hesap Oluşturuluyor...',
    passwordsDoNotMatch: 'Şifreler eşleşmiyor',
    passwordTooShort: 'Şifre en az 6 karakter olmalıdır',
    accountCreated: 'Hesap başarıyla oluşturuldu!',
    failedToCreateAccount: 'Hesap oluşturulamadı',
    emailAlreadyInUse: 'Bu e-posta zaten kayıtlı',
    weakPassword: 'Şifre çok zayıf',
    signupError: 'Kayıt Hatası',
    googleSignUpError: 'Google Kayıt Hatası',
    failedToSignUpWithGoogle: 'Google ile kayıt yapılamadı',
    phoneRegistration: 'Telefon Kaydı',
    createAPassword: 'Bir şifre oluşturun',
    confirmYourPassword: 'Şifrenizi onaylayın',
    // Forgot password screen translations
    failedToSendResetEmail: 'Şifre sıfırlama e-postası gönderilemedi',
  },
  es: {
    welcome: '¡Bienvenido a LookSee!',
    loading: 'Cargando...',
    getStarted: 'Comenzar',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    forgotPassword: '¿Olvidaste tu Contraseña?',
    resetPassword: 'Restablecer Contraseña',
    sendResetLink: 'Enviar Enlace de Restablecimiento',
    backToLogin: 'Volver al Inicio de Sesión',
    continueWith: 'o continuar con',
    signInWithGoogle: 'Iniciar Sesión con Google',
    signUpWithGoogle: 'Registrarse con Google',
    dontHaveAccount: '¿No tienes una cuenta?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    createAccount: 'Crear Cuenta',
    joinLookSee: 'Únete a LookSee para gestionar tu guardarropa',
    resetPasswordSubtitle: 'Ingresa tu dirección de correo y te enviaremos un enlace para restablecer tu contraseña',
    emailSent: 'Correo Enviado',
    sending: 'Enviando...',
    success: 'Éxito',
    error: 'Error',
    aiOutfitSuggestions: 'Sugerencias de Atuendos con IA',
    virtualTryOn: 'Prueba Virtual',
    cloudSync: 'Sincronización en la Nube',
    securePrivate: 'Seguro y Privado',
    phoneSignup: 'Registrarse con Número de Teléfono',
    emailSignup: 'Registrarse con Correo Electrónico',
    sendVerificationCode: 'Enviar Código de Verificación',
    phoneNumber: 'Número de Teléfono',
    phoneAuthInfo: 'La autenticación por teléfono requiere configuración adicional de Firebase. Por favor, contacta al soporte o usa el registro por correo electrónico.',
    learnMore: 'Más Información',
    // Login screen translations
    welcomeBack: 'Bienvenido de Nuevo',
    signInToLookSee: 'Inicia sesión en tu cuenta de LookSee',
    enterYourEmail: 'Ingresa tu correo electrónico',
    enterYourPassword: 'Ingresa tu contraseña',
    loggingIn: 'Iniciando sesión...',
    failedToLogin: 'Error al iniciar sesión',
    noUserFound: 'No se encontró usuario con este correo',
    incorrectPassword: 'Contraseña incorrecta',
    invalidEmail: 'Dirección de correo inválida',
    accountDisabled: 'Esta cuenta ha sido deshabilitada',
    loginError: 'Error de Inicio de Sesión',
    googleSignInError: 'Error de Inicio de Sesión con Google',
    failedToSignInWithGoogle: 'Error al iniciar sesión con Google',
    pleaseFillAllFields: 'Por favor, completa todos los campos',
    // Signup screen translations
    enterYourPhoneNumber: 'Ingresa tu número de teléfono',
    sendingCode: 'Enviando Código...',
    creatingAccount: 'Creando Cuenta...',
    passwordsDoNotMatch: 'Las contraseñas no coinciden',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
    accountCreated: '¡Cuenta creada exitosamente!',
    failedToCreateAccount: 'Error al crear la cuenta',
    emailAlreadyInUse: 'Este correo electrónico ya está registrado',
    weakPassword: 'La contraseña es muy débil',
    signupError: 'Error de Registro',
    googleSignUpError: 'Error de Registro con Google',
    failedToSignUpWithGoogle: 'Error al registrarse con Google',
    phoneRegistration: 'Registro Telefónico',
    createAPassword: 'Crea una contraseña',
    confirmYourPassword: 'Confirma tu contraseña',
    // Forgot password screen translations
    failedToSendResetEmail: 'Error al enviar el correo de restablecimiento de contraseña',
  },
  fr: {
    welcome: 'Bienvenue sur LookSee !',
    loading: 'Chargement...',
    getStarted: 'Commencer',
    signIn: 'Se Connecter',
    signUp: "S'inscrire",
    email: 'Email',
    password: 'Mot de Passe',
    confirmPassword: 'Confirmer le Mot de Passe',
    forgotPassword: 'Mot de Passe Oublié ?',
    resetPassword: 'Réinitialiser le Mot de Passe',
    sendResetLink: 'Envoyer le Lien de Réinitialisation',
    backToLogin: 'Retour à la Connexion',
    continueWith: 'ou continuer avec',
    signInWithGoogle: 'Se Connecter avec Google',
    signUpWithGoogle: "S'inscrire avec Google",
    dontHaveAccount: "Vous n'avez pas de compte ?",
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    createAccount: 'Créer un Compte',
    joinLookSee: 'Rejoignez LookSee pour gérer votre garde-robe',
    resetPasswordSubtitle: 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe',
    emailSent: 'Email Envoyé',
    sending: 'Envoi en cours...',
    success: 'Succès',
    error: 'Erreur',
    aiOutfitSuggestions: 'Suggestions de Tenues IA',
    virtualTryOn: 'Essayage Virtuel',
    cloudSync: 'Synchronisation Cloud',
    securePrivate: 'Sécurisé et Privé',
    phoneSignup: "S'inscrire avec Numéro de Téléphone",
    emailSignup: "S'inscrire avec Email",
    sendVerificationCode: 'Envoyer le Code de Vérification',
    phoneNumber: 'Numéro de Téléphone',
    phoneAuthInfo: "L'authentification par téléphone nécessite une configuration Firebase supplémentaire. Veuillez contacter le support ou utiliser l'inscription par email.",
    learnMore: "En Savoir Plus",
    // Login screen translations
    welcomeBack: 'Bon Retour',
    signInToLookSee: 'Connectez-vous à votre compte LookSee',
    enterYourEmail: 'Entrez votre email',
    enterYourPassword: 'Entrez votre mot de passe',
    loggingIn: 'Connexion en cours...',
    failedToLogin: 'Échec de la connexion',
    noUserFound: 'Aucun utilisateur trouvé avec cet email',
    incorrectPassword: 'Mot de passe incorrect',
    invalidEmail: 'Adresse email invalide',
    accountDisabled: 'Ce compte a été désactivé',
    loginError: 'Erreur de Connexion',
    googleSignInError: 'Erreur de Connexion Google',
    failedToSignInWithGoogle: 'Échec de la connexion avec Google',
    pleaseFillAllFields: 'Veuillez remplir tous les champs',
    // Signup screen translations
    enterYourPhoneNumber: 'Entrez votre numéro de téléphone',
    sendingCode: 'Envoi du Code...',
    creatingAccount: 'Création du Compte...',
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    accountCreated: 'Compte créé avec succès !',
    failedToCreateAccount: 'Échec de la création du compte',
    emailAlreadyInUse: 'Cet email est déjà enregistré',
    weakPassword: 'Le mot de passe est trop faible',
    signupError: "Erreur d'Inscription",
    googleSignUpError: "Erreur d'Inscription Google",
    failedToSignUpWithGoogle: "Échec de l'inscription avec Google",
    phoneRegistration: 'Inscription Téléphonique',
    createAPassword: 'Créez un mot de passe',
    confirmYourPassword: 'Confirmez votre mot de passe',
    // Forgot password screen translations
    failedToSendResetEmail: "Échec de l'envoi de l'e-mail de réinitialisation du mot de passe",
  },
  de: {
    welcome: 'Willkommen bei LookSee!',
    loading: 'Laden...',
    getStarted: 'Loslegen',
    signIn: 'Anmelden',
    signUp: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
    confirmPassword: 'Passwort Bestätigen',
    forgotPassword: 'Passwort Vergessen?',
    resetPassword: 'Passwort Zurücksetzen',
    sendResetLink: 'Zurücksetzen-Link Senden',
    backToLogin: 'Zurück zur Anmeldung',
    continueWith: 'oder fortfahren mit',
    signInWithGoogle: 'Mit Google anmelden',
    signUpWithGoogle: 'Mit Google registrieren',
    dontHaveAccount: 'Noch kein Konto?',
    alreadyHaveAccount: 'Bereits ein Konto?',
    createAccount: 'Konto Erstellen',
    joinLookSee: 'Treten Sie LookSee bei, um Ihre Garderobe zu verwalten',
    resetPasswordSubtitle: 'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts',
    emailSent: 'E-Mail Gesendet',
    sending: 'Senden...',
    success: 'Erfolg',
    error: 'Fehler',
    aiOutfitSuggestions: 'KI-Outfit-Vorschläge',
    virtualTryOn: 'Virtueller Anprobe',
    cloudSync: 'Cloud-Synchronisation',
    securePrivate: 'Sicher & Privat',
    phoneSignup: 'Mit Telefonnummer registrieren',
    emailSignup: 'Mit E-Mail registrieren',
    sendVerificationCode: 'Verifizierungscode Senden',
    phoneNumber: 'Telefonnummer',
    phoneAuthInfo: 'Die Telefonauthentifizierung erfordert eine zusätzliche Firebase-Konfiguration. Bitte kontaktieren Sie den Support oder verwenden Sie die E-Mail-Registrierung.',
    learnMore: 'Mehr Erfahren',
    // Login screen translations
    welcomeBack: 'Willkommen Zurück',
    signInToLookSee: 'Melden Sie sich bei Ihrem LookSee-Konto an',
    enterYourEmail: 'Geben Sie Ihre E-Mail ein',
    enterYourPassword: 'Geben Sie Ihr Passwort ein',
    loggingIn: 'Anmeldung läuft...',
    failedToLogin: 'Anmeldung fehlgeschlagen',
    noUserFound: 'Kein Benutzer mit dieser E-Mail gefunden',
    incorrectPassword: 'Falsches Passwort',
    invalidEmail: 'Ungültige E-Mail-Adresse',
    accountDisabled: 'Dieses Konto wurde deaktiviert',
    loginError: 'Anmeldefehler',
    googleSignInError: 'Google-Anmeldefehler',
    failedToSignInWithGoogle: 'Anmeldung mit Google fehlgeschlagen',
    pleaseFillAllFields: 'Bitte füllen Sie alle Felder aus',
    // Signup screen translations
    enterYourPhoneNumber: 'Geben Sie Ihre Telefonnummer ein',
    sendingCode: 'Code wird gesendet...',
    creatingAccount: 'Konto wird erstellt...',
    passwordsDoNotMatch: 'Passwörter stimmen nicht überein',
    passwordTooShort: 'Das Passwort muss mindestens 6 Zeichen lang sein',
    accountCreated: 'Konto erfolgreich erstellt!',
    failedToCreateAccount: 'Kontoerstellung fehlgeschlagen',
    emailAlreadyInUse: 'Diese E-Mail ist bereits registriert',
    weakPassword: 'Das Passwort ist zu schwach',
    signupError: 'Registrierungsfehler',
    googleSignUpError: 'Google-Registrierungsfehler',
    failedToSignUpWithGoogle: 'Registrierung mit Google fehlgeschlagen',
    phoneRegistration: 'Telefonregistrierung',
    createAPassword: 'Erstellen Sie ein Passwort',
    confirmYourPassword: 'Bestätigen Sie Ihr Passwort',
    // Forgot password screen translations
    failedToSendResetEmail: 'Fehler beim Senden der Passwort-Zurücksetzen-E-Mail',
  },
};

// Type for translations
type Translations = typeof translations.en;

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations) => string;
  availableLanguages: Language[];
  languageNames: Record<Language, LanguageName>;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  const [language, setLanguage] = useState<Language>('en');

  // Initialize language based on device locale or saved preference
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // First check if user has saved a language preference
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (savedLanguage && isValidLanguage(savedLanguage)) {
          setLanguage(savedLanguage);
          return;
        }

        // If no saved preference, detect from device
        // Use Expo's Localization API
        const deviceLocales = Localization.getLocales();
        const deviceLanguage = deviceLocales[0]?.languageCode || 'en';
        const region = deviceLocales[0]?.regionCode || '';

        // Map device language to our supported languages
        let detectedLanguage: Language = 'en';
        
        if (deviceLanguage) {
          if (deviceLanguage.startsWith('tr')) {
            detectedLanguage = 'tr';
          } else if (deviceLanguage.startsWith('es')) {
            detectedLanguage = 'es';
          } else if (deviceLanguage.startsWith('fr')) {
            detectedLanguage = 'fr';
          } else if (deviceLanguage.startsWith('de')) {
            detectedLanguage = 'de';
          }
        }

        // Override with region if needed
        if (region === 'TR') {
          detectedLanguage = 'tr';
        }

        setLanguage(det