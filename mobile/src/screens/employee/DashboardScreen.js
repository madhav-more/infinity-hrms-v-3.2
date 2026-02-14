import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user, token, logout } = useAuth();

  // Consuming Global Attendance Context
  const { attendanceStatus, checkInTime, remainingSeconds } = useAttendance();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const employeeId = useMemo(() => {
    return user?.employeeId || null;
  }, [user]);

  /* ======================================================
        FETCH DASHBOARD
  ====================================================== */
  const fetchDashboard = useCallback(async () => {
    if (!employeeId) {
      setErrorMsg('Employee ID not available.');
      setLoading(false);
      return;
    }

    if (!token) {
      setErrorMsg('Session expired. Please login again.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Replace with your actual API endpoint
      const response = await fetch(
        `http://192.168.1.75:5000/api/employees/dashboard/${employeeId}?month=${currentMonth}&year=${currentYear}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.log('Dashboard API Error:', error);
      setErrorMsg(error.message);
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId, currentMonth, currentYear, token, logout]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* ======================================================
        HELPERS
  ====================================================== */
  const formatCountdown = (seconds) => {
    const s = Math.max(0, seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const getBirthdayMessage = () => {
    if (!user?.doB_Date) return null;
    const dob = new Date(user.doB_Date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth()) {
      return "🎉 Happy Birthday!";
    }
    if (dob.getDate() === tomorrow.getDate() && dob.getMonth() === tomorrow.getMonth()) {
      return "🎈 Birthday Alert: It's your birthday tomorrow!";
    }
    return null;
  };

  const birthdayMsg = getBirthdayMessage();

  /* ======================================================
        RENDER
  ====================================================== */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.center, { padding: 20 }]}>
        <View style={[styles.card, styles.errorCard, { width: '100%' }]}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Pressable style={styles.retryBtn} onPress={fetchDashboard}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const leaveDays = dashboard?.leaveDays ?? 0;
  const approvedLeaves = dashboard?.approvedLeaves ?? 0;

  // Using passed values from dashboard API
  const department = user?.department || 'IT Department';
  const position = user?.position || 'Software Engineer';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* HEADER SECTION */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={theme.colors.gradientHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.iconButtonBlur}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarText}>{user?.employeeName?.charAt(0) || 'U'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButtonBlur}
                onPress={() => navigation.navigate('AnnouncementsScreen')}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-outline" size={22} color="white" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>

            <View style={styles.welcomeContainer}>
              <Text style={styles.greetingText}>Good Morning,</Text>
              <Text style={styles.welcomeName}>{user?.employeeName || 'Employee'}</Text>
              <Text style={styles.welcomeRole}>{user?.employeeCode || 'EMP000'}</Text>
            </View>
          </LinearGradient>

          {/* OVERLAPPING STATUS CARD */}
          <View style={styles.statusCardWrapper}>
            <View style={[styles.statusCard, theme.shadow.medium]}>
              <View style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusLabel}>Current Status</Text>
                  <View style={[styles.statusBadge, attendanceStatus === 'CHECKED_IN' ? styles.statusActive : styles.statusInactive]}>
                    <View style={[styles.statusDot, { backgroundColor: attendanceStatus === 'CHECKED_IN' ? theme.colors.success : theme.colors.textSecondary }]} />
                    <Text style={[styles.statusText, attendanceStatus === 'CHECKED_IN' ? styles.statusTextActive : styles.statusTextInactive]}>
                      {attendanceStatus === 'CHECKED_IN' ? 'On Duty' : 'Off Duty'}
                    </Text>
                  </View>
                </View>

                {attendanceStatus === 'CHECKED_IN' && (
                  <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>Shift Ends In</Text>
                    <Text style={styles.timerValue}>{formatCountdown(remainingSeconds)}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* CELEBRATIONS CARD */}
          {birthdayMsg && (
            <View style={[styles.card, styles.celebrationCard]}>
              <Text style={styles.celebrationText}>{birthdayMsg}</Text>
            </View>
          )}

          {/* QUICK ACTIONS */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <ActionButton
              title="Mark Attendance"
              icon="location"
              color="#3B82F6"
              onPress={() => navigation.navigate('MarkAttendance')}
            />
            <ActionButton
              title="Summary"
              icon="time"
              color="#8B5CF6"
              onPress={() => navigation.navigate('AttendanceSummaryy')}
            />
            <ActionButton
              title="Apply Leave"
              icon="calendar"
              color="#10B981"
              onPress={() => navigation.navigate('ApplyLeave')}
            />
            <ActionButton
              title="Payslips"
              icon="receipt"
              color="#F59E0B"
              onPress={() => navigation.navigate('Payslips')}
            />
          </View>

          {/* STATISTICS / OVERVIEW */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statsCard, theme.shadow.light]}>
              <View style={[styles.statsIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="briefcase-outline" size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.statsValue}>{leaveDays}</Text>
              <Text style={styles.statsLabel}>Total Leaves</Text>
            </View>
            <View style={[styles.statsCard, theme.shadow.light]}>
              <View style={[styles.statsIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.success} />
              </View>
              <Text style={styles.statsValue}>{approvedLeaves}</Text>
              <Text style={styles.statsLabel}>Approved</Text>
            </View>
          </View>

          {/* PROFILE SUMMARY */}
          <View style={[styles.profileCard, theme.shadow.light]}>
            <View style={styles.profileRow}>
              <View style={styles.profileIconContainer}>
                <Ionicons name="person" size={20} color="white" />
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{department}</Text>
                <Text style={styles.profileRole}>{position}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  );
};

/* ======================================================
    REUSABLE COMPONENTS
====================================================== */
const ActionButton = ({ title, icon, color, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.actionBtn,
      pressed && styles.actionBtnPressed,
    ]}
  >
    <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.actionBtnText}>{title}</Text>
  </Pressable>
);

/* ======================================================
    STYLES
====================================================== */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },

  // Header Styles
  headerContainer: {
    marginBottom: 50, // Space for the overlapping card
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 50,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 1,
    borderColor: 'white',
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
  },
  welcomeRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Overlapping Status Card
  statusCardWrapper: {
    position: 'absolute',
    bottom: -35,
    left: 20,
    right: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusActive: {
    backgroundColor: '#ECFDF5',
  },
  statusInactive: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusTextActive: {
    color: theme.colors.success,
  },
  statusTextInactive: {
    color: theme.colors.textSecondary,
  },
  timerContainer: {
    alignItems: 'flex-end',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timerLabel: {
    fontSize: 10,
    color: theme.colors.primary,
    marginBottom: 2,
    fontWeight: '600',
  },
  timerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    fontVariant: ['tabular-nums'],
  },

  // Main Content
  mainContent: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    marginTop: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: (width - 56) / 2, // 20 padding * 2 + 16 gap
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.light,
  },
  actionBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statsCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Profile Card
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  profileRole: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },

  // Utilities
  celebrationCard: {
    backgroundColor: '#FFFBEB', // Amber-50
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 6,
  },
  celebrationText: {
    color: '#B45309',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  errorCard: {
    borderColor: theme.colors.error,
    borderWidth: 1,
    alignItems: 'center',
  },
  errorTitle: { ...theme.typography.h3, color: theme.colors.error, marginBottom: 8 },
  errorText: { ...theme.typography.body, textAlign: 'center' },
  retryBtn: { marginTop: 16, backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: 'white', fontWeight: 'bold' }
});

export default DashboardScreen;
