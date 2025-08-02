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

  const enterHuggingMode = useCallback(async () => {
    if (!navigator.bluetooth) {
      throw new Error('Bluetooth is not supported on this device');
    }

    try {
      setBluetoothState(prev => ({ ...prev, isHuggingMode: true }));
      
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['health_planner_service'] }],
        optionalServices: ['health_planner_service']
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
  }, []);

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

      const service = await server.getPrimaryService('health_planner_service');
      const characteristic = await service.getCharacteristic('sync_data');
      
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
    isSupported: typeof navigator !== 'undefined' && !!navigator.bluetooth,
  };
}