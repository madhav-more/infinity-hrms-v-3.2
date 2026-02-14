import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '../../../constants/theme';
import LeaveService from '../../../services/employee/leaveService';
import { useAuth } from '../../../context/AuthContext';
import GradientButton from '../../../components/common/GradientButton';

const ApplyLeaveScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    // State
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState(0); // 0=FullDay, 1=HalfDay, 2=EarlyGoing, 3=LateComing
    const [leaveType, setLeaveType] = useState('FullDay');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [timeValue, setTimeValue] = useState('');
    const [reason, setReason] = useState('');
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Category options
    const categories = [
        { id: 0, label: 'Full Day', value: 'FullDay' },
        { id: 1, label: 'Half Day', value: 'HalfDay' },
        { id: 2, label: 'Early Going', value: 'EarlyGoing' },
        { id: 3, label: 'Late Coming', value: 'LateComing' }
    ];

    const handleCategorySelect = (cat) => {
        setCategory(cat.id);
        setLeaveType(cat.value);
    };

    const handleStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
            // Auto-set end date to same day for single day leave
            if (selectedDate > endDate) {
                setEndDate(selectedDate);
            }
        }
    };

    const handleEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    const validateForm = () => {
        if (!reason.trim()) {
            Alert.alert('Validation Error', 'Please enter a reason for leave');
            return false;
        }

        if (category === 2 || category === 3) { // EarlyGoing or LateComing
            if (!timeValue.trim()) {
                Alert.alert('Validation Error', 'Please enter time for Early Going / Late Coming');
                return false;
            }
            // Validate time format HH:MM
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(timeValue)) {
                Alert.alert('Validation Error', 'Please enter time in HH:MM format (e.g., 14:30)');
                return false;
            }
        }

        if (endDate < startDate) {
            Alert.alert('Validation Error', 'End date cannot be before start date');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const leaveData = {
                category: category,
                leaveType: leaveType,
                startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD
                endDate: endDate.toISOString().split('T')[0],
                timeValue: (category === 2 || category === 3) ? timeValue : null,
                reason: reason.trim()
            };

            const response = await LeaveService.applyLeave(leaveData);

            Alert.alert(
                'Success',
                response.message || 'Leave applied successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form
                            setCategory(0);
                            setLeaveType('FullDay');
                            setStartDate(new Date());
                            setEndDate(new Date());
                            setTimeValue('');
                            setReason('');
                            // Navigate to My Leaves
                            navigation.navigate('MyLeavesScreen');
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Apply leave error:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to apply leave. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 20 }]}
        >
            {/* Header */}
            <View style={styles.headerCard}>
                <View style={styles.headerTopRow}>
                    <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => navigation.navigate('LeaveBalance')}
                    >
                        <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                        <Text style={styles.historyButtonText}>My Leaves</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerTitle}>Apply for Leave</Text>
                <Text style={styles.headerSubtitle}>
                    {user?.name} ({user?.employeeCode || user?.emp_code})
                </Text>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
                {/* Category Selection */}
                <Text style={styles.label}>Leave Category *</Text>
                <View style={styles.categoryContainer}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryButton,
                                category === cat.id && styles.categoryButtonActive
                            ]}
                            onPress={() => handleCategorySelect(cat)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    category === cat.id && styles.categoryTextActive
                                ]}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Date Range */}
                <Text style={styles.label}>Start Date *</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartDatePicker(true)}
                >
                    <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.dateText}>{startDate.toDateString()}</Text>
                </TouchableOpacity>

                {showStartDatePicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleStartDateChange}
                        minimumDate={new Date()}
                    />
                )}

                <Text style={styles.label}>End Date *</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}
                >
                    <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.dateText}>{endDate.toDateString()}</Text>
                </TouchableOpacity>

                {showEndDatePicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleEndDateChange}
                        minimumDate={startDate}
                    />
                )}

                {/* Time Value (conditional) */}
                {(category === 2 || category === 3) && (
                    <>
                        <Text style={styles.label}>Time (HH:MM) *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g., 14:30"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={timeValue}
                            onChangeText={setTimeValue}
                            keyboardType="numbers-and-punctuation"
                        />
                    </>
                )}

                {/* Reason */}
                <Text style={styles.label}>Reason *</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Enter reason for leave..."
                    placeholderTextColor={theme.colors.textTertiary}
                    multiline
                    numberOfLines={4}
                    value={reason}
                    onChangeText={setReason}
                    textAlignVertical="top"
                />

                {/* Total Days Info */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.colors.info} />
                    <Text style={styles.infoText}>
                        Total Days: {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1}
                    </Text>
                </View>

                {/* Submit Button */}
                <GradientButton
                    title={loading ? "Submitting..." : "Submit Leave Request"}
                    onPress={handleSubmit}
                    disabled={loading}
                    icon={<Ionicons name="paper-plane-outline" size={18} color="#FFF" />}
                    style={{ marginTop: 24 }}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    headerCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        ...theme.shadow.light,
    },
    headerTopRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    historyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceAlt || '#E3F2FD',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    historyButtonText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.primary,
        marginTop: 12,
    },
    headerSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    formCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: 20,
        ...theme.shadow.light,
    },
    label: {
        ...theme.typography.label,
        marginTop: 16,
        marginBottom: 8,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    categoryButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    categoryText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text,
    },
    categoryTextActive: {
        color: theme.colors.white,
        fontWeight: '600',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        gap: 12,
    },
    dateText: {
        ...theme.typography.body,
        color: theme.colors.text,
        flex: 1,
    },
    textInput: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: 12,
        fontSize: 14,
        color: theme.colors.text,
        backgroundColor: '#FFFFFF',
    },
    textArea: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: 12,
        fontSize: 14,
        color: theme.colors.text,
        backgroundColor: '#FFFFFF',
        minHeight: 100,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceAlt || '#E3F2FD',
        padding: 12,
        borderRadius: theme.borderRadius.sm,
        marginTop: 16,
        gap: 8,
    },
    infoText: {
        ...theme.typography.bodySmall,
        color: theme.colors.info || '#1976D2',
        fontWeight: '600',
    },
});

export default ApplyLeaveScreen;
