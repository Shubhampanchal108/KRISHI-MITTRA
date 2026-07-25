/**
 * Firebase Authentication for Krishi Mittra
 * Uses Firebase Web SDK + generic expo-auth-session (NOT the Google provider)
 * so we avoid the mandatory androidClientId requirement in Expo Go.
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Required to close the browser popup after OAuth redirect
WebBrowser.maybeCompleteAuthSession();

// ─── Firebase Config ────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app (singleton)
const firebaseApp = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

// Initialize Firebase Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (_e) {
  // initializeAuth called twice (e.g. hot reload) — grab existing instance
  const { getAuth } = require('firebase/auth');
  auth = getAuth(firebaseApp);
}

// ─── Google OAuth Config ────────────────────────────────────────────────────
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// Google's OAuth 2.0 discovery document endpoints
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// ─── Hook ───────────────────────────────────────────────────────────────────
/**
 * Hook that returns [promptAsync, isConfigured, response].
 *
 * Uses the generic AuthSession.useAuthRequest (NOT Google.useAuthRequest)
 * so it works in Expo Go without needing androidClientId.
 * Uses Expo auth proxy (https://auth.expo.io) to handle the redirect.
 */
export const useGoogleAuthPrompt = () => {
  const isConfigured = !!GOOGLE_WEB_CLIENT_ID;

  // Expo auth proxy redirect — works in Expo Go without needing SHA-1 or package names
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_WEB_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Token, // gets access_token directly
      usePKCE: false,
    },
    GOOGLE_DISCOVERY
  );

  return [promptAsync, isConfigured, response];
};

// ─── Process Response ────────────────────────────────────────────────────────
/**
 * Processes a successful Google OAuth response.
 * Uses the access token to sign into Firebase and fetch the user profile.
 *
 * @param {object} authResponse - Response from AuthSession.useAuthRequest
 * @returns {Promise<{name, email, googleId, photoUrl}>}
 */
export const processGoogleAuthResponse = async (authResponse) => {
  if (!authResponse) {
    throw new Error('No auth response received.');
  }

  if (authResponse.type === 'cancel' || authResponse.type === 'dismiss') {
    throw new Error('Google Sign-In was cancelled.');
  }

  if (authResponse.type !== 'success') {
    throw new Error(`Google Sign-In failed (${authResponse.type}).`);
  }

  const accessToken = authResponse.params?.access_token;

  if (!accessToken) {
    throw new Error('No access token received from Google. Please try again.');
  }

  // Sign into Firebase with the Google access token
  try {
    const credential = GoogleAuthProvider.credential(null, accessToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;

    return {
      name: user.displayName || 'Farmer',
      email: user.email || '',
      googleId: user.uid,
      photoUrl: user.photoURL || '',
    };
  } catch (firebaseError) {
    console.warn('Firebase credential sign-in failed, using Google profile directly:', firebaseError.code);

    // Fallback: fetch profile directly from Google userinfo API
    const profileRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      throw new Error(`Failed to get Google profile: ${profileRes.status}`);
    }

    const profile = await profileRes.json();

    if (!profile.email) {
      throw new Error('Could not retrieve your Google email address.');
    }

    return {
      name: profile.name || 'Farmer',
      email: profile.email,
      googleId: profile.id || `google_${Date.now()}`,
      photoUrl: profile.picture || '',
    };
  }
};
