
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Alert } from 'react-native';
import AttendanceService, { STORAGE_KEYS, getUserStorageKey } from '../services/AttendanceService';
import { useAuth } from './AuthContext';
import * as Location from 'expo-location';

const AttendanceContext = createContext(null);

// Constants
const SHIFT_DURATION_MON_FRI_SECONDS = 8.5 * 3600; // 30600
const SHIFT_DURATION_SAT_SECONDS = 7 * 3600; // 25200

// Helper: shift duration based on a given date
const getShiftDurationForDate = (date) => {
  const day = date.getDay(); // 0 Sun ... 6 Sat
  return day === 6 ? SHIFT_DURATION_SAT_SECONDS : SHIFT_DURATION_MON_FRI_SECONDS;
};

const isoDateOnly = (d) => d.toISOString().slice(0, 10);
const addDays = (d, days) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

export const AttendanceProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id; // Assuming user.id corresponds to what AttendanceService expects

  // ----- State -----
  const [attendanceStatus, setAttendanceStatus] = useState('NOT_CHECKED_IN'); // NOT_CHECKED_IN | CHECKED_IN | CHECKED_OUT
  const [checkInTime, setCheckInTime] = useState(null); // Date object
  const [shiftEndTime, setShiftEndTime] = useState(null); // Date object
  const [checkOutTime, setCheckOutTime] = useState(null); // Date object
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(false); // For async operations

  const timerRef = useRef(null);
  const syncInFlightRef = useRef(false);

  // ----- Per-user keys -----
  const keys = useMemo(() => {
    if (!userId) return null;
    return {
      checkIn: getUserStorageKey(STORAGE_KEYS.CHECK_IN_TIMESTAMP, userId),
      shiftEnd: getUserStorageKey(STORAGE_KEYS.SHIFT_END_TIMESTAMP, userId),
      duration: getUserStorageKey(STORAGE_KEYS.SHIFT_DURATION, userId),
    };
  }, [userId]);

  // ----- Helpers -----

  const computeRemainingSeconds = useCallback((endTime) => {
    if (!endTime) return 0;
    const diffMs = endTime.getTime() - Date.now();
    return Math.max(0, Math.floor(diffMs / 1000));
  }, []);

  const clearLocalState = useCallback(async () => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }
    setAttendanceStatus('NOT_CHECKED_IN');
    setCheckInTime(null);
    setShiftEndTime(null);
    setCheckOutTime(null);
    setRemainingSeconds(0);
    
    if (keys) {
        try {
            await AsyncStorage.multiRemove([keys.checkIn, keys.shiftEnd, keys.duration]);
        } catch (e) {
            console.error('Failed to clear local persistence', e);
        }
    }
  }, [keys]);

  const persistState = useCallback(async (cInTime, sEndTime, duration) => {
      if (!keys) return;
      try {
          await AsyncStorage.multiSet([
              [keys.checkIn, String(cInTime.getTime())],
              [keys.shiftEnd, String(sEndTime.getTime())],
              [keys.duration, String(duration)],
          ]);
      } catch (e) {
          console.error('Failed to persist state', e);
      }
  }, [keys]);

  // ----- Core Logic -----

  const startTimer = useCallback((endTime) => {
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Update immediately
      setRemainingSeconds(computeRemainingSeconds(endTime));

      timerRef.current = setInterval(() => {
          const remaining = computeRemainingSeconds(endTime);
          setRemainingSeconds(remaining);
          if (remaining <= 0) {
              clearInterval(timerRef.current);
              timerRef.current = null;
          }
      }, 1000);
  }, [computeRemainingSeconds]);

  // Restore from local storage on mount/login
  const bootstrapAsync = useCallback(async () => {
      if (!keys) return;

      try {
          const pairs = await AsyncStorage.multiGet([keys.checkIn, keys.shiftEnd]);
          const map = Object.fromEntries(pairs);
          
          const storedCheckIn = map[keys.checkIn];
          const storedShiftEnd = map[keys.shiftEnd];

          if (storedCheckIn && storedShiftEnd) {
              const cIn = new Date(parseInt(storedCheckIn));
              const sEnd = new Date(parseInt(storedShiftEnd));

              // If valid dates?
              if (!isNaN(cIn.getTime()) && !isNaN(sEnd.getTime())) {
                  // Only restore if shift hasn't ended significantly long ago? 
                  // or just restore and let the user see "00:00:00" if expired.
                  // For now, restore state:
                  setCheckInTime(cIn);
                  setShiftEndTime(sEnd);
                  setAttendanceStatus('CHECKED_IN');
                  
                  // Restart timer if still active
                  if (sEnd > new Date()) {
                    startTimer(sEnd);
                  } else {
                      setRemainingSeconds(0);
                  }
              }
          }
      } catch (e) {
          console.error("Bootstrap error", e);
      }
  }, [keys, startTimer]);


  // Sync with Server - The Source of Truth
  const syncWithServer = useCallback(async () => {
      if (!userId || syncInFlightRef.current) return;
      syncInFlightRef.current = true;
      setLoading(true);

      try {
        const now = new Date();
        const fromDate = isoDateOnly(addDays(now, -2)); // Look back 2 days
        const toDate = isoDateOnly(now);

        const summary = await AttendanceService.getMySummary({ fromDate, toDate });
        const records = Array.isArray(summary?.records) ? summary.records : [];

        // Find open record (InTime exists, OutTime null)
        // BUG FIX: Parsing "HH:mm" to full Date
        // The API returns `date` (YYYY-MM-DDT...) and `inTime` (HH:mm:ss string or similar)
        
        let openRecord = null;
        let lastClosedRecord = null; // To show checked out status today

        // Sort by date desc
        records.sort((a,b) => new Date(b.date) - new Date(a.date));

        for(let r of records) {
             // Check if today's record is closed
             if (isoDateOnly(new Date(r.date)) === isoDateOnly(now)) {
                 if (r.inTime && r.outTime) {
                     lastClosedRecord = r;
                     break; // Found today's closed record
                 }
             }
             
             if (r.inTime && !r.outTime) {
                 openRecord = r;
                 break;
             }
        }

        if (openRecord) {
            // Reconstruct CheckIn DateTime
            // r.date is "2023-10-27T00:00:00"
            // r.inTime is "09:30:00" (TimeSpan serialized)
            
            const recordDate = new Date(openRecord.date);
            const timeParts = openRecord.inTime.split(':');
            if (timeParts.length >= 2) {
                recordDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), parseInt(timeParts[2] || 0));
                
                const cIn = recordDate;
                
                // Calculate Shift End
                const duration = getShiftDurationForDate(cIn);
                const sEnd = new Date(cIn.getTime() + duration * 1000);

                // Update State
                setAttendanceStatus('CHECKED_IN');
                setCheckInTime(cIn);
                setShiftEndTime(sEnd);
                setCheckOutTime(null);
                
                // Persist & Timer
                await persistState(cIn, sEnd, duration);
                
                if (sEnd > new Date()) {
                    startTimer(sEnd);
                } else {
                    setRemainingSeconds(0);
                }
            }
        } else if (lastClosedRecord) {
             // Today user has checked out
             setAttendanceStatus('CHECKED_OUT');
             const recordDate = new Date(lastClosedRecord.date);
             // We might need outTime parsing same as inTime
             // Assuming similar format
             
             // Just show checked out state, timestamp less critical for timer logic
             setCheckInTime(null); 
             setShiftEndTime(null);
             
             // Clear persistence
             await clearLocalState();
             setAttendanceStatus('CHECKED_OUT');

        } else {
            // No relevant records
            await clearLocalState();
        }

      } catch (e) {
          console.error("Sync error", e);
      } finally {
          setLoading(false);
          syncInFlightRef.current = false;
      }

  }, [userId, persistState, clearLocalState, startTimer]);


  // Actions
  const markCheckIn = async () => {
      setLoading(true);
      try {
          // 1. Get Location
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Location is required.');
              return;
          }
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          
          // 2. Call API
          const res = await AttendanceService.geoCheckIn({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              accuracy: loc.coords.accuracy
          });

          // 3. Sync State (trust server mostly, but optimistically set if success)
          // Ideally rely on syncWithServer to parse response correctly
          // But for immediate feedback:
          
          await syncWithServer(); 
          Alert.alert("Success", "Checked In Successfully");

      } catch (e) {
          Alert.alert("Error", e?.response?.data?.message || e.message);
      } finally {
          setLoading(false);
      }
  };

  const markCheckOut = async () => {
    setLoading(true);
      try {
          // 1. Get Location
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Location is required.');
              return;
          }
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          
          // 2. Call API
          await AttendanceService.geoCheckOut({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              accuracy: loc.coords.accuracy
          });

          // 3. Update State
          await clearLocalState();
          setAttendanceStatus('CHECKED_OUT');
          
          Alert.alert("Success", "Checked Out Successfully");
          await syncWithServer(); // Verify

      } catch (e) {
          Alert.alert("Error", e?.response?.data?.message || e.message);
      } finally {
          setLoading(false);
      }
  };

  // ----- Effects -----

  // On Mount / User Change
  useEffect(() => {
     if (userId) {
         bootstrapAsync().then(() => {
             syncWithServer();
         });
     } else {
         clearLocalState();
     }
  }, [userId, bootstrapAsync, syncWithServer, clearLocalState]);

  // App State Change (Foreground)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active' && userId) {
            syncWithServer();
        }
    });
    return () => sub.remove();
  }, [userId, syncWithServer]);


  return (
      <AttendanceContext.Provider value={{
          attendanceStatus,
          checkInTime,
          shiftEndTime,
          checkOutTime,
          remainingSeconds,
          loading,
          markCheckIn,
          markCheckOut,
          syncWithServer
      }}>
          {children}
      </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);
