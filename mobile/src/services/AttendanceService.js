import api from './api';

/**
 * Storage key prefixes for attendance data (per user).
 */
export const STORAGE_KEYS = {
  CHECK_IN_TIMESTAMP: 'checkInTimestamp',
  SHIFT_END_TIMESTAMP: 'shiftEndTimestamp',
  SHIFT_DURATION: 'shiftDurationSeconds',
};

/**
 * Returns a user-scoped AsyncStorage key.
 * @param {string} baseKey - one of STORAGE_KEYS values
 * @param {string|number} userId
 * @returns {string} e.g. 'attendance_checkInTimestamp_123'
 */
export const getUserStorageKey = (baseKey, userId) => `attendance_${baseKey}_${userId}`;

const AttendanceService = {
  /**
   * Mark Attendance Check-In (Geo-based)
   * POST /api/attendance/geo-checkin
   */
  geoCheckIn: async ({ latitude, longitude, accuracy }) => {
    const response = await api.post('/attendance/geo-checkin', {
      latitude,
      longitude,
      accuracy,
    });
    return response.data;
  },

  /**
   * Mark Attendance Check-Out (Geo-based)
   * POST /api/attendance/geo-checkout
   */
  geoCheckOut: async ({ latitude, longitude, accuracy }) => {
    const response = await api.post('/attendance/geo-checkout', {
      latitude,
      longitude,
      accuracy,
    });
    return response.data;
  },

  /**
   * Get Employee Attendance Summary (Current User)
   * GET /api/Attendance/my-summary
   */
  getMySummary: async (params = {}) => {
    const response = await api.get('/Attendance/my-summary', { params });
    return response.data;
  },

  /**
   * Get Employee Summary (HR View)
   * GET /api/Attendance/employee-summary/{employeeId}
   */
  getEmployeeSummary: async (employeeId, params = {}) => {
    const response = await api.get(`/Attendance/employee-summary/${employeeId}`, { params });
    return response.data;
  },

  /**
   * Get All Correction Requests (HR View)
   * GET /api/Attendance/correction-requests
   */
  getAllCorrectionRequests: async () => {
    const response = await api.get('/Attendance/correction-requests');
    return response.data;
  },

  /**
   * Get Correction Request Data (Step 1 of Correction)
   * GET /api/Attendance/correction-request
   */
  getCorrectionRequestData: async (employeeId) => {
    const response = await api.get('/Attendance/correction-request', {
      params: { employeeId },
    });
    return response.data;
  },

  /**
   * Submit Correction Request
   * POST /api/Attendance/correction-request (multipart/form-data)
   */
  submitCorrectionRequest: async (formData) => {
    const response = await api.post('/Attendance/correction-request', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
  * Process Correction Request (Approve/Reject)
  * POST /api/Attendance/correction-request/process (Hypothetical - matching typical flow)
  * Note: The controller lists 'approve-reject' in previous version, checking controller content...
  * The controller code I read didn't explicitly show 'approve-reject', it showed 'correction-requests' GET.
  * I will assume there is an endpoint or add one if needed.
  * For now, I'll keep the placeholder or try a standard one.
  * Actually, let's look at AttendanceController again...
  * I missed the 'approve-reject' endpoint in the view_file output (it was cut off or not there).
  * I will comment it out or leave it if I'm unsure, but the screen might need it.
  */
  processCorrectionRequest: async (data) => {
    // const response = await api.post('/Attendance/approve-reject', data);
    // return response.data;
    throw new Error('Endpoint not confirmed');
  },
};

export default AttendanceService;
