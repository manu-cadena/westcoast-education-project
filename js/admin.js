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

async function loadBookings() {
  const bookingsTable = document.querySelector('#bookingsTable tbody');

  if (!bookingsTable) {
    console.warn('Bookings table not found. Skipping loadBookings.');
    return;
  }

  try {
    const [bookingsResponse, usersResponse, coursesResponse] =
      await Promise.all([
        fetch(`${API_URL}/bookings`),
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/courses`),
      ]);

    const bookings = await bookingsResponse.json();
    const users = await usersResponse.json();
    const courses = await coursesResponse.json();

    bookingsTable.innerHTML = '';

    const courseBookingsMap = new Map();

    bookings.forEach((booking) => {
      const customer = users.find(
        (user) => user.id.toString() === booking.userId
      );
      const customerName = customer ? customer.name : 'Unknown Customer';

      booking.courses.forEach((courseObj) => {
        const courseId = courseObj.id.toString(); // Extract course ID
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

async function deleteCourse(courseId) {
  if (confirm('Are you sure you want to delete this course?')) {
    await fetch(`${API_URL}/courses/${courseId}`, { method: 'DELETE' });
    loadCourses();
  }
}

async function editCourse(courseId) {
  const response = await fetch(`${API_URL}/courses/${courseId}`);
  const course = await response.json();

  document.getElementById('editTitle').value = course.title || '';
  document.getElementById('editCourseNumber').value = course.courseNumber || '';
  document.getElementById('editDays').value = course.duration
    ? course.duration.replace(' weeks', '')
    : '';
  document.getElementById('editCost').value = course.cost
    ? course.cost.replace(' kr', '')
    : '';
  document.getElementById('editAvailability').value = course.availability || '';
  document.getElementById('editDescription').value = course.description || '';

  document.getElementById('saveEditBtn').setAttribute('data-id', course.id);
  new bootstrap.Modal(document.getElementById('editCourseModal')).show();
}

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

  const editModal = bootstrap.Modal.getInstance(
    document.getElementById('editCourseModal')
  );
  if (editModal) editModal.hide();

  loadCourses();
}

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

function setupDataTable() {
  const tableElement = document.getElementById('datatablesSimple');
  if (!tableElement.classList.contains('dataTable-loaded')) {
    new DataTable(tableElement);
    tableElement.classList.add('dataTable-loaded');
  }
}

function getDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}
