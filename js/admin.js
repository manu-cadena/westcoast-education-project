import { DataTable } from 'https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/+esm';

const API_URL = 'http://localhost:3000';
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?w=900&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1583484963886-cfe2bff2945f?q=80&w=2940&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=3132&auto=format&fit=crop',
];

document.addEventListener('DOMContentLoaded', () => {
  loadCourses();
  loadBookings();

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

      await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });

      document.getElementById('courseForm').reset();
      loadCourses();
    });

  document
    .getElementById('saveEditBtn')
    .addEventListener('click', saveEditedCourse);
});

// Fetch and display courses
async function loadCourses() {
  const response = await fetch(`${API_URL}/courses`);
  const courses = await response.json();

  const coursesTable = document.querySelector('#datatablesSimple tbody');
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
}

// Delete a course
async function deleteCourse(courseId) {
  if (confirm('Are you sure you want to delete this course?')) {
    await fetch(`${API_URL}/courses/${courseId}`, { method: 'DELETE' });
    loadCourses();
  }
}

// Edit a course
async function editCourse(courseId) {
  const response = await fetch(`${API_URL}/courses/${courseId}`);
  const course = await response.json();

  document.getElementById('editTitle').value = course.title;
  document.getElementById('editCourseNumber').value = course.courseNumber;
  document.getElementById('editDays').value = course.duration.replace(
    ' weeks',
    ''
  );
  document.getElementById('editCost').value = course.cost.replace(' kr', '');
  document.getElementById('editAvailability').value = course.availability;
  document.getElementById('editDescription').value = course.description;

  document.getElementById('saveEditBtn').setAttribute('data-id', course.id);
  new bootstrap.Modal(document.getElementById('editCourseModal')).show();
}

// Save edited course
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

  await fetch(`${API_URL}/courses/${courseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedCourse),
  });

  new bootstrap.Modal(document.getElementById('editCourseModal')).hide();
  loadCourses();
}

// Fetch and display bookings
async function loadBookings() {
  const response = await fetch(`${API_URL}/bookings`);
  const bookings = await response.json();

  const bookingsTable = document.querySelector('#bookingsTable tbody');
  bookingsTable.innerHTML = '';

  bookings.forEach((booking) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${booking.customerName}</td>
            <td>${booking.courseTitle}</td>
            <td>${booking.email}</td>
            <td>${booking.phone}</td>
        `;
    bookingsTable.appendChild(row);
  });
}

// Setup event listeners for edit and delete buttons
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
}

// Apply DataTable for responsive table
function setupDataTable() {
  const tableElement = document.getElementById('datatablesSimple');
  if (!tableElement.classList.contains('dataTable-loaded')) {
    new DataTable(tableElement);
    tableElement.classList.add('dataTable-loaded');
  }
}

// Generate a default date for the course (1 week from today)
function getDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}
