import api from "../api";

const EmployeeService = {
    /**
     * Fetch current user's profile
     * GET /api/employees/my-profile
     */
    getProfile: async () => {
        try {
            const response = await api.get('/employees/my-profile');
            return response.data;
        } catch (error) {
            console.error('Profile fetch error:', error?.response?.data || error?.message || error);
            throw error;
        }
    },

    /**
     * Fetch all employees (HR functionality)
     * GET /api/employees
     */
    getAllEmployees: async () => {
        try {
            const response = await api.get('/employees');
            return response.data;
        } catch (error) {
            console.error('Fetch all employees error:', error?.response?.data || error?.message || error);
            throw error;
        }
    },

    /**
     * Get employee by ID
     * GET /api/employees/{id}
     */
    getEmployeeById: async (id) => {
        try {
            const response = await api.get(`/employees/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Fetch employee ${id} error:`, error?.response?.data || error?.message || error);
            throw error;
        }
    },

    /**
     * Create new employee
     * POST /api/employees
     */
    createEmployee: async (employeeData) => {
        try {
            const response = await api.post('/employees', employeeData);
            return response.data;
        } catch (error) {
            console.error('Create employee error:', error?.response?.data || error?.message || error);
            throw error;
        }
    }
};

export default EmployeeService;
