// Get the course ID from the URL
const params = new URLSearchParams(window.location.search);
const courseId = params.get('id'); // Example: ?id=1

if (courseId) {
  // Fetch course details from JSON Server
  fetch(`http://localhost:3000/courses/${courseId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch course details: ${response.status}`);
      }
      return response.json();
    })
    .then((course) => {
      // Dynamically update HTML with course data
      document.getElementById('course-title').textContent = course.title;
      document.getElementById('course-description').textContent =
        course.description;
      document.getElementById('course-image').src = course.image;
      document.getElementById('course-duration').textContent = course.duration;
      document.getElementById('course-availability').textContent =
        course.availability;

      // Handle "Book Now" button click
      document.getElementById('bookNowButton').addEventListener('click', () => {
        let selectedCourses =
          JSON.parse(localStorage.getItem('selectedCourses')) || [];

        if (!selectedCourses.includes(courseId)) {
          selectedCourses.push(courseId);
          localStorage.setItem(
            'selectedCourses',
            JSON.stringify(selectedCourses)
          );
          alert('Course added to checkout!');
        } else {
          alert('This course is already selected.');
        }

        // Check if user is logged in
        const userId = localStorage.getItem('userId');

        if (!userId) {
          alert('You must be logged in to proceed to checkout.');
          localStorage.setItem('redirectAfterLogin', 'checkout.html'); // Store intended page
          window.location.href = 'login.html'; // Redirect to login
        } else {
          window.location.href = 'checkout.html'; // Proceed to checkout if logged in
        }
      });
    })
    .catch((error) => {
      console.error('Error:', error);
      document.querySelector('.card-body').innerHTML =
        '<p class="text-danger">Failed to load course details. Please try again later.</p>';
    });
} else {
  document.querySelector('.card-body').innerHTML =
    '<p class="text-danger">No course ID found in the URL. Please select a course.</p>';
}
