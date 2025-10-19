import * as Speech from 'expo-speech';

export const speak = (responseText) => {
  if (!responseText) return;

  // Try Hindi first, fallback to English
  let lang = /[^\x00-\x7F]/.test(responseText) ? 'hi' : 'en';

  Speech.stop()

  Speech.speak(responseText, {
    language: lang, // auto detect based on unicode
    pitch: 1.0,
    rate: 0.7
  });
};