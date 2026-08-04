
import Constants from 'expo-constants';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

export function requestIgnoreBatteryOptimizations() {
    if (Platform.OS !== 'android') return;
    const packageName = Constants.expoConfig?.android?.package;
    IntentLauncher.startActivityAsync(
        'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
        { data: `package:${packageName}` },
    );
}