import client from '../api/client';

const holidayService = {
  // Add/Declare a Holiday (Admin Only)
  addHoliday: async (token, data) => {
    try {
      const response = await client.post('/holidays', data, {
        headers: {
          'x-access-token': token, // or `Authorization: Bearer ${token}` according to their setup, but their other APIs use x-access-token usually, wait, the user said `Authorization: Bearer <your-admin-jwt-token>`. Let's use `Authorization: Bearer ${token}`. But just in case, include both or check how authService works. Let's look at `authService.js` to see what headers they normally send.
        },
      });
      return response.data;
    } catch (error) {
      console.log('Add Holiday Error', error);
      return { success: false, message: error.message };
    }
  },

  // View/Get All Holidays for a College
  getHolidays: async (token) => {
    try {
      const response = await client.get('/holidays', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-access-token': token, // Added fallback since existing app usually uses x-access-token
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get Holidays Error', error);
      return { success: false, message: error.message };
    }
  },

  // Delete Holiday (Admin Only)
  // Backend requires calling DELETE /holidays/:date for EACH day in a range
  deleteHoliday: async (token, range) => {
    try {
      const dates = [];
      let start = new Date(range.startDate);
      const end = new Date(range.endDate || range.startDate);

      // Generate all dates in the range
      while (start <= end) {
        dates.push(start.toISOString().split('T')[0]);
        start.setDate(start.getDate() + 1);
      }

      // Perform deletion for each date
      const promises = dates.map(date => 
        client.delete(`/holidays/${date}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-access-token': token,
          }
        })
      );

      const results = await Promise.all(promises);
      
      // Check if all succeeded
      const allSuccess = results.every(res => res.data?.success || res.status === 200);
      
      return { 
        success: allSuccess, 
        message: allSuccess ? 'Holiday successfully removed.' : 'Some dates failed to delete.' 
      };
    } catch (error) {
      console.error('Delete Holiday Error', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};

export default holidayService;
