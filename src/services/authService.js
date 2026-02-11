import client from '../api/client';

const signupInit = async (data) => {
  try {
    const response = await client.post('/user/signup/init', data);
    return response.data;
  } catch (error) {
    console.log("API Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const signupVerify = async (data) => {
  try {
    const response = await client.post('/user/signup/verify', data);
    return response.data;
  } catch (error) {
    console.log("API Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const signupComplete = async (data, signupToken) => {
  try {
    const response = await client.post(
      '/user/signup/complete',
      data,
      {
        headers: {
          'x-signup-token': signupToken,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("API Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const login = async (data) => {
  try {
    const response = await client.post('/user/signin', data);
    return response.data;
  } catch (error) {
    console.log("Login Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const getColleges = async () => {
  try {
    const response = await client.get('/college/');
    return response.data;
  } catch (error) {
    console.log("Get Colleges Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const getBatches = async (collegeId) => {
  try {
    const response = await client.get(`/college/batch?collegeId=${collegeId}`);
    return response.data;
  } catch (error) {
    console.log("Get Batches Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const getSections = async (batchId) => {
  try {
    const response = await client.get(`/college/section?batchId=${batchId}`);
    return response.data;
  } catch (error) {
    console.log("Get Sections Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const getDashboard = async (token) => {
  try {
    const response = await client.get('/user/dashboard', {
      headers: { 'x-access-token': token }
    });
    return response.data;
  } catch (error) {
    console.log("Get Dashboard Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const uploadTimetableScan = async (token, imageUrl) => {
  try {
    const response = await client.post('/ocr/process', {
      imageUrl
    }, {
      headers: { 'x-access-token': token },
      timeout: 300000 // 5 minutes
    });
    return response.data;
  } catch (error) {
    console.log("Upload Scan Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const addExtraClass = async (token, data) => {
  try {
    const response = await client.post('/weekly-session/extra', data, {
      headers: { 'x-access-token': token }
    });
    return response.data;
  } catch (error) {
    console.log("Add Extra Class Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const getSubjects = async (token) => {
    try {
        const response = await client.get('/subjects/my-subjects', {
            headers: { 'x-access-token': token }
        });
        return response.data;
    } catch (error) {
        console.log("Get Subjects Error", error);
        throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
    }
};

const confirmTimetable = async (token, jobId, schedule) => {
    try {
      const response = await client.post(`/ocr/jobs/${jobId}/create-timetable`, {
        schedule
      }, {
        headers: { 'x-access-token': token },
        timeout: 300000 // 5 minutes
      });
      return response.data;
    } catch (error) {
      console.log("Confirm Timetable Error", error);
      throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
    }
  };

const cancelClass = async (token, id, reason = "Faculty is on leave") => {
  try {
    const response = await client.post(`/weekly-session/classes/${id}/cancel`, {
      reason
    }, {
      headers: { 'x-access-token': token }
    });
    return response.data;
  } catch (error) {
    console.log("Cancel Class Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const rescheduleClass = async (token, id, data) => {
  try {
    const response = await client.post(`/weekly-session/classes/${id}/reschedule`, data, {
      headers: { 'x-access-token': token }
    });
    return response.data;
  } catch (error) {
    console.log("Reschedule Class Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const getWeeklySchedule = async (token, date = null) => {
  try {
    const url = date ? `/weekly-session/my-schedule?date=${date}` : '/weekly-session/my-schedule';
    const response = await client.get(url, {
      headers: { 'x-access-token': token }
    });
    return response.data;
  } catch (error) {
    console.log("Get Weekly Schedule Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const getNotifications = async (token, params = {}) => {
  try {
    const response = await client.get('/notifications/me', {
      params,
      headers: { 'x-access-token': token }
    });
    return response.data;
  } catch (error) {
    console.log("Get Notifications Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const markNotificationAsRead = async (token, id) => {
  try {
    const response = await client.patch(`/notifications/${id}/read`, {}, {
      headers: { 'x-access-token': token }
    });
    return response.data;
  } catch (error) {
    console.log("Mark Notification Read Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const updateReminderSettings = async (token, settings) => {
  try {
    const response = await client.patch('/user/reminder-settings', settings, {
      headers: { 'x-access-token': token }
    });
    return response.data;
  } catch (error) {
    console.log("Update Reminder Settings Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await client.post('/user/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.log("Forgot Password Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const verifyResetOtp = async (email, otp) => {
  try {
    const response = await client.post('/user/verify-reset-otp', { email, otp });
    return response.data;
  } catch (error) {
    console.log("Verify Reset OTP Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

const resetPassword = async (password, resetToken) => {
  try {
    const response = await client.post('/user/reset-password', { password }, {
      headers: { 'x-reset-token': resetToken }
    });
    return response.data;
  } catch (error) {
    console.log("Reset Password Error", error);
    throw error.response ? error.response.data : { success: false, message: error.message || 'Network Error' };
  }
};

export default {
  signupInit,
  signupVerify,
  signupComplete,
  login,
  getColleges,
  getBatches,
  getSections,

  getDashboard,
  uploadTimetableScan,
  confirmTimetable,
  addExtraClass,
  getSubjects,
  getNotifications,
  getWeeklySchedule,
  markNotificationAsRead,
  updateReminderSettings,
  cancelClass,
  rescheduleClass,

  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
