import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import StatusBadge from './StatusBadge';

const AttendanceTable = ({ data, onRequestCorrection, isHrView = false }) => {

    const formatDate = (dateString) => {
        if (!dateString) return '--';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return '--';
        // If time is already in HH:MM format
        if (timeString.length === 5 && timeString.includes(':')) {
            return timeString;
        }
        // Try parsing as date-time
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return timeString;
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const formatWorkingHours = (hours) => {
        if (!hours) return '--';
        // If it's already formatted (like "8.5")
        if (typeof hours === 'number') {
            return `${hours.toFixed(1)}h`;
        }
        // If it's a string, return as-is
        return hours;
    };

    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, { flex: 1.2 }]}>Date</Text>
            <Text style={[styles.columnHeader, { flex: 0.9 }]}>In</Text>
            <Text style={[styles.columnHeader, { flex: 0.9 }]}>Out</Text>
            <Text style={[styles.columnHeader, { flex: 0.8 }]}>Hours</Text>
            <Text style={[styles.columnHeader, { flex: 1 }]}>Status</Text>
            <Text style={[styles.columnHeader, { flex: 1, textAlign: 'center' }]}>
                {isHrView ? 'Correction' : 'Action'}
            </Text>
        </View>
    );

    const renderCorrectionColumn = (item) => {
        // If correction is pending
        if (item.correctionStatus === 'Pending') {
            return (
                <View style={styles.correctionBadge}>
                    <Ionicons name="time-outline" size={12} color={theme.colors.warning} />
                    <Text style={styles.pendingText}>Pending</Text>
                </View>
            );
        }

        // If correction is approved
        if (item.correctionStatus === 'Approved') {
            return (
                <View style={styles.correctionBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                    <Text style={styles.approvedText}>Approved</Text>
                </View>
            );
        }

        // If correction is rejected
        if (item.correctionStatus === 'Rejected') {
            return (
                <View style={styles.correctionBadge}>
                    <Ionicons name="close-circle" size={16} color={theme.colors.error} />
                    <Text style={styles.rejectedText}>Rejected</Text>
                </View>
            );
        }

        // For HR view without correction
        if (isHrView) {
            return <Text style={styles.cellText}>--</Text>;
        }

        // For employee: Show Request button only if token exists
        if (item.token) {
            return (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onRequestCorrection(item)}
                >
                    <Ionicons name="create-outline" size={12} color="#FFF" />
                    <Text style={styles.actionButtonText}>Request</Text>
                </TouchableOpacity>
            );
        }

        // No token = no correction allowed
        return <Text style={[styles.cellText, { fontSize: 10 }]}>N/A</Text>;
    };

    const renderTableRow = (item, index) => {
        const isAlternate = index % 2 === 1;
        return (
            <View key={index} style={[styles.tableRow, isAlternate && styles.tableRowAlt]}>
                <Text style={[styles.cellText, { flex: 1.2, fontWeight: '600' }]}>
                    {formatDate(item.date)}
                </Text>
                <Text style={[styles.cellText, { flex: 0.9, color: theme.colors.success }]}>
                    {formatTime(item.inTime)}
                </Text>
                <Text style={[styles.cellText, { flex: 0.9, color: theme.colors.error }]}>
                    {formatTime(item.outTime)}
                </Text>
                <Text style={[styles.cellText, { flex: 0.8, fontWeight: '600' }]}>
                    {formatWorkingHours(item.workingHours)}
                </Text>
                <View style={{ flex: 1 }}>
                    <StatusBadge
                        status={item.status}
                        style={{
                            paddingHorizontal: 6,
                            paddingVertical: 3,
                            borderRadius: 4
                        }}
                        textStyle={{ fontSize: 10 }}
                    />
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    {renderCorrectionColumn(item)}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.tableContainer}>
            {renderTableHeader()}
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {data.length > 0 ? (
                    data.map((item, index) => renderTableRow(item, index))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="folder-open-outline" size={48} color={theme.colors.textTertiary} />
                        <Text style={styles.emptyText}>No attendance records</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    tableContainer: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        ...theme.shadow.light,
        overflow: 'hidden',
        marginHorizontal: 16,
        marginTop: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        paddingVertical: 14,
        paddingHorizontal: 10,
    },
    columnHeader: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.3,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
        alignItems: 'center',
    },
    tableRowAlt: {
        backgroundColor: theme.colors.surfaceAlt || '#F8FAFC',
    },
    cellText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        fontSize: 11,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        gap: 4,
        ...theme.shadow.light,
    },
    actionButtonText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    correctionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pendingText: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.warning,
    },
    approvedText: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.success,
    },
    rejectedText: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.error,
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    }
});

export default AttendanceTable;
