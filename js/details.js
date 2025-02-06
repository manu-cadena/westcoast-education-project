// Get the course ID from the URL
const params = new URLSearchParams(window.location.search);
const courseId = params.get('id');

if (courseId) {
  fetch(`http://localhost:3000/courses/${courseId}`)
    .then((response) => response.json())
    .then((course) => {
      document.getElementById('course-title').textContent = course.title;
      document.getElementById('course-description').textContent =
        course.description;
      document.getElementById('course-image').src = course.image;
      document.getElementById('course-duration').textContent = course.duration;
      document.getElementById('course-availability').textContent =
        course.availability;
      document.getElementById('course-start-date').textContent = course.dates;

      const bookingSelect = document.getElementById('bookingType');
      const errorMessage = document.getElementById('alreadyBookedMessage');
      const bookNowButton = document.getElementById('bookNowButton');

      errorMessage.textContent = ''; // Clear previous messages
      bookingSelect.innerHTML = ''; // Clear existing options

      // Populate booking options based on course availability
      if (course.availability.includes('Classroom')) {
        bookingSelect.innerHTML += `<option value="Classroom">Classroom</option>`;
      }
      if (course.availability.includes('Distance')) {
        bookingSelect.innerHTML += `<option value="Distance">Distance</option>`;
      }

      if (!bookingSelect.innerHTML.trim()) {
        bookingSelect.innerHTML =
          '<option disabled>No booking options available</option>';
        bookNowButton.disabled = true;
      }

      const userId = localStorage.getItem('userId');
      let selectedCourses =
        JSON.parse(localStorage.getItem('selectedCourses')) || [];

      // ✅ Check if the course is already in the cart
      const isAlreadyInCart = selectedCourses.some(
        (item) => item.id.toString() === courseId.toString()
      );

      if (isAlreadyInCart) {
        errorMessage.textContent =
          'This course is already selected for checkout.';
        errorMessage.style.color = 'red';
      }

      if (userId) {
        // ✅ Check if the course is already booked
        fetch('http://localhost:3000/bookings')
          .then((response) => response.json())
          .then((bookings) => {
            const userBookings = bookings.filter(
              (booking) => booking.userId.toString() === userId
            );

            // Flatten the list of booked courses
            const bookedCourseIds = userBookings.flatMap((b) =>
              b.courses.map((c) => c.id.toString())
            );

            if (bookedCourseIds.includes(courseId.toString())) {
              errorMessage.textContent = 'You have already booked this course.';
              errorMessage.style.color = 'red';
              bookNowButton.disabled = true; // Disable booking button
            }
          })
          .catch((error) => console.error('Error checking bookings:', error));
      }

      // ✅ Handle "Book Now" button click
      bookNowButton.addEventListener('click', () => {
        if (!userId) {
          alert('You must be logged in to book a course.');
          localStorage.setItem(
            'redirectAfterLogin',
            `details.html?id=${courseId}`
          );
          window.location.href = 'login.html';
        } else {
          // Ensure the course isn't already selected
          if (!isAlreadyInCart) {
            selectedCourses.push({
              id: courseId.toString(),
              title: course.title,
              availability: bookingSelect.value, // ✅ Store only the selected option!
              startDate: course.dates,
            });

            localStorage.setItem(
              'selectedCourses',
              JSON.stringify(selectedCourses)
            );

            window.location.href = 'checkout.html';
          } else {
            errorMessage.textContent =
              'This course is already selected for checkout.';
            errorMessage.style.color = 'red';
          }
        }
      });
    })
    .catch((error) => {
      console.error('Error:', error);
      document.querySelector('.card-body').innerHTML =
        '<p class="text-danger">Failed to load course details.</p>';
    });
} else {
  document.querySelector('.card-body').innerHTML =
    '<p class="text-danger">No course ID found in the URL.</p>';
}
