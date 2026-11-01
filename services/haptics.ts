import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Güvenli haptik yardımcıları: native modül yoksa sessizce geçer, crash yok.

export async function tapFeedback() {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // bu build'de native modül yoksa yut
  }
}

export async function successFeedback() {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // yut
  }
}

export async function warnFeedback() {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // yut
  }
}