import { fetchCourses, fetchUserById } from './fetchData.js';
import { displayCourses, updateLoggedInUserDisplay } from './dom.js';
import { handleLogout, preventUnauthorizedCheckout } from './auth.js';
import { logoutUser } from './localStorage.js';

// ✅ Load Courses & Enable Search
async function loadCourses() {
  try {
    const courses = await fetchCourses();
    const searchInput = document.querySelector('.form-control');

    if (!searchInput) {
      console.error('Search input not found!');
      return;
    }

    function renderCourses(filter = '') {
      const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(filter.toLowerCase())
      );
      displayCourses(filteredCourses, 'course-list');
    }

    renderCourses(); // Initial render

    searchInput.addEventListener('input', (event) => {
      renderCourses(event.target.value);
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
}

// ✅ Display Logged-in User
async function loadUser() {
  const userId = localStorage.getItem('userId');
  if (!userId) return;

  try {
    const user = await fetchUserById(userId);
    updateUserDisplay(user);
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateLoggedInUserDisplay();
});

// ✅ Handle Logout Button
document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.querySelector(".dropdown-item[href='#']");
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      handleLogout();
    });
  }
});

// ✅ Toggle Sidebar
document.addEventListener('DOMContentLoaded', () => {
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

// ✅ Run All Features on Page Load
document.addEventListener('DOMContentLoaded', async () => {
  await loadCourses();
  await loadUser();
  preventUnauthorizedCheckout();
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.querySelector('.logout-btn');

  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      logoutUser();
    });
  }
});
