import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AttendanceTable from '../../../components/common/AttendanceTable';
import DatePickerInput from '../../../components/common/DatePickerInput';
import GradientButton from '../../../components/common/GradientButton';
import theme from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import AttendanceService from '../../../services/AttendanceService';

const AttendanceSummaryScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    // State - store dates as strings in YYYY-MM-DD format
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);

    // Helper to format date to YYYY-MM-DD
    const formatDateToString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Default dates: 30 days back to today
    const defaultFromDate = new Date(new Date().setDate(new Date().getDate() - 30));
    const defaultToDate = new Date();

    const [fromDate, setFromDate] = useState(formatDateToString(defaultFromDate));
    const [toDate, setToDate] = useState(formatDateToString(defaultToDate));

    useEffect(() => {
        fetchAttendanceSummary();
    }, []);

    const fetchAttendanceSummary = async () => {
        setLoading(true);
        try {
            // Validate dates
            if (!fromDate || !toDate) {
                Alert.alert('Validation', 'Please select both from and to dates');
                setLoading(false);
                return;
            }

            const fromDateObj = new Date(fromDate);
            const toDateObj = new Date(toDate);

            if (fromDateObj > toDateObj) {
                Alert.alert('Validation', 'From date cannot be after To date');
                setLoading(false);
                return;
            }

            console.log('Fetching attendance from:', fromDate, 'to:', toDate);

            const data = await AttendanceService.getMySummary({
                from: fromDate,
                to: toDate
            });

            // console.log('Attendance data received:', data);

            if (data && data.records) {
                setAttendanceData(data.records);
            } else {
                setAttendanceData([]);
            }
        } catch (error) {
            console.error('Fetch summary error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to fetch attendance summary');
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCorrectionRequest = (record) => {
        // Check if correction is allowed
        if (!record.token) {
            Alert.alert('Not Allowed', 'Correction request is not available for this record');
            return;
        }

        if (record.correctionStatus === 'Pending') {
            Alert.alert('Already Requested', 'A correction request is already pending for this record');
            return;
        }

        if (record.correctionStatus === 'Approved') {
            Alert.alert('Already Approved', 'Correction has already been approved for this record');
            return;
        }

        navigation.navigate('Regularization', {
            attendanceRecord: record
        });
    };

    return (
        <View style={styles.container}>
            <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
                <Text style={styles.headerTitle}>
                    Attendance Summary
                </Text>
                <Text style={styles.headerSubtitle}>
                    {user?.name} ({user?.employeeCode || user?.emp_code})
                </Text>
            </View>

            <View style={styles.filterContainer}>
                <View style={styles.dateInputWrapper}>
                    <DatePickerInput
                        label="From Date"
                        value={fromDate}
                        onChange={setFromDate}
                        maximumDate={new Date()}
                    />
                </View>
                <View style={styles.dateInputWrapper}>
                    <DatePickerInput
                        label="To Date"
                        value={toDate}
                        onChange={setToDate}
                        maximumDate={new Date()}
                    />
                </View>
            </View>

            <View style={styles.filterBtnContainer}>
                <GradientButton
                    title="Apply Filter"
                    onPress={fetchAttendanceSummary}
                    icon={<Ionicons name="filter" size={16} color="#FFF" />}
                    style={{ height: 48 }}
                />
            </View>

            <View style={styles.mainContent}>
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Loading attendance records...</Text>
                    </View>
                ) : attendanceData.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={64} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>No attendance records found</Text>
                        <Text style={styles.emptySubtext}>
                            Try selecting a different date range
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.recordCount}>
                                {attendanceData.length} {attendanceData.length === 1 ? 'Record' : 'Records'} Found
                            </Text>
                        </View>
                        <AttendanceTable
                            data={attendanceData}
                            onRequestCorrection={handleCorrectionRequest}
                        />
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    headerTitle: {
        ...theme.typography.h4,
        color: theme.colors.primary,
        textAlign: 'center',
        fontWeight: '700',
    },
    headerSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: theme.colors.surface,
        gap: 12,
    },
    dateInputWrapper: {
        flex: 1,
    },
    filterBtnContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    mainContent: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        ...theme.typography.h5,
        color: theme.colors.textSecondary,
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        ...theme.typography.body,
        color: theme.colors.textTertiary,
        marginTop: 8,
        textAlign: 'center',
    },
    summaryHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.surfaceAlt || '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    recordCount: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
});

export default AttendanceSummaryScreen;
