// 📂 js/detail.js
import { fetchCourseById, fetchBookings } from './fetchData.js';
import { getLocalStorageItem, setLocalStorageItem } from './localStorage.js';
import {
  updateCourseDetails,
  updateBookingOptions,
  displayMessage,
  updateLoggedInUserDisplay,
  setupLogoutButton,
} from './dom.js';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('id');

  if (!courseId) {
    document.querySelector('.card-body').innerHTML =
      '<p class="text-danger">No course ID found in the URL.</p>';
    return;
  }

  try {
    // ✅ Fetch course details
    const course = await fetchCourseById(courseId);
    updateCourseDetails(course);
    updateBookingOptions(course.availability);

    const bookNowButton = document.getElementById('bookNowButton');
    const userId = localStorage.getItem('userId');
    let selectedCourses = getLocalStorageItem('selectedCourses');

    // ✅ Check if the course is already in the cart
    const isAlreadyInCart = selectedCourses.some(
      (item) => item.id.toString() === courseId.toString()
    );

    if (isAlreadyInCart) {
      displayMessage('This course is already selected for checkout.');
      bookNowButton.disabled = true;
    }

    if (userId) {
      // ✅ Check if the course is already booked
      const bookings = await fetchBookings();
      const userBookings = bookings.filter(
        (booking) => booking.userId.toString() === userId
      );

      // Flatten the booked course list
      const bookedCourseIds = userBookings.flatMap((b) =>
        b.courses.map((c) => c.id.toString())
      );

      if (bookedCourseIds.includes(courseId.toString())) {
        displayMessage('You have already booked this course.');
        bookNowButton.disabled = true;
      }
    }

    // ✅ Handle "Book Now" button click
    bookNowButton.addEventListener('click', () => {
      if (!userId) {
        alert('You must be logged in to book a course.');
        setLocalStorageItem(
          'redirectAfterLogin',
          `details.html?id=${courseId}`
        );
        window.location.href = 'login.html';
        return;
      }

      if (!isAlreadyInCart) {
        selectedCourses.push({
          id: courseId.toString(),
          title: course.title,
          availability: document.getElementById('bookingType').value,
          startDate: course.dates,
        });

        setLocalStorageItem('selectedCourses', selectedCourses);
        window.location.href = 'checkout.html';
      } else {
        displayMessage('This course is already selected for checkout.');
      }
    });
  } catch (error) {
    console.error('Error:', error);
    document.querySelector('.card-body').innerHTML =
      '<p class="text-danger">Failed to load course details.</p>';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  updateLoggedInUserDisplay();
});

document.addEventListener('DOMContentLoaded', () => {
  updateLoggedInUserDisplay();
  setupLogoutButton();
});
