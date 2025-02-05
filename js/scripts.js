/*!
 * Start Bootstrap - SB Admin v7.0.7 (https://startbootstrap.com/template/sb-admin)
 * Copyright 2013-2023 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
 */
//
// Scripts
//

// Fetch courses from the mock API
fetch('http://localhost:3000/courses')
  .then((response) => response.json())
  .then((courses) => {
    const courseList = document.getElementById('course-list');

    // Define the color order
    const colors = ['bg-primary', 'bg-warning', 'bg-success', 'bg-danger'];
    let colorIndex = 0;

    // Loop through each course and create a card
    courses.forEach((course) => {
      // Get the current color
      const currentColor = colors[colorIndex % colors.length]; // Cycle through colors
      colorIndex++; // Move to the next color

      // Create the course card HTML
      const courseCard = `
      <div class="col-xl-3 col-md-6">
        <div class="card ${currentColor} text-white mb-4">
          <div class="card-body">
            <h5>${course.title}</h5>
            <p>Duration: ${course.duration}</p>
            <p>Availability: ${course.availability}</p>
          </div>
          <div class="card-footer d-flex align-items-center justify-content-between">
            <a class="small text-white stretched-link" href="details.html?id=${course.id}">View Details</a>
            <div class="small text-white"><i class="fas fa-angle-right"></i></div>
          </div>
        </div>
      </div>`;

      // Append the course card to the course list
      courseList.innerHTML += courseCard;
    });
  })
  .catch((error) => {
    console.error('Error fetching courses:', error);
  });

// Display logged-in user in sidebar footer
document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem('userId');
  const userDisplay = document.getElementById('loggedInUser');

  // Check if username is stored in localStorage (from registration)
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
    userDisplay.textContent = user.name ? user.name : user.email;
  } catch (error) {
    console.error('Error fetching user:', error);
    userDisplay.textContent = 'Unknown User';
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
        event.preventDefault(); // Stop navigation
        alert('You must be logged in to access checkout.');
        localStorage.setItem('redirectAfterLogin', 'checkout.html'); // Store intended page
        window.location.href = 'login.html'; // Redirect to login
      }
    });
  }
});

// Toggle the side navigation
window.addEventListener('DOMContentLoaded', (event) => {
  const sidebarToggle = document.body.querySelector('#sidebarToggle');
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
