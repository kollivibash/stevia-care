import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

import { tr as trHelper } from '../constants/translations';
export { tr } from '../constants/translations';

// ── TRANSLATIONS (kept for backward compat) ───────────────────────────────────
export const TRANSLATIONS = {
  en: {
    goodMorning: 'Good morning', goodAfternoon: 'Good afternoon', goodEvening: 'Good evening',
    healthScore: 'Your Health Score', basedOn: 'Based on profile and activity',
    dailyTip: 'Daily Health Tip', todayMeds: "Today's Medicines", seeAll: 'See all →',
    healthTools: 'Health Tools', openHub: 'Open Health Hub →',
    reports: 'Reports', members: 'Members', meds: 'Meds',
    futureTagline: 'The Future of Personal Healthcare',
    steviaAI: 'Stevia AI',
  },
  hi: {
    goodMorning: 'सुप्रभात', goodAfternoon: 'शुभ दोपहर', goodEvening: 'शुभ संध्या',
    healthScore: 'आपका स्वास्थ्य स्कोर', basedOn: 'प्रोफ़ाइल और गतिविधि के आधार पर',
    dailyTip: 'दैनिक स्वास्थ्य सुझाव', todayMeds: 'आज की दवाएं', seeAll: 'सभी देखें →',
    healthTools: 'स्वास्थ्य उपकरण', openHub: 'हेल्थ हब खोलें →',
    reports: 'रिपोर्ट', members: 'सदस्य', meds: 'दवाएं',
    futureTagline: 'व्यक्तिगत स्वास्थ्य का भविष्य',
    steviaAI: 'स्टेविया AI',
  },
  bn: {
    goodMorning: 'শুভ সকাল', goodAfternoon: 'শুভ অপরাহ্ন', goodEvening: 'শুভ সন্ধ্যা',
    healthScore: 'আপনার স্বাস্থ্য স্কোর', basedOn: 'প্রোফাইল ও কার্যকলাপের উপর ভিত্তি করে',
    dailyTip: 'দৈনিক স্বাস্থ্য টিপস', todayMeds: 'আজকের ওষুধ', seeAll: 'সব দেখুন →',
    healthTools: 'স্বাস্থ্য সরঞ্জাম', openHub: 'হেলথ হাব খুলুন →',
    reports: 'রিপোর্ট', members: 'সদস্য', meds: 'ওষুধ',
    futureTagline: 'ব্যক্তিগত স্বাস্থ্যসেবার ভবিষ্যৎ',
    steviaAI: 'স্টেভিয়া AI',
  },
  mr: {
    goodMorning: 'शुभ प्रभात', goodAfternoon: 'शुभ दुपार', goodEvening: 'शुभ संध्याकाळ',
    healthScore: 'तुमचा आरोग्य स्कोर', basedOn: 'प्रोफाइल आणि क्रियाकलापावर आधारित',
    dailyTip: 'दैनिक आरोग्य टिप', todayMeds: 'आजच्या गोळ्या', seeAll: 'सर्व पाहा →',
    healthTools: 'आरोग्य साधने', openHub: 'हेल्थ हब उघडा →',
    reports: 'अहवाल', members: 'सदस्य', meds: 'औषधे',
    futureTagline: 'वैयक्तिक आरोग्यसेवेचे भविष्य',
    steviaAI: 'स्टेव्हिया AI',
  },
  te: {
    goodMorning: 'శుభోదయం', goodAfternoon: 'శుభ మధ్యాహ్నం', goodEvening: 'శుభ సాయంత్రం',
    healthScore: 'మీ ఆరోగ్య స్కోర్', basedOn: 'ప్రొఫైల్ మరియు కార్యకలాపాల ఆధారంగా',
    dailyTip: 'రోజువారీ ఆరోగ్య చిట్కా', todayMeds: 'ఈ రోజు మందులు', seeAll: 'అన్నీ చూడండి →',
    healthTools: 'ఆరోగ్య సాధనాలు', openHub: 'హెల్త్ హబ్ తెరవండి →',
    reports: 'నివేదికలు', members: 'సభ్యులు', meds: 'మందులు',
    futureTagline: 'వ్యక్తిగత ఆరోగ్య సేవ యొక్క భవిష్యత్తు',
    steviaAI: 'స్టెవియా AI',
  },
  ta: {
    goodMorning: 'காலை வணக்கம்', goodAfternoon: 'மதிய வணக்கம்', goodEvening: 'மாலை வணக்கம்',
    healthScore: 'உங்கள் உடல்நல மதிப்பெண்', basedOn: 'சுயவிவரம் மற்றும் செயல்பாடு அடிப்படையில்',
    dailyTip: 'தினசரி உடல்நல குறிப்பு', todayMeds: 'இன்றைய மருந்துகள்', seeAll: 'அனைத்தும் காண்க →',
    healthTools: 'உடல்நல கருவிகள்', openHub: 'ஹெல்த் ஹப் திறக்கவும் →',
    reports: 'அறிக்கைகள்', members: 'உறுப்பினர்கள்', meds: 'மருந்துகள்',
    futureTagline: 'தனிப்பட்ட உடல்நலத்தின் எதிர்காலம்',
    steviaAI: 'ஸ்டீவியா AI',
  },
  gu: {
    goodMorning: 'સુપ્રભાત', goodAfternoon: 'શુભ બપોર', goodEvening: 'શુભ સાંજ',
    healthScore: 'તમારો સ્વાસ્થ્ય સ્કોર', basedOn: 'પ્રોફાઇલ અને પ્રવૃત્તિ પર આધારિત',
    dailyTip: 'દૈનિક સ્વાસ્થ્ય ટિપ', todayMeds: 'આજની દવાઓ', seeAll: 'બધું જુઓ →',
    healthTools: 'આરોગ્ય સાધનો', openHub: 'હેલ્થ હબ ખોલો →',
    reports: 'અહેવાલ', members: 'સભ્યો', meds: 'દવાઓ',
    futureTagline: 'વ્યક્તિગત આરોગ્ય સેવાનું ભવિષ્ય',
    steviaAI: 'સ્ટેવિયા AI',
  },
  ur: {
    goodMorning: 'صبح بخیر', goodAfternoon: 'سہ پہر بخیر', goodEvening: 'شام بخیر',
    healthScore: 'آپ کا صحت سکور', basedOn: 'پروفائل اور سرگرمی کی بنیاد پر',
    dailyTip: 'روزانہ صحت کا مشورہ', todayMeds: 'آج کی دوائیں', seeAll: 'سب دیکھیں →',
    healthTools: 'صحت کے اوزار', openHub: 'ہیلتھ ہب کھولیں →',
    reports: 'رپورٹس', members: 'اراکین', meds: 'دوائیں',
    futureTagline: 'ذاتی صحت کی دیکھ بھال کا مستقبل',
    steviaAI: 'سٹیویا AI',
  },
  kn: {
    goodMorning: 'ಶುಭೋದಯ', goodAfternoon: 'ಶುಭ ಮಧ್ಯಾಹ್ನ', goodEvening: 'ಶುಭ ಸಂಜೆ',
    healthScore: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸ್ಕೋರ್', basedOn: 'ಪ್ರೊಫೈಲ್ ಮತ್ತು ಚಟುವಟಿಕೆ ಆಧಾರದ ಮೇಲೆ',
    dailyTip: 'ದೈನಂದಿನ ಆರೋಗ್ಯ ಸಲಹೆ', todayMeds: 'ಇಂದಿನ ಔಷಧಗಳು', seeAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ →',
    healthTools: 'ಆರೋಗ್ಯ ಸಾಧನಗಳು', openHub: 'ಹೆಲ್ತ್ ಹಬ್ ತೆರೆಯಿರಿ →',
    reports: 'ವರದಿಗಳು', members: 'ಸದಸ್ಯರು', meds: 'ಔಷಧಗಳು',
    futureTagline: 'ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಸೇವೆಯ ಭವಿಷ್ಯ',
    steviaAI: 'ಸ್ಟೇವಿಯಾ AI',
  },
  or: {
    goodMorning: 'ଶୁଭ ସକାଳ', goodAfternoon: 'ଶୁଭ ଅପରାହ୍ନ', goodEvening: 'ଶୁଭ ସନ୍ଧ୍ୟା',
    healthScore: 'ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସ୍କୋର', basedOn: 'ପ୍ରୋଫାଇଲ ଏବଂ କ୍ରିୟାକଳାପ ଉପରେ ଆଧାର',
    dailyTip: 'ଦୈନିକ ସ୍ୱାସ୍ଥ୍ୟ ଟିପ', todayMeds: 'ଆଜିର ଔଷଧ', seeAll: 'ସବୁ ଦେଖନ୍ତୁ →',
    healthTools: 'ସ୍ୱାସ୍ଥ୍ୟ ସରଞ୍ଜାମ', openHub: 'ହେଲ୍ଥ ହବ ଖୋଲନ୍ତୁ →',
    reports: 'ରିପୋର୍ଟ', members: 'ସଦସ୍ୟ', meds: 'ଔଷଧ',
    futureTagline: 'ବ୍ୟକ୍ତିଗତ ସ୍ୱାସ୍ଥ୍ୟ ସେବାର ଭବିଷ୍ୟତ',
    steviaAI: 'ଷ୍ଟେଭିଆ AI',
  },
  ml: {
    goodMorning: 'ശുഭ പ്രഭാതം', goodAfternoon: 'ശുഭ ഉച്ചക്ക്', goodEvening: 'ശുഭ സന്ധ്യ',
    healthScore: 'നിങ്ങളുടെ ആരോഗ്യ സ്കോർ', basedOn: 'പ്രൊഫൈലും പ്രവർത്തനവും അടിസ്ഥാനമാക്കി',
    dailyTip: 'ദൈനംദിന ആരോഗ്യ നുറുങ്ങ്', todayMeds: 'ഇന്നത്തെ മരുന്നുകൾ', seeAll: 'എല്ലാം കാണുക →',
    healthTools: 'ആരോഗ്യ ഉപകരണങ്ങൾ', openHub: 'ഹെൽത്ത് ഹബ് തുറക്കുക →',
    reports: 'റിപ്പോർട്ടുകൾ', members: 'അംഗങ്ങൾ', meds: 'മരുന്നുകൾ',
    futureTagline: 'വ്യക്തിഗത ആരോഗ്യ സേവനത്തിന്റെ ഭാവി',
    steviaAI: 'സ്റ്റേവിയ AI',
  },
};

export const t = (languageCode, key) => {
  const lang = TRANSLATIONS[languageCode] || TRANSLATIONS['en'];
  return lang[key] || TRANSLATIONS['en'][key] || key;
};

export const useThemeStore = create((set, get) => ({
  isDark: false,
  language: 'English',
  languageCode: 'en',

  initialize: async () => {
    try {
      const dark     = await SecureStore.getItemAsync('theme_dark');
      const lang     = await SecureStore.getItemAsync('app_language');
      const langCode = await SecureStore.getItemAsync('app_language_code');
      set({
        isDark:       dark === 'true',
        language:     lang     || 'English',
        languageCode: langCode || 'en',
      });
    } catch (e) {}
  },

  setDark: async (val) => {
    set({ isDark: val });
    try { await SecureStore.setItemAsync('theme_dark', val ? 'true' : 'false'); } catch (e) {}
  },

  setLanguage: async (language, code) => {
    set({ language, languageCode: code });
    try {
      await SecureStore.setItemAsync('app_language', language);
      await SecureStore.setItemAsync('app_language_code', code);
    } catch (e) {}
  },
}));

export const getTheme = (isDark) => ({
  bg:        isDark ? '#0F1117' : '#F5F7FF',
  card:      isDark ? '#1C1F2E' : '#FFFFFF',
  cardAlt:   isDark ? '#252840' : '#F0F4FF',
  border:    isDark ? '#2E3248' : '#E2E8F4',
  text:      isDark ? '#F1F5F9' : '#0F1729',
  textSub:   isDark ? '#94A3B8' : '#64748B',
  textMuted: isDark ? '#64748B' : '#94A3B8',
  inputBg:   isDark ? '#1C1F2E' : '#F5F7FF',
  divider:   isDark ? '#2E3248' : '#F5F7FF',
  shadow:    isDark ? '#000000' : '#16A34A',
});
