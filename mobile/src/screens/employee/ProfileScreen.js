import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Dimensions,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';

import EmployeeService from '../../services/employee/EmployeeService'; // Import Service
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    // State
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await EmployeeService.getProfile(); // Use Service
            setProfileData(data);
        } catch (error) {
            console.error('Fetch profile error:', error);
            Alert.alert('Error', 'Failed to load profile data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    // Mask sensitive data
    const maskPAN = (pan) => {
        if (!pan) return 'Not provided';
        return pan.substring(0, 4) + '****' + pan.substring(8);
    };

    const maskAadhaar = (aadhaar) => {
        if (!aadhaar) return 'Not provided';
        return '****-****-' + aadhaar.substring(aadhaar.length - 4);
    };

    const maskSalary = (salary) => {
        if (!salary) return 'Not disclosed';
        return '₹ *****';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const renderInfoRow = (icon, label, value, isSensitive = false) => (
        <View style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.infoLabel}>{label}</Text>
            </View>
            <View style={styles.infoRowRight}>
                <Text style={[styles.infoValue, isSensitive && styles.sensitiveValue]}>
                    {value || 'N/A'}
                </Text>
            </View>
        </View>
    );

    const renderSection = (title, icon, children) => (
        <View style={styles.section}>
            <LinearGradient
                colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
                style={styles.sectionInner}
            >
                <View style={styles.sectionTitleContainer}>
                    <Ionicons name={icon} size={22} color={theme.colors.primary} />
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <View style={styles.sectionContent}>{children}</View>
            </LinearGradient>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!profileData) {
        return (
            <View style={styles.loaderContainer}>
                <Text style={styles.errorText}>Failed to load profile</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const firstInitial = profileData.name?.charAt(0).toUpperCase() || '?';

    return (
        <View style={styles.container}>
            {/* Background Decorations */}
            <View style={styles.bgDecoration1} />
            <View style={styles.bgDecoration2} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                {/* Hero Section */}
                <LinearGradient
                    colors={theme.colors.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.heroSection, { paddingTop: insets.top + 20 }]}
                >
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarRing}>
                            <View style={styles.avatarBackground}>
                                <Text style={styles.avatarInitials}>{firstInitial}</Text>
                            </View>
                        </View>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                        </View>
                    </View>

                    <Text style={styles.heroName}>{profileData.name}</Text>
                    <View style={styles.heroTagContainer}>
                        <Text style={styles.heroTagText}>{profileData.employeeCode}</Text>
                    </View>

                    <Text style={styles.heroSubtext}>
                        {profileData.position || 'Employee'} • {profileData.department || 'N/A'}
                    </Text>

                    {/* Quick Highlights Bar */}
                    <View style={styles.highlightBar}>
                        <View style={styles.highlightItem}>
                            <Text style={styles.highlightLabel}>Joining</Text>
                            <Text style={styles.highlightValue}>
                                {formatDate(profileData.joiningDate) !== 'N/A'
                                    ? `${formatDate(profileData.joiningDate).split(' ')[1]} ${formatDate(profileData.joiningDate).split(' ')[2]}`
                                    : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.highlightDivider} />
                        <View style={styles.highlightItem}>
                            <Text style={styles.highlightLabel}>Role</Text>
                            <Text style={styles.highlightValue}>{profileData.role || 'User'}</Text>
                        </View>
                        <View style={styles.highlightDivider} />
                        <View style={styles.highlightItem}>
                            <Text style={styles.highlightLabel}>Status</Text>
                            <Text style={[styles.highlightValue, { color: theme.colors.success }]}>
                                {profileData.status || 'Active'}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.detailsContainer}>
                    {/* Personal Information */}
                    {renderSection(
                        'Personal Details',
                        'person-sharp',
                        <>
                            {renderInfoRow('mail-sharp', 'Email', profileData.email)}
                            {renderInfoRow('call-sharp', 'Mobile', profileData.mobileNumber)}
                            {renderInfoRow('calendar-sharp', 'Date of Birth', formatDate(profileData.doB_Date))}
                            {renderInfoRow('transgender-sharp', 'Gender', profileData.gender)}
                            {renderInfoRow('water-sharp', 'Blood Group', profileData.bloodGroup)}
                            {renderInfoRow('heart-sharp', 'Marital Status', profileData.maritalStatus)}
                        </>
                    )}

                    {/* Employment Details */}
                    {renderSection(
                        'Employment',
                        'briefcase-sharp',
                        <>
                            {renderInfoRow('business-sharp', 'Department', profileData.department)}
                            {renderInfoRow('ribbon-sharp', 'Position', profileData.position)}
                            {renderInfoRow('shield-checkmark-sharp', 'Role', profileData.role)}
                            {renderInfoRow('calendar-sharp', 'Joining Date', formatDate(profileData.joiningDate))}
                            {renderInfoRow('timer-sharp', 'Probation End', formatDate(profileData.probationEndDate))}
                        </>
                    )}

                    {/* Address Information */}
                    {renderSection(
                        'Contact & Residence',
                        'location-sharp',
                        <>
                            {renderInfoRow('home-sharp', 'Primary Address', profileData.addressLine1)}
                            {renderInfoRow('map-sharp', 'Address Line 2', profileData.addressLine2)}
                            {renderInfoRow('navigate-sharp', 'City & Pincode', `${profileData.city || ''} ${profileData.pincode || ''}`.trim() || 'N/A')}
                            {renderInfoRow('globe-sharp', 'State', profileData.state)}
                        </>
                    )}

                    {/* Bank & Finance */}
                    {renderSection(
                        'Financial Information',
                        'wallet-sharp',
                        <>
                            {renderInfoRow('business-sharp', 'Bank', profileData.bankName)}
                            {renderInfoRow('wallet-sharp', 'Account No.', profileData.accountNumber)}
                            {renderInfoRow('qr-code-sharp', 'IFSC Code', profileData.ifscCode)}
                            {renderInfoRow('person-circle-sharp', 'Holder', profileData.accountHolderName)}
                            {renderInfoRow('cash-sharp', 'Salary', maskSalary(profileData.salary), true)}
                        </>
                    )}

                    {/* Legal IDs */}
                    {renderSection(
                        'Verification IDs',
                        'shield-sharp',
                        <>
                            {renderInfoRow('card-sharp', 'PAN Card', maskPAN(profileData.panNumber), true)}
                            {renderInfoRow('finger-print-sharp', 'Aadhaar Card', maskAadhaar(profileData.aadhaarNumber), true)}
                        </>
                    )}

                    {/* Emergency Contact */}
                    {renderSection(
                        'Emergency Contacts',
                        'bandage-sharp',
                        <>
                            {renderInfoRow('person-sharp', 'Name', profileData.emergencyContactName)}
                            {renderInfoRow('call-sharp', 'Phone', profileData.emergencyContactNumber)}
                            {renderInfoRow('people-sharp', 'Relation', profileData.emergencyContactRelation)}
                        </>
                    )}
                </View>

                {/* Edit Button */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.editBtn}
                    onPress={() => Alert.alert('Request Profile Update', 'Profile edits are managed by HR. Please contact your HR manager to update sensitive information.')}
                >
                    <LinearGradient
                        colors={theme.colors.gradientPrimary}
                        style={styles.editBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="create-outline" size={20} color="#FFF" />
                        <Text style={styles.editBtnText}>Request Update</Text>
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>

            {/* Sticky Header Mimic for aesthetics if scrolled */}
            <View style={[styles.miniHeader, { top: insets.top }]}>
                <Text style={styles.miniHeaderTitle}>Employee Profile</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F9',
    },
    bgDecoration1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
    },
    bgDecoration2: {
        position: 'absolute',
        bottom: 100,
        left: -150,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F9',
    },
    errorText: {
        ...theme.typography.body,
        color: theme.colors.error,
        marginBottom: 16,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
    miniHeader: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingVertical: 10,
        zIndex: 10,
    },
    miniHeaderTitle: {
        ...theme.typography.caption,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    scrollContent: {
        // No horizontal padding here because Hero Section needs to be full width
    },
    heroSection: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 40,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        ...theme.shadow.dark,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarRing: {
        width: 106,
        height: 106,
        borderRadius: 53,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarBackground: {
        flex: 1,
        borderRadius: 50,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadow.medium,
    },
    avatarInitials: {
        fontSize: 42,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    statusBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFF',
        padding: 4,
        ...theme.shadow.light,
    },
    statusDot: {
        flex: 1,
        borderRadius: 10,
        backgroundColor: theme.colors.success,
    },
    heroName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    heroTagContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
        marginBottom: 8,
    },
    heroTagText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    heroSubtext: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 30,
    },
    highlightBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        width: width * 0.9,
        paddingVertical: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    highlightItem: {
        flex: 1,
        alignItems: 'center',
    },
    highlightLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 4,
    },
    highlightValue: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '700',
    },
    highlightDivider: {
        width: 1,
        height: '60%',
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    detailsContainer: {
        paddingHorizontal: 16,
        marginTop: -20, // Overlap effect
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...theme.shadow.light,
    },
    sectionInner: {
        padding: 20,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
        letterSpacing: -0.3,
    },
    sectionContent: {
        // Content padding handled by sectionInner
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    infoRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    infoRowRight: {
        flex: 1.2,
        alignItems: 'flex-end',
    },
    infoValue: {
        fontSize: 14,
        color: '#0F172A',
        fontWeight: '600',
        textAlign: 'right',
    },
    sensitiveValue: {
        color: theme.colors.warning,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    editBtn: {
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 40,
    },
    editBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 100,
        gap: 10,
        ...theme.shadow.medium,
    },
    editBtnText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default ProfileScreen;
