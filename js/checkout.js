import {
  getStoredCourses,
  removeStoredCourse,
  clearStoredCourses,
  getLocalStorageItem,
  logoutUser,
} from './localStorage.js';

import { fetchCourses, postBooking, fetchUserById } from './fetchData.js';
import {
  renderCheckoutCourses,
  showMessage,
  updateLoggedInUserDisplay,
} from './dom.js';

document.addEventListener('DOMContentLoaded', async () => {
  const selectedCoursesContainer = document.getElementById(
    'selectedCoursesContainer'
  );
  const confirmBookingButton = document.getElementById('confirmBooking');
  const logoutButton = document.getElementById('logoutButton');
  const sidebarToggle = document.getElementById('sidebarToggle'); // ✅ Fix Sidebar Toggle
  const userId = getLocalStorageItem('userId', null);

  // ✅ Fix: Display logged-in user
  if (userId) {
    try {
      const user = await fetchUserById(userId);
      if (user) updateUserDisplay(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  // ✅ Fix: Ensure Logout Button Works
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      logoutUser();
      window.location.href = 'index.html'; // Redirect to home after logout
    });
  }

  // ✅ Fix: Sidebar Toggle Issue (Without `app.js`)
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.toggle('sb-sidenav-toggled');
      localStorage.setItem(
        'sb|sidebar-toggle',
        document.body.classList.contains('sb-sidenav-toggled')
      );
    });

    // ✅ Ensure Sidebar State Persists
    if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
      document.body.classList.add('sb-sidenav-toggled');
    }
  }

  // ✅ Fetch & Display Selected Courses
  let selectedCourses = getStoredCourses();

  if (selectedCourses.length === 0) {
    showMessage(
      selectedCoursesContainer,
      'No courses selected.',
      'text-danger'
    );
    confirmBookingButton.style.display = 'none';
    return;
  }

  try {
    const courses = await fetchCourses();
    if (!courses) throw new Error('Failed to fetch courses.');

    let bookedCourses = selectedCourses
      .map((selected) => {
        const fullCourseDetails = courses.find(
          (course) => course.id.toString() === selected.id.toString()
        );
        if (!fullCourseDetails) return null;
        return {
          ...fullCourseDetails,
          availability: selected.availability,
          startDate: selected.startDate,
        };
      })
      .filter(Boolean);

    function renderCourses() {
      renderCheckoutCourses(
        bookedCourses,
        selectedCoursesContainer,
        (courseId) => {
          bookedCourses = bookedCourses.filter(
            (course) => course.id !== courseId
          );
          selectedCourses = selectedCourses.filter((c) => c.id !== courseId);
          removeStoredCourse(courseId);
          renderCourses();
        }
      );
    }

    renderCourses();

    confirmBookingButton.addEventListener('click', async () => {
      if (!userId) {
        alert('You must be logged in to book courses.');
        localStorage.setItem('redirectAfterLogin', 'checkout.html');
        window.location.href = 'login.html';
        return;
      }

      const booking = {
        userId,
        courses: selectedCourses.map((course) => ({
          id: course.id,
          availability: course.availability,
          startDate: course.startDate,
        })),
        date: new Date().toISOString(),
      };

      const success = await postBooking(booking);
      if (success) {
        clearStoredCourses();
        window.location.href = 'confirmation.html';
      } else {
        alert('Failed to book courses.');
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    showMessage(
      selectedCoursesContainer,
      'Failed to load selected courses.',
      'text-danger'
    );
  }
});

document.addEventListener('DOMContentLoaded', () => {
  updateLoggedInUserDisplay();
});
