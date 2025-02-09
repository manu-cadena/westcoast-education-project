document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem('userId');
  const loggedInUser = document.getElementById('loggedInUser');
  const bookedCoursesContainer = document.getElementById(
    'bookedCoursesContainer'
  );
  const logoutButton = document.getElementById('logoutButton');

  // Update logged-in username in sidebar and profile header
  const userName = localStorage.getItem('userName') || 'Guest';
  loggedInUser.textContent = userName;
  document.querySelector(
    '.container-fluid h1'
  ).textContent = `Welcome, ${userName}`;

  // Redirect to login if not logged in
  if (!userId) {
    alert('You must be logged in to view your profile.');
    window.location.href = 'login.html';
    return;
  }

  try {
    // Fetch all bookings
    const bookingsResponse = await fetch('http://localhost:3000/bookings');
    const bookings = await bookingsResponse.json();

    // Get all bookings for the logged-in user
    const userBookings = bookings.filter(
      (booking) => booking.userId.toString() === userId
    );

    if (!userBookings.length) {
      bookedCoursesContainer.innerHTML =
        "<p class='text-danger'>You have no booked courses.</p>";
      return;
    }

    // Fetch all courses from the database
    const coursesResponse = await fetch('http://localhost:3000/courses');
    const courses = await coursesResponse.json();

    // Collect all booked courses
    const bookedCourses = [];
    userBookings.forEach((booking) => {
      booking.courses.forEach((bookedCourse) => {
        const course = courses.find(
          (c) => c.id.toString() === bookedCourse.id.toString()
        );
        if (course) {
          bookedCourses.push({
            ...course,
            availability: bookedCourse.availability, // ✅ Use booked availability
            startDate: bookedCourse.startDate, // ✅ Use booked start date
          });
        }
      });
    });

    if (!bookedCourses.length) {
      bookedCoursesContainer.innerHTML =
        "<p class='text-warning'>No matching courses found.</p>";
      return;
    }

    // Remove duplicates (if any)
    const uniqueCourses = Array.from(
      new Map(bookedCourses.map((course) => [course.id, course])).values()
    );

    // Display booked courses as cards with uniform sizes
    bookedCoursesContainer.innerHTML = uniqueCourses
      .map(
        (course) => `
        <div class="col-md-6 col-lg-4 d-flex">
            <div class="card mb-4 shadow-sm w-100">
                <img src="${course.image}" class="card-img-top" alt="${course.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${course.title}</h5>
                    <p class="card-text flex-grow-1">${course.description}</p>
                    <p><strong>Duration:</strong> ${course.duration}</p>
                    <p><strong>Availability:</strong> ${course.availability}</p> <!-- ✅ FIXED -->
                    <p><strong>Start Date:</strong> ${course.startDate}</p> <!-- ✅ FIXED -->
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
    window.location.href = 'index.html';
  });
});
