document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem('userId');
  const loggedInUser = document.getElementById('loggedInUser');
  const bookedCoursesContainer = document.getElementById(
    'bookedCoursesContainer'
  );
  const logoutButton = document.getElementById('logoutButton');

  // Update logged-in username in sidebar
  const userName = localStorage.getItem('userName') || 'Guest';
  loggedInUser.textContent = userName;

  // Redirect to login if not logged in
  if (!userId) {
    alert('You must be logged in to view your profile.');
    window.location.href = 'login.html';
    return;
  }

  try {
    // Fetch user's bookings
    const bookingsResponse = await fetch('http://localhost:3000/bookings');
    const bookings = await bookingsResponse.json();

    // Find bookings for the logged-in user
    const userBookings = bookings.find(
      (booking) => booking.userId.toString() === userId
    );

    if (!userBookings || userBookings.courses.length === 0) {
      bookedCoursesContainer.innerHTML =
        "<p class='text-danger'>You have no booked courses.</p>";
      return;
    }

    // Fetch all courses to match the booked ones
    const coursesResponse = await fetch('http://localhost:3000/courses');
    const courses = await coursesResponse.json();

    // Filter only the booked courses
    const bookedCourses = courses.filter((course) =>
      userBookings.courses.includes(course.id)
    );

    // Display course cards (same style as details.html)
    bookedCoursesContainer.innerHTML = bookedCourses
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
  } catch (error) {
    console.error('Error loading booked courses:', error);
    bookedCoursesContainer.innerHTML =
      "<p class='text-danger'>Failed to load booked courses.</p>";
  }

  // Handle Logout
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');

    alert('You have been logged out.');
    window.location.href = 'index.html'; // Redirect to homepage
  });
});
