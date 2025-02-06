/*!
 * Start Bootstrap - SB Admin v7.0.7
 */

// Fetch courses and render them
async function fetchAndRenderCourses() {
  try {
    const response = await fetch('http://localhost:3000/courses');
    if (!response.ok) throw new Error('Failed to fetch courses');

    const courses = await response.json();
    const courseList = document.getElementById('course-list');
    const searchInput = document.querySelector('.form-control');

    // Ensure search input exists
    if (!searchInput) {
      console.error('Search input not found!');
      return;
    }

    // Function to render courses based on search
    function renderCourses(filter = '') {
      courseList.innerHTML = ''; // Clear existing courses

      const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(filter.toLowerCase())
      );

      if (filteredCourses.length === 0) {
        courseList.innerHTML =
          "<p class='text-danger'>No matching courses found.</p>";
        return;
      }

      filteredCourses.forEach((course) => {
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

    renderCourses(); // Initial render

    // Attach search functionality
    searchInput.addEventListener('input', (event) => {
      const searchTerm = event.target.value;
      renderCourses(searchTerm);
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
}

document.addEventListener('DOMContentLoaded', fetchAndRenderCourses);

// Display logged-in user in sidebar footer
document.addEventListener('DOMContentLoaded', async () => {
  const userDisplay = document.getElementById('loggedInUser');
  const userId = localStorage.getItem('userId');

  // Check if username is stored in localStorage
  const storedUserName = localStorage.getItem('userName');
  if (storedUserName) {
    userDisplay.textContent = storedUserName;
    return;
  }

  if (!userId) {
    userDisplay.textContent = 'Guest';
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/users/${userId}`);
    if (!response.ok) throw new Error('User not found');

    const user = await response.json();
    userDisplay.textContent = user.name || 'Unknown User';
  } catch (error) {
    console.error('Error fetching user:', error);
    userDisplay.textContent = 'Unknown User';
  }
});

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.querySelector(".dropdown-item[href='#']");
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      alert('You have been logged out.');
      window.location.href = 'index.html'; // Redirect to home
    });
  }
});

// Prevent unauthorized access to Checkout page
document.addEventListener('DOMContentLoaded', () => {
  const checkoutLink = document.querySelector(
    ".nav-link[href='checkout.html']"
  );
  if (checkoutLink) {
    checkoutLink.addEventListener('click', (event) => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        event.preventDefault();
        alert('You must be logged in to access checkout.');
        localStorage.setItem('redirectAfterLogin', 'checkout.html');
        window.location.href = 'login.html';
      }
    });
  }
});

// Toggle the side navigation
window.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.toggle('sb-sidenav-toggled');
      localStorage.setItem(
        'sb|sidebar-toggle',
        document.body.classList.contains('sb-sidenav-toggled')
      );
    });
  }
});
