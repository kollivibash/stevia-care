// ─── Stevia Care — Notification Service ──────────────────────────────────────
// Full expo-notifications integration for medicine reminders
// Requires EAS dev build (not Expo Go) for real notifications
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ── Notification handler — must be set at module load time ───────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── Android notification channel ─────────────────────────────────────────────
const _setupAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('medicine-reminders', {
    name: 'Medicine Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3DD68C',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });
};

// Initialise channel once at import time — fire and forget
_setupAndroidChannel();

// ─────────────────────────────────────────────────────────────────────────────
// requestPermissions
// Asks the user for notification permission.
// Returns true if granted, false otherwise.
// ─────────────────────────────────────────────────────────────────────────────
export const requestPermissions = async () => {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowSound: true,
        allowBadge: true,
      },
    });
    return status === 'granted';
  } catch (err) {
    console.warn('[NotificationService] requestPermissions error:', err);
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// scheduleMedicineReminder
// Schedules a daily repeating local notification at the medicine's time.
// medicine: { name, dose, times: ["08:00"], memberName, color }
// Returns the notificationId string (or null on failure).
// ─────────────────────────────────────────────────────────────────────────────
export const scheduleMedicineReminder = async (medicine) => {
  try {
    const granted = await requestPermissions();
    if (!granted) {
      console.warn('[NotificationService] Permission not granted — skipping reminder');
      return null;
    }

    // Use the first time slot if multiple exist
    const timeStr = Array.isArray(medicine.times) && medicine.times.length > 0
      ? medicine.times[0]
      : '08:00';

    const [hourStr, minuteStr] = timeStr.split(':');
    const hour   = parseInt(hourStr,   10) || 8;
    const minute = parseInt(minuteStr, 10) || 0;

    const memberLabel = medicine.memberName ? ` for ${medicine.memberName}` : '';
    const doseLabel   = medicine.dose       ? ` — ${medicine.dose}`         : '';

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time for ${medicine.name}${memberLabel}`,
        body:  `Take your ${medicine.name}${doseLabel}. Stay consistent for better health.`,
        sound: 'default',
        data:  {
          type:        'medicine_reminder',
          medicineName: medicine.name,
          dose:         medicine.dose,
          memberName:   medicine.memberName,
          color:        medicine.color,
        },
        ...(Platform.OS === 'android' && { channelId: 'medicine-reminders' }),
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    return notificationId;
  } catch (err) {
    console.warn('[NotificationService] scheduleMedicineReminder error:', err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// cancelReminder
// Cancels a single scheduled notification by its ID.
// ─────────────────────────────────────────────────────────────────────────────
export const cancelReminder = async (notificationId) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.warn('[NotificationService] cancelReminder error:', err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// cancelAllReminders
// Cancels every scheduled notification for this app.
// ─────────────────────────────────────────────────────────────────────────────
export const cancelAllReminders = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('[NotificationService] cancelAllReminders error:', err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// scheduleSnoozedReminder
// Schedules a one-time notification N minutes from now (snooze behaviour).
// Returns the notificationId string (or null on failure).
// ─────────────────────────────────────────────────────────────────────────────
export const scheduleSnoozedReminder = async (medicine, minutesFromNow = 10) => {
  try {
    const granted = await requestPermissions();
    if (!granted) return null;

    const memberLabel = medicine.memberName ? ` for ${medicine.memberName}` : '';
    const doseLabel   = medicine.dose       ? ` — ${medicine.dose}`         : '';

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Snoozed Reminder: ${medicine.name}${memberLabel}`,
        body:  `It's time to take ${medicine.name}${doseLabel}. Don't forget!`,
        sound: 'default',
        data:  {
          type:        'medicine_snooze',
          medicineName: medicine.name,
          dose:         medicine.dose,
          memberName:   medicine.memberName,
          color:        medicine.color,
        },
        ...(Platform.OS === 'android' && { channelId: 'medicine-reminders' }),
      },
      trigger: {
        seconds: minutesFromNow * 60,
        repeats: false,
      },
    });

    return notificationId;
  } catch (err) {
    console.warn('[NotificationService] scheduleSnoozedReminder error:', err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// getScheduledNotifications
// Returns the full list of all currently scheduled notifications.
// ─────────────────────────────────────────────────────────────────────────────
export const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('[NotificationService] getScheduledNotifications error:', err);
    return [];
  }
};
