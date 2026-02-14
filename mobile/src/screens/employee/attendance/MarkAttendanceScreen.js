import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import { useAttendance } from '../../../context/AttendanceContext';

// ---------- Constants ----------
const getShiftLabel = () => (new Date().getDay() === 6 ? '7-Hour Shift' : '8-Hour 30-Minute Shift');

const MarkAttendanceScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Consuming Global Context
  const {
    attendanceStatus,
    checkInTime,
    checkOutTime,
    remainingSeconds,
    loading,
    markCheckIn,
    markCheckOut,
    syncWithServer
  } = useAttendance();

  // ----- UI helpers -----
  const getCurrentDate = () =>
    new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (date) => {
    if (!date) return null;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCountdown = (seconds) => {
    const s = Math.max(0, seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`;
  };

  const handleCheckIn = () => {
    markCheckIn();
  };

  const handleCheckOut = () => {
    Alert.alert('Confirm Check-Out', 'Are you sure you want to check out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Check Out',
        style: 'destructive',
        onPress: () => markCheckOut(),
      },
    ]);
  };

  // Refresh on mount is handled by Context, but we can force sync if needed
  useEffect(() => {
    syncWithServer();
  }, []);

  // ----- Render -----
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={[styles.headerBg, { height: insets.top + 60 }]} />

      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Attendance Panel</Text>
        <Text style={styles.subtitle}>Track your work hours & check-in / check-out status</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="time" size={24} color={theme.colors.white} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Attendance Panel</Text>
              <Text style={styles.cardSubtitle}>Track your work hours & check-in / check-out status</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {attendanceStatus === 'CHECKED_IN' || attendanceStatus === 'CHECKED_OUT' || checkInTime ? (
            <View style={styles.statusRow}>
              <Ionicons name="log-in-outline" size={20} color={theme.colors.success} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>CHECK-IN TIME</Text>
                <Text style={styles.statusValue}>
                  {checkInTime ? `${getCurrentDate()}, ${formatTime(checkInTime)}` : 'Checked In'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <Ionicons name="log-in-outline" size={20} color={theme.colors.textTertiary} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>CHECK-IN TIME</Text>
                <Text style={styles.statusValue}>Not Checked In</Text>
              </View>
            </View>
          )}

          {(attendanceStatus === 'CHECKED_OUT' || checkOutTime) && (
            <View style={[styles.statusRow, { marginTop: 16 }]}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>CHECK-OUT TIME</Text>
                <Text style={styles.statusValue}>
                  {checkOutTime ? `${getCurrentDate()}, ${formatTime(checkOutTime)}` : 'Checked Out'}
                </Text>
              </View>
            </View>
          )}

          {attendanceStatus === 'CHECKED_IN' && (
            <View style={styles.timerContainer}>
              <Ionicons name="hourglass-outline" size={18} color={theme.colors.warning} />
              <Text style={styles.timerLabel}>Time Remaining ({getShiftLabel()})</Text>
              <Text style={styles.timerValue}>{formatCountdown(remainingSeconds)}</Text>
            </View>
          )}

          <View style={styles.actionContainer}>
            {attendanceStatus === 'NOT_CHECKED_IN' && (
              <TouchableOpacity
                style={[styles.button, styles.checkInButton]}
                onPress={handleCheckIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="location" size={18} color="#FFF" />
                    <Text style={styles.buttonText}>Geo Check In</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {attendanceStatus === 'CHECKED_IN' && (
              <TouchableOpacity
                style={[styles.button, styles.checkOutButton]}
                onPress={handleCheckOut}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="location" size={18} color="#FFF" />
                    <Text style={styles.buttonText}>Geo Check Out</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {attendanceStatus === 'CHECKED_OUT' && (
              <View style={styles.completedContainer}>
                <Text style={styles.completedText}>Attendance Marked for Today</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ----- Styles (unchanged) -----
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0 },
  content: { padding: 20 },
  title: { ...theme.typography.h2, marginBottom: 8 },
  subtitle: { ...theme.typography.bodySmall, marginBottom: 24 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.medium,
    marginTop: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTitle: { ...theme.typography.h4, fontWeight: '700' },
  cardSubtitle: { ...theme.typography.captionSmall, color: theme.colors.textSecondary },
  divider: { height: 1, backgroundColor: theme.colors.divider, marginVertical: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'flex-start' },
  statusInfo: { marginLeft: 12 },
  statusLabel: { ...theme.typography.label, color: theme.colors.success, marginBottom: 4 },
  statusValue: { ...theme.typography.body, fontWeight: '600' },
  timerContainer: { alignItems: 'center', marginTop: 24, marginBottom: 24 },
  timerLabel: { ...theme.typography.bodySmall, marginTop: 8, marginBottom: 4 },
  timerValue: { fontSize: 36, fontWeight: '800', color: theme.colors.error, letterSpacing: 2 },
  actionContainer: { marginTop: 16 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.full || 30,
    gap: 8,
  },
  checkInButton: { backgroundColor: theme.colors.success },
  checkOutButton: { backgroundColor: theme.colors.error },
  buttonText: { ...theme.typography.button, fontSize: 16, fontWeight: '700' },
  completedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#DEF7EC',
  },
  completedText: { ...theme.typography.body, color: theme.colors.success, fontWeight: '600' },
});

export default MarkAttendanceScreen;
