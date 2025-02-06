// 📂 js/dom.js

/**
 * Displays courses in a given container.
 * @param {Array} courses - List of course objects.
 * @param {string} containerId - The ID of the container where courses will be rendered.
 */
export function displayCourses(courses, containerId) {
  const courseList = document.getElementById(containerId);
  if (!courseList) return;

  courseList.innerHTML = ''; // Clear previous content

  if (courses.length === 0) {
    courseList.innerHTML =
      "<p class='text-danger'>No matching courses found.</p>";
    return;
  }

  courses.forEach((course) => {
    const courseCard = `
      <div class="col-md-6 col-lg-4 d-flex">
        <div class="card shadow-sm w-100">
          <img src="${course.image}" class="card-img-top" alt="${course.title}" style="height: 200px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${course.title}</h5>
            <p class="card-text flex-grow-1">Duration: ${course.duration}</p>
            <p><strong>Availability:</strong> ${course.availability}</p>
            <a href="details.html?id=${course.id}" class="btn btn-primary mt-auto">View Details</a>
          </div>
        </div>
      </div>`;
    courseList.innerHTML += courseCard;
  });
}

/**
 * Updates the user display in the sidebar and navbar.
 * @param {Object} user - The user object containing name information.
 */
export function updateLoggedInUserDisplay() {
  const userDisplay = document.getElementById('loggedInUser');
  if (!userDisplay) return;

  const storedUserName = localStorage.getItem('userName');
  userDisplay.textContent = storedUserName ? storedUserName : 'Guest';
}

//  Handles user logout by clearing localStorage and redirecting to index.html
 
export function setupLogoutButton() {
  const logoutButton = document.getElementById('logoutButton');
  if (!logoutButton) return;

  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('selectedCourses'); // Optional
    window.location.href = 'index.html';
  });
}

/**
 * Updates the course details page with the selected course.
 * @param {Object} course - The course object with details.
 */
export function updateCourseDetails(course) {
  document.getElementById('course-title').textContent = course.title;
  document.getElementById('course-description').textContent =
    course.description;
  document.getElementById('course-image').src = course.image;
  document.getElementById('course-duration').textContent = course.duration;
  document.getElementById('course-availability').textContent =
    course.availability;
  document.getElementById('course-start-date').textContent = course.dates;
}

/**
 * Populates the booking options based on course availability.
 * @param {string} courseAvailability - Availability string from the course.
 */
export function updateBookingOptions(courseAvailability) {
  const bookingSelect = document.getElementById('bookingType');
  bookingSelect.innerHTML = '';

  if (courseAvailability.includes('Classroom')) {
    bookingSelect.innerHTML += `<option value="Classroom">Classroom</option>`;
  }
  if (courseAvailability.includes('Distance')) {
    bookingSelect.innerHTML += `<option value="Distance">Distance</option>`;
  }

  if (!bookingSelect.innerHTML.trim()) {
    bookingSelect.innerHTML =
      '<option disabled>No booking options available</option>';
    document.getElementById('bookNowButton').disabled = true;
  }
}

/**
 * Displays a message in the course details page.
 * @param {string} message - The message to display.
 * @param {string} [color='red'] - The color of the message (default: red).
 */
export function displayMessage(message, color = 'red') {
  const errorMessage = document.getElementById('alreadyBookedMessage');
  if (!errorMessage) return;
  errorMessage.textContent = message;
  errorMessage.style.color = color;
}

/**
 * Disables a button.
 * @param {string} buttonId - The ID of the button to disable.
 */
export function disableButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) button.disabled = true;
}

/**
 /**
 * Renders the selected courses for checkout.
 * @param {Array} bookedCourses - List of booked course objects.
 * @param {HTMLElement} container - The container where courses are displayed.
 * @param {Function} onRemove - Callback function when removing a course.
 */
export function renderCheckoutCourses(bookedCourses, container, onRemove) {
  if (!container) return;

  container.innerHTML = '';

  if (bookedCourses.length === 0) {
    container.innerHTML = "<p class='text-danger'>No courses selected.</p>";
    document.getElementById('confirmBooking').style.display = 'none';
    return;
  }

  container.innerHTML = bookedCourses
    .map(
      (course) => `
      <div class="col-md-6 col-lg-4 d-flex">
          <div class="card mb-4 shadow-sm w-100">
              <img src="${course.image}" class="card-img-top" alt="${
        course.title
      }">
              <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${course.title}</h5>
                  <p class="card-text flex-grow-1">${course.description}</p>
                  <p><strong>Duration:</strong> ${course.duration}</p>
                  <p><strong>Availability:</strong> ${
                    course.availability || 'Not Selected'
                  }</p>  <!-- ✅ Ensure availability is shown -->
                  <p><strong>Start Date:</strong> ${
                    course.startDate || 'Not Selected'
                  }</p>  <!-- ✅ Ensure start date is shown -->
                  <button class="btn btn-danger btn-sm remove-course-btn mt-2" data-id="${
                    course.id
                  }">
                    <i class="fas fa-trash"></i> Remove
                  </button>
              </div>
          </div>
      </div>
    `
    )
    .join('');

  document.querySelectorAll('.remove-course-btn').forEach((button) => {
    button.addEventListener('click', (e) => {
      const courseId = e.target.closest('button').dataset.id;
      onRemove(courseId);
    });
  });
}

/**
 * Displays a message inside a given container.
 * @param {HTMLElement} container - The container to display the message in.
 * @param {string} message - The message to display.
 * @param {string} [className='text-danger'] - CSS class for styling.
 */
export function showMessage(container, message, className = 'text-danger') {
  if (!container) return;
  container.innerHTML = `<p class='${className}'>${message}</p>`;
}
