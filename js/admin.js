import { DataTable } from 'https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/+esm';
import {
  fetchCourses,
  fetchBookings,
  fetchUsers,
  fetchCourseById,
} from './fetchData.js';

const API_URL = 'http://localhost:3000';
const DEFAULT_IMAGES = [
  'assets/img/Introduction to Web Development.avif',
  'assets/img/Advanced JavaScript.avif',
  'assets/img/Blockchain Fundamentals.avif',
];

document.addEventListener('DOMContentLoaded', async () => {
  await loadCourses();
  await loadBookings();
  setupCourseForm();
});

/**
 * Fetch and display courses in the admin table.
 */
async function loadCourses() {
  try {
    const courses = await fetchCourses();
    const coursesTable = document.querySelector('#datatablesSimple tbody');
    if (!coursesTable) return;
    coursesTable.innerHTML = '';

    courses.forEach((course) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><img src="${course.image}" alt="Course Image" width="60"></td>
        <td>${course.title}</td>
        <td>${course.courseNumber}</td>
        <td>${course.duration}</td>
        <td>${course.availability}</td>
        <td>${course.dates}</td>
        <td>${course.cost}</td>
        <td>${course.description}</td>
        <td>
          <button class="btn btn-warning btn-sm edit-btn" data-id="${course.id}"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${course.id}"><i class="fas fa-trash"></i></button>
        </td>
      `;
      coursesTable.appendChild(row);
    });

    setupEventListeners();
    setupDataTable();
  } catch (error) {
    console.error('Error loading courses:', error);
  }
}

/**
 * Fetch and display bookings grouped by course.
 */
async function loadBookings() {
  const bookingsTable = document.querySelector('#bookingsTable tbody');
  if (!bookingsTable) return;

  try {
    const [bookings, users, courses] = await Promise.all([
      fetchBookings(),
      fetchUsers(),
      fetchCourses(),
    ]);

    bookingsTable.innerHTML = '';
    const courseBookingsMap = new Map();

    bookings.forEach((booking) => {
      const customer = users.find(
        (user) => user.id.toString() === booking.userId.toString()
      );
      const customerName = customer ? customer.name : 'Unknown Customer';

      booking.courses.forEach((courseObj) => {
        const courseId = courseObj.id.toString();
        const course = courses.find((c) => c.id.toString() === courseId);
        const courseTitle = course ? course.title : 'Unknown Course';

        if (!courseBookingsMap.has(courseTitle)) {
          courseBookingsMap.set(courseTitle, new Set()); // Use Set to avoid duplicate names
        }
        courseBookingsMap.get(courseTitle).add(customerName);
      });
    });

    if (courseBookingsMap.size === 0) {
      bookingsTable.innerHTML = `<tr><td colspan="2" class="text-danger">No courses have been booked yet.</td></tr>`;
      return;
    }

    courseBookingsMap.forEach((customers, courseTitle) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${courseTitle}</td>
        <td>${Array.from(customers).join(', ')}</td>
      `;
      bookingsTable.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading bookings:', error);
    bookingsTable.innerHTML = `<tr><td colspan="2" class="text-danger">Failed to load course bookings.</td></tr>`;
  }
}

/**
 * Handles adding a new course.
 */
function setupCourseForm() {
  document
    .getElementById('courseForm')
    .addEventListener('submit', async (event) => {
      event.preventDefault();

      const newCourse = {
        id: Date.now().toString(),
        title: document.getElementById('title').value,
        courseNumber: document.getElementById('courseNumber').value,
        duration: document.getElementById('days').value + ' weeks',
        cost: document.getElementById('cost').value + ' kr',
        availability: document.getElementById('availability').value,
        image:
          DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)],
        dates: getDefaultDate(),
        popular: false,
        description:
          document.getElementById('description').value ||
          'No description available.',
      };

      try {
        await fetch(`${API_URL}/courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCourse),
        });

        document.getElementById('courseForm').reset();
        await loadCourses();
      } catch (error) {
        console.error('Error adding course:', error);
      }
    });
}

/**
 * Handles course deletion and updates the booking table.
 */
async function deleteCourse(courseId) {
  if (confirm('Are you sure you want to delete this course?')) {
    try {
      // Delete the course
      await fetch(`${API_URL}/courses/${courseId}`, { method: 'DELETE' });

      // Remove course from bookings
      const bookings = await fetchBookings();
      const updatedBookings = bookings
        .map((booking) => ({
          ...booking,
          courses: booking.courses.filter(
            (course) => course.id.toString() !== courseId.toString()
          ),
        }))
        .filter((booking) => booking.courses.length > 0); // Remove empty bookings

      // Update the bookings data
      for (const booking of bookings) {
        if (!updatedBookings.find((b) => b.userId === booking.userId)) {
          await fetch(`${API_URL}/bookings/${booking.id}`, {
            method: 'DELETE',
          });
        } else {
          await fetch(`${API_URL}/bookings/${booking.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking),
          });
        }
      }

      // Refresh both tables
      await loadCourses();
      await loadBookings();
    } catch (error) {
      console.error('Error deleting course and updating bookings:', error);
    }
  }
}

/**
 * Handles course editing.
 */
async function editCourse(courseId) {
  const course = await fetchCourseById(courseId);

  document.getElementById('editTitle').value = course.title || '';
  document.getElementById('editCourseNumber').value = course.courseNumber || '';
  document.getElementById('editDays').value =
    course.duration.replace(' weeks', '') || '';
  document.getElementById('editCost').value =
    course.cost.replace(' kr', '') || '';
  document.getElementById('editAvailability').value = course.availability || '';
  document.getElementById('editDescription').value = course.description || '';

  document.getElementById('saveEditBtn').setAttribute('data-id', course.id);
  new bootstrap.Modal(document.getElementById('editCourseModal')).show();
}

/**
 * Saves an edited course.
 */
async function saveEditedCourse() {
  const courseId = document
    .getElementById('saveEditBtn')
    .getAttribute('data-id');

  const updatedCourse = {
    title: document.getElementById('editTitle').value,
    courseNumber: document.getElementById('editCourseNumber').value,
    duration: document.getElementById('editDays').value + ' weeks',
    cost: document.getElementById('editCost').value + ' kr',
    availability: document.getElementById('editAvailability').value,
    description: document.getElementById('editDescription').value,
  };

  try {
    await fetch(`${API_URL}/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCourse),
    });

    const editModal = bootstrap.Modal.getInstance(
      document.getElementById('editCourseModal')
    );
    if (editModal) editModal.hide();

    await loadCourses();
  } catch (error) {
    console.error('Error saving course:', error);
  }
}

/**
 * Set up event listeners for edit and delete buttons.
 */
function setupEventListeners() {
  document
    .querySelectorAll('.delete-btn')
    .forEach((btn) =>
      btn.addEventListener('click', (e) =>
        deleteCourse(e.target.closest('button').dataset.id)
      )
    );

  document
    .querySelectorAll('.edit-btn')
    .forEach((btn) =>
      btn.addEventListener('click', (e) =>
        editCourse(e.target.closest('button').dataset.id)
      )
    );

  document
    .getElementById('saveEditBtn')
    .addEventListener('click', saveEditedCourse);
}

/**
 * Initializes the DataTable for the courses.
 */
function setupDataTable() {
  const tableElement = document.getElementById('datatablesSimple');
  if (!tableElement.classList.contains('dataTable-loaded')) {
    new DataTable(tableElement);
    tableElement.classList.add('dataTable-loaded');
  }
}

/**
 * Generates a default date (1 week from today).
 */
function getDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}
