document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#checkout-table tbody');
  const confirmButton = document.getElementById('confirm-booking');

  // Load selected courses from localStorage
  const selectedCourses =
    JSON.parse(localStorage.getItem('selectedCourses')) || [];

  selectedCourses.forEach((course) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${course.name}</td><td>${course.price}</td>`;
    tableBody.appendChild(row);
  });

  confirmButton.addEventListener('click', async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in first!');
      return;
    }

    for (const course of selectedCourses) {
      await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId: course.id }),
      });
    }

    alert('Booking confirmed!');
    localStorage.removeItem('selectedCourses');
    window.location.href = 'profile.html';
  });
});
