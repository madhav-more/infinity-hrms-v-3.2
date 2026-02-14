import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import theme from '../../../constants/theme';
import LeaveService from '../../../services/employee/leaveService';
import { useAuth } from '../../../context/AuthContext';
import StatusBadge from '../../../components/common/StatusBadge';

const MyLeavesScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    // State
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [leaves, setLeaves] = useState([]);

    // Fetch leaves on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchMyLeaves();
        }, [])
    );

    const fetchMyLeaves = async () => {
        setLoading(true);
        try {
            const data = await LeaveService.getMyLeaves();
            setLeaves(data || []);
        } catch (error) {
            console.error('Fetch leaves error:', error);
            Alert.alert('Error', 'Failed to fetch leaves');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMyLeaves();
    };

    const handleCancelLeave = (leaveId, status) => {
        if (status !== 'Pending') {
            Alert.alert('Info', 'Only pending leaves can be cancelled');
            return;
        }

        Alert.alert(
            'Cancel Leave',
            'Are you sure you want to cancel this leave request?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await LeaveService.cancelLeave(leaveId);
                            Alert.alert('Success', 'Leave cancelled successfully');
                            fetchMyLeaves(); // Refresh list
                        } catch (error) {
                            console.error('Cancel leave error:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel leave');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return theme.colors.success;
            case 'pending':
                return theme.colors.warning;
            case 'rejected':
                return theme.colors.error;
            case 'cancelled':
                return theme.colors.textSecondary;
            default:
                return theme.colors.textTertiary;
        }
    };

    const renderLeaveItem = ({ item }) => {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);

        return (
            <View style={styles.leaveCard}>
                <View style={styles.leaveHeader}>
                    <View style={styles.leaveHeaderLeft}>
                        <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
                        <View style={styles.leaveDates}>
                            <Text style={styles.leaveDate}>{startDate.toDateString()}</Text>
                            {startDate.getTime() !== endDate.getTime() && (
                                <Text style={styles.leaveDate}>to {endDate.toDateString()}</Text>
                            )}
                        </View>
                    </View>
                    <StatusBadge status={item.overallStatus} />
                </View>

                <View style={styles.leaveDetails}>
                    <View style={styles.leaveDetailRow}>
                        <Text style={styles.leaveLabel}>Category:</Text>
                        <Text style={styles.leaveValue}>{item.category === 0 ? 'Full Day' : item.category === 1 ? 'Half Day' : item.category === 2 ? 'Early Going' : 'Late Coming'}</Text>
                    </View>
                    <View style={styles.leaveDetailRow}>
                        <Text style={styles.leaveLabel}>Total Days:</Text>
                        <Text style={styles.leaveValue}>{item.totalDays}</Text>
                    </View>
                    <View style={styles.leaveDetailRow}>
                        <Text style={styles.leaveLabel}>Reason:</Text>
                        <Text style={styles.leaveValueReason}>{item.reason}</Text>
                    </View>
                </View>

                {item.overallStatus === 'Pending' && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelLeave(item.id, item.overallStatus)}
                    >
                        <Ionicons name="close-circle-outline" size={18} color={theme.colors.error} />
                        <Text style={styles.cancelButtonText}>Cancel Leave</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No leave records found</Text>
            <Text style={styles.emptySubtext}>Apply for leave to see them here</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Text style={styles.headerTitle}>My Leaves</Text>
                <Text style={styles.headerSubtitle}>
                    {user?.name} ({user?.employeeCode || user?.emp_code})
                </Text>
            </View>

            {/* Leaves List */}
            {loading && !refreshing ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={leaves}
                    renderItem={renderLeaveItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    headerTitle: {
        ...theme.typography.h3,
        color: theme.colors.primary,
    },
    headerSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    leaveCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: 16,
        marginBottom: 12,
        ...theme.shadow.light,
    },
    leaveHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    leaveHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    leaveDates: {
        flex: 1,
    },
    leaveDate: {
        ...theme.typography.body,
        fontWeight: '600',
        color: theme.colors.text,
    },
    leaveDetails: {
        gap: 8,
    },
    leaveDetailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    leaveLabel: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        width: 100,
    },
    leaveValue: {
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        fontWeight: '500',
        flex: 1,
    },
    leaveValueReason: {
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        flex: 1,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.error,
        backgroundColor: '#FFEBEE',
        gap: 6,
    },
    cancelButtonText: {
        ...theme.typography.bodySmall,
        color: theme.colors.error,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        ...theme.typography.h4,
        color: theme.colors.textSecondary,
        marginTop: 16,
    },
    emptySubtext: {
        ...theme.typography.bodySmall,
        color: theme.colors.textTertiary,
        marginTop: 8,
    },
});

export default MyLeavesScreen;
