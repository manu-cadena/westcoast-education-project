document.addEventListener('DOMContentLoaded', async () => {
  const selectedCourses =
    JSON.parse(localStorage.getItem('selectedCourses')) || [];
  const userId = localStorage.getItem('userId');
  const selectedCoursesContainer = document.getElementById(
    'selectedCoursesContainer'
  );
  const confirmBookingButton = document.getElementById('confirmBooking');

  if (selectedCourses.length === 0) {
    selectedCoursesContainer.innerHTML =
      "<p class='text-danger'>No courses selected.</p>";
    confirmBookingButton.style.display = 'none'; // Hide button if no courses
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/courses');
    const courses = await response.json();

    // Filter only the selected courses
    const bookedCourses = courses.filter((course) =>
      selectedCourses.includes(course.id.toString())
    );

    // Display course cards (same style as details.html)
    selectedCoursesContainer.innerHTML = bookedCourses
      .map(
        (course) => `
            <div class="col-md-6">
                <div class="card mb-4 shadow-sm">
                    <img src="${course.image}" class="card-img-top" alt="${course.title}">
                    <div class="card-body">
                        <h5 class="card-title">${course.title}</h5>
                        <p class="card-text">${course.description}</p>
                        <p><strong>Duration:</strong> ${course.duration}</p>
                        <p><strong>Availability:</strong> ${course.availability}</p>
                    </div>
                </div>
            </div>
        `
      )
      .join('');

    // Handle Confirm Booking
    confirmBookingButton.addEventListener('click', async () => {
      if (!userId) {
        alert('You must be logged in to book courses.');
        localStorage.setItem('redirectAfterLogin', 'checkout.html');
        window.location.href = 'login.html';
        return;
      }

      const booking = {
        userId,
        courses: bookedCourses.map((course) => course.id),
        date: new Date().toISOString(),
      };

      const bookingResponse = await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });

      if (bookingResponse.ok) {
        alert('Booking confirmed!');
        localStorage.removeItem('selectedCourses'); // Clear selected courses
        window.location.href = 'confirmation.html';
      } else {
        alert('Failed to book courses.');
      }
    });
  } catch (error) {
    console.error('Error loading courses:', error);
    selectedCoursesContainer.innerHTML =
      "<p class='text-danger'>Failed to load selected courses.</p>";
  }
});
