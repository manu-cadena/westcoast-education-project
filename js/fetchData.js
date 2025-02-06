const API_URL = 'http://localhost:3000';

// Generic fetch function to avoid code repetition
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, options);
    if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null; // Return null so we can handle errors gracefully
  }
}

// Fetch all courses
export async function fetchCourses() {
  return fetchAPI('courses');
}

// Fetch a single course by ID
export async function fetchCourseById(courseId) {
  return fetchAPI(`courses/${courseId}`);
}

// Fetch all bookings
export async function fetchBookings() {
  return fetchAPI('bookings');
}

// Fetch a single booking by ID
export async function fetchBookingById(bookingId) {
  return fetchAPI(`bookings/${bookingId}`);
}

// Fetch all users
export async function fetchUsers() {
  return fetchAPI('users');
}

// Fetch a single user by ID
export async function fetchUserById(userId) {
  return fetchAPI(`users/${userId}`);
}

// Submit a new booking
export async function postBooking(bookingData) {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    return response.ok; // Returns true if successful, false otherwise
  } catch (error) {
    console.error('Error posting booking:', error);
    return false;
  }
}
