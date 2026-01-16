// Multilingual translations for SmarAnandh
// Supports: English, Hindi, Hinglish (default)

export type Language = 'english' | 'hindi' | 'hinglish';

export const translations = {
  // Greetings
  namaste: {
    english: 'Hello',
    hindi: 'नमस्ते',
    hinglish: 'Namaste',
  },
  goodMorning: {
    english: 'Good Morning',
    hindi: 'सुप्रभात',
    hinglish: 'Suprabhat',
  },
  goodAfternoon: {
    english: 'Good Afternoon',
    hindi: 'शुभ दोपहर',
    hinglish: 'Shubh Dopahar',
  },
  goodEvening: {
    english: 'Good Evening',
    hindi: 'शुभ संध्या',
    hinglish: 'Shubh Sandhya',
  },
  
  // Status messages
  allIsWell: {
    english: 'Everything is OK',
    hindi: 'सब कुछ ठीक है',
    hinglish: 'Sab Kuch Theek Hai',
  },
  medicineTime: {
    english: 'Time for Medicine',
    hindi: 'दवा का समय',
    hinglish: 'Dawa ka Time',
  },
  medicineDue: {
    english: 'Medicine is due',
    hindi: 'दवा का समय हो गया',
    hinglish: 'Dawa ka samay ho gaya',
  },
  
  // Navigation
  medicine: {
    english: 'Medicine',
    hindi: 'दवा',
    hinglish: 'Dawa',
  },
  joy: {
    english: 'Joy',
    hindi: 'खुशी',
    hinglish: 'Khushi',
  },
  help: {
    english: 'Help',
    hindi: 'मदद',
    hinglish: 'Madad',
  },
  family: {
    english: 'Family',
    hindi: 'परिवार',
    hinglish: 'Parivaar',
  },
  
  // Actions
  yesTookIt: {
    english: 'Yes, I took it',
    hindi: 'हाँ, ले लिया',
    hinglish: 'HAAN, LE LIYA',
  },
  remindLater: {
    english: 'Remind me later',
    hindi: 'बाद में याद दिलाएं',
    hinglish: '10 Minute Baad Yaad Dilaye',
  },
  yesCallThem: {
    english: 'Yes, call them',
    hindi: 'हाँ, बुलाओ',
    hinglish: 'HAAN, BULAO',
  },
  noImOkay: {
    english: "No, I'm okay",
    hindi: 'नहीं, ठीक हूँ',
    hinglish: 'NAHI, THEEK HUN',
  },
  
  // Questions
  didYouTakeMedicine: {
    english: 'Did you take this medicine?',
    hindi: 'क्या आपने यह दवा ली?',
    hinglish: 'Kya aapne yeh dawa le li?',
  },
  doYouNeedHelp: {
    english: 'Do you need help?',
    hindi: 'क्या आपको मदद चाहिए?',
    hinglish: 'Kya aapko madad chahiye?',
  },
  alertFamily: {
    english: 'Alert your family?',
    hindi: 'अपने परिवार को बताएं?',
    hinglish: 'Apne parivaar ko bataye?',
  },
  whatToDo: {
    english: 'What would you like to do today?',
    hindi: 'आज क्या करना चाहेंगे?',
    hinglish: 'Aaj kya karna chahenge?',
  },
  
  // Success messages
  medicationTaken: {
    english: 'Great! You took your medicine.',
    hindi: 'शाबाश! आपने अपनी दवा ले ली है।',
    hinglish: 'Shandaar! Aapne Dawa le li.',
  },
  familyAlerted: {
    english: 'Family has been alerted',
    hindi: 'परिवार को सूचित कर दिया',
    hinglish: 'Parivaar ko bata diya',
  },
  thankYou: {
    english: 'Thank you!',
    hindi: 'धन्यवाद!',
    hinglish: 'Shukriya!',
  },
  
  // Joy/Entertainment
  listen: {
    english: 'Listen',
    hindi: 'सुनो',
    hinglish: 'Suno',
  },
  watch: {
    english: 'Watch',
    hindi: 'देखो',
    hinglish: 'Dekho',
  },
  memories: {
    english: 'Memories',
    hindi: 'यादें',
    hinglish: 'Yaadein',
  },
  play: {
    english: 'Play',
    hindi: 'खेल',
    hinglish: 'Khel',
  },
  todaysSuggestion: {
    english: "Today's Suggestion",
    hindi: 'आज का सुझाव',
    hinglish: 'Aaj Ka Sujhav',
  },
  
  // Days of week
  sunday: { english: 'Sunday', hindi: 'रविवार', hinglish: 'Ravivaar' },
  monday: { english: 'Monday', hindi: 'सोमवार', hinglish: 'Somvaar' },
  tuesday: { english: 'Tuesday', hindi: 'मंगलवार', hinglish: 'Mangalvaar' },
  wednesday: { english: 'Wednesday', hindi: 'बुधवार', hinglish: 'Budhvaar' },
  thursday: { english: 'Thursday', hindi: 'गुरुवार', hinglish: 'Guruvaar' },
  friday: { english: 'Friday', hindi: 'शुक्रवार', hinglish: 'Shukravaar' },
  saturday: { english: 'Saturday', hindi: 'शनिवार', hinglish: 'Shanivaar' },
  
  // Time of day
  morning: { english: 'Morning', hindi: 'सुबह', hinglish: 'Subah' },
  afternoon: { english: 'Afternoon', hindi: 'दोपहर', hinglish: 'Dopahar' },
  evening: { english: 'Evening', hindi: 'शाम', hinglish: 'Shaam' },
  night: { english: 'Night', hindi: 'रात', hinglish: 'Raat' },
  
  // Guardian Dashboard
  dashboard: {
    english: 'Dashboard',
    hindi: 'डैशबोर्ड',
    hinglish: 'Dashboard',
  },
  addMedicine: {
    english: 'Add Medicine',
    hindi: 'दवा जोड़ें',
    hinglish: 'Dawa Jodein',
  },
  uploadPrescription: {
    english: 'Upload Prescription',
    hindi: 'नुस्खा अपलोड करें',
    hinglish: 'Prescription Upload Karein',
  },
  activityFeed: {
    english: 'Activity Feed',
    hindi: 'गतिविधि फ़ीड',
    hinglish: 'Activity Feed',
  },
  healthVitals: {
    english: 'Health Vitals',
    hindi: 'स्वास्थ्य संकेत',
    hinglish: 'Health Vitals',
  },
  settings: {
    english: 'Settings',
    hindi: 'सेटिंग्स',
    hinglish: 'Settings',
  },
  joyActivities: {
    english: 'Joy Activities',
    hindi: 'खुशी की गतिविधियाँ',
    hinglish: 'Khushi Activities',
  },
} as const;

export const t = (key: keyof typeof translations, lang: Language = 'hinglish'): string => {
  return translations[key][lang] || translations[key].hinglish;
};

export const getDayName = (day: number, lang: Language = 'hinglish'): string => {
  const days: (keyof typeof translations)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  return t(days[day], lang);
};

export const getTimeOfDay = (hour: number, lang: Language = 'hinglish'): string => {
  if (hour < 12) return t('morning', lang);
  if (hour < 17) return t('afternoon', lang);
  if (hour < 20) return t('evening', lang);
  return t('night', lang);
};
