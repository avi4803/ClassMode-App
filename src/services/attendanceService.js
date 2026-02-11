import client from '../api/client';

/**
 * Attendance Service
 * Redesigned student-oriented attendance system integration.
 */

const getToken = (token) => {
  if (!token) return '';
  
  // If it's a string, it might be a JSON-stringified object from AsyncStorage
  if (typeof token === 'string') {
    if (token.startsWith('{')) {
      try {
        const parsed = JSON.parse(token);
        return parsed.token || token;
      } catch (e) {
        return token;
      }
    }
    return token;
  }
  
  // If it's already an object
  if (typeof token === 'object') {
    return token.token || JSON.stringify(token);
  }
  
  return token;
};

const getTodayDashboard = async (token) => {
  try {
    const rawToken = getToken(token);
    const response = await client.get('/attendance/today', {
      headers: { 'x-access-token': rawToken }
    });
    return response.data;
  } catch (error) {
    console.error("Get Today Dashboard Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const getActiveClass = async (token) => {
  try {
    const rawToken = getToken(token);
    const response = await client.get('/attendance/active', {
      headers: { 'x-access-token': rawToken }
    });
    return response.data;
  } catch (error) {
    console.error("Get Active Class Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const markAttendance = async (token, sessionId, status) => {
  try {
    const rawToken = getToken(token);
    const response = await client.post(`/attendance/mark/${sessionId}`, { status }, {
      headers: { 'x-access-token': rawToken }
    });
    return response.data;
  } catch (error) {
    console.error("Mark Attendance Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const getSubjectAnalytics = async (token, timeRange = 'all') => {
  try {
    const rawToken = getToken(token);
    const response = await client.get('/attendance/stats', {
      params: { timeRange },
      headers: { 'x-access-token': rawToken }
    });
    return response.data;
  } catch (error) {
    console.error("Get Subject Analytics Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const getSubjectHistory = async (token, subjectId, limit = 50, skip = 0, startDate, endDate) => {
  try {
    const rawToken = getToken(token);
    const response = await client.get(`/attendance/history/${subjectId}`, {
      params: { limit, skip, startDate, endDate },
      headers: { 'x-access-token': rawToken }
    });
    return response.data;
  } catch (error) {
    console.error("Get Subject History Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const getGlobalHistory = async (token, params = {}) => {
  try {
    const rawToken = getToken(token);
    const response = await client.get('/attendance/history', {
      params: {
        limit: params.limit || 50,
        skip: params.skip || 0,
        startDate: params.startDate,
        endDate: params.endDate
      },
      headers: { 'x-access-token': rawToken }
    });
    return response.data;
  } catch (error) {
    console.error("Get Global History Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

export default {
  getTodayDashboard,
  getActiveClass,
  markAttendance,
  getSubjectAnalytics,
  getSubjectHistory,
  getGlobalHistory
};
