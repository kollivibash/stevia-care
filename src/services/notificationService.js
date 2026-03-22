// Notification service — stubbed for Expo Go compatibility
// Real notifications require EAS dev build
// These stubs prevent crashes during development

export async function scheduleNotification() { return null; }
export async function cancelNotification() { return; }
export async function requestPermissions() { return 'denied'; }
export async function registerToken() { return null; }
