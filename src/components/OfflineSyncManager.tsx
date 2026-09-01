import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Network from 'expo-network';
import { useLebenStore } from '@/store/useStore';
import { Toast } from '@/components/ui/Toast';

export default function OfflineSyncManager() {
  const offlineQueue = useLebenStore(state => state.offlineQueue);
  const processOfflineQueue = useLebenStore(state => state.processOfflineQueue);
  const addToast = useLebenStore(state => state.addToast);
  const toasts = useLebenStore(state => state.toasts);

  useEffect(() => {
    // Check initial network state
    const checkInitialState = async () => {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected && !networkState.isInternetReachable) {
        addToast({
          message: 'You are offline. Changes will sync later.',
          type: 'info'
        });
      }
    };
    checkInitialState();
  }, [addToast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (offlineQueue.length > 0) {
      interval = setInterval(async () => {
        const networkState = await Network.getNetworkStateAsync();
        if (networkState.isConnected && networkState.isInternetReachable) {
          processOfflineQueue();
        }
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [offlineQueue.length, processOfflineQueue]);

  if (toasts.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" className="z-50 items-center justify-start pt-14">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} />
      ))}
    </View>
  );
}
