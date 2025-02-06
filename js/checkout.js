document.addEventListener('DOMContentLoaded', async () => {
  console.log(
    'DOM fully loaded! Checking container:',
    document.getElementById('selectedCoursesContainer')
  );

  const selectedCoursesContainer = document.getElementById(
    'selectedCoursesContainer'
  );
  if (!selectedCoursesContainer) {
    console.error("Error: 'selectedCoursesContainer' not found in HTML.");
    return;
  }

  let selectedCourses =
    JSON.parse(localStorage.getItem('selectedCourses')) || [];

  console.log('Stored Courses in Local Storage:', selectedCourses);

  if (selectedCourses.length === 0) {
    selectedCoursesContainer.innerHTML =
      "<p class='text-danger'>No courses selected.</p>";
    document.getElementById('confirmBooking').style.display = 'none';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/courses');
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const courses = await response.json();
    console.log('Fetched Courses from API:', courses);

    let bookedCourses = courses.filter((course) =>
      selectedCourses.some((selected) => selected.id === course.id)
    );

    console.log('Matched Courses:', bookedCourses);

    function renderCourses() {
      selectedCoursesContainer.innerHTML = bookedCourses
        .map((course) => {
          const selectedData = selectedCourses.find((c) => c.id === course.id);

          return `
          <div class="col-md-6 col-lg-4 d-flex">
              <div class="card mb-4 shadow-sm w-100">
                  <img src="${course.image}" class="card-img-top" alt="${course.title}">
                  <div class="card-body d-flex flex-column">
                      <h5 class="card-title">${course.title}</h5>
                      <p class="card-text flex-grow-1">${course.description}</p>
                      <p><strong>Duration:</strong> ${course.duration}</p>
                      <p><strong>Availability:</strong> ${selectedData.availability}</p> <!-- ✅ FIXED -->
                      <p><strong>Start Date:</strong> ${selectedData.startDate}</p>
                      <button class="btn btn-danger btn-sm remove-course-btn mt-2" data-id="${course.id}">
                        <i class="fas fa-trash"></i> Remove
                      </button>
                  </div>
              </div>
          </div>
        `;
        })
        .join('');

      document.querySelectorAll('.remove-course-btn').forEach((button) => {
        button.addEventListener('click', (e) => {
          const courseId = e.target.closest('button').dataset.id;
          bookedCourses = bookedCourses.filter(
            (course) => course.id !== courseId
          );
          selectedCourses = selectedCourses.filter((c) => c.id !== courseId);
          localStorage.setItem(
            'selectedCourses',
            JSON.stringify(selectedCourses)
          );
          renderCourses();
        });
      });
    }

    renderCourses();

    document
      .getElementById('confirmBooking')
      .addEventListener('click', async () => {
        const userId = localStorage.getItem('userId');
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

        const bookingResponse = await fetch('http://localhost:3000/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking),
        });

        if (bookingResponse.ok) {
          alert('Booking confirmed!');
          localStorage.removeItem('selectedCourses');
          window.location.href = 'confirmation.html';
        } else {
          alert('Failed to book courses.');
        }
      });
  } catch (error) {
    console.error('Error fetching courses:', error);
    selectedCoursesContainer.innerHTML =
      "<p class='text-danger'>Failed to load selected courses.</p>";
  }
});
