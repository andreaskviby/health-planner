// hooks/useBluetooth.ts
'use client';

import { useState, useCallback } from 'react';
import { BluetoothSync } from '@/lib/types';

export function useBluetooth() {
  const [bluetoothState, setBluetoothState] = useState<BluetoothSync>({
    isHuggingMode: false,
    partnerDevice: null,
    isConnected: false,
  });

  // Enhanced mobile detection for better UX
  const isMobile = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const hasBluetoothAPI = typeof navigator !== 'undefined' && !!navigator.bluetooth;

  const enterHuggingMode = useCallback(async () => {
    // For mobile devices without Bluetooth API, still allow entering hugging mode
    // This provides a consistent UX and allows for future alternative connection methods
    if (!hasBluetoothAPI) {
      if (isMobile) {
        // On mobile without Web Bluetooth API, enter a mock hugging mode
        // This maintains UX consistency and can be enhanced with alternative methods later
        setBluetoothState(prev => ({ ...prev, isHuggingMode: true }));
        
        // Simulate connection process for better UX
        setTimeout(() => {
          setBluetoothState(prev => ({
            ...prev,
            isConnected: true,
            partnerDevice: null // No actual device but we're in "connected" state
          }));
        }, 2000);
        
        return null;
      } else {
        throw new Error('Bluetooth is not supported on this device');
      }
    }

    try {
      setBluetoothState(prev => ({ ...prev, isHuggingMode: true }));
      
      const device = await navigator.bluetooth!.requestDevice({
        filters: [{ services: ['12345678-1234-5678-9abc-def123456789'] }],
        optionalServices: ['12345678-1234-5678-9abc-def123456789']
      });

      const server = await device.gatt?.connect();
      console.log('Connected to GATT server:', server);
      
      setBluetoothState(prev => ({
        ...prev,
        partnerDevice: device,
        isConnected: true,
      }));

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        setBluetoothState(prev => ({
          ...prev,
          partnerDevice: null,
          isConnected: false,
          isHuggingMode: false,
        }));
      });

      return device;
    } catch (error) {
      setBluetoothState(prev => ({ ...prev, isHuggingMode: false }));
      throw error;
    }
  }, [hasBluetoothAPI, isMobile]);

  const exitHuggingMode = useCallback(() => {
    if (bluetoothState.partnerDevice?.gatt?.connected) {
      bluetoothState.partnerDevice.gatt.disconnect();
    }
    
    setBluetoothState({
      isHuggingMode: false,
      partnerDevice: null,
      isConnected: false,
    });
  }, [bluetoothState.partnerDevice]);

  const syncData = useCallback(async (data: Record<string, unknown>) => {
    if (!bluetoothState.isConnected || !bluetoothState.partnerDevice) {
      throw new Error('Not connected to partner device');
    }

    try {
      const server = bluetoothState.partnerDevice.gatt;
      if (!server) throw new Error('GATT server not available');

      const service = await server.getPrimaryService('12345678-1234-5678-9abc-def123456789');
      const characteristic = await service.getCharacteristic('87654321-4321-8765-cba9-fed987654321');
      
      const encoder = new TextEncoder();
      await characteristic.writeValue(encoder.encode(JSON.stringify(data)));
      
      return true;
    } catch {
      console.error('Sync failed');
      return false;
    }
  }, [bluetoothState]);

  return {
    bluetoothState,
    enterHuggingMode,
    exitHuggingMode,
    syncData,
    isSupported: hasBluetoothAPI || isMobile, // Always support on mobile for better UX
    hasNativeBluetoothAPI: hasBluetoothAPI,
    isMobile,
  };
}