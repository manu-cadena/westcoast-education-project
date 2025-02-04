document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.querySelector('#bookings-table tbody');
  const userId = localStorage.getItem('userId');

  if (!userId) {
    alert('Please log in first!');
    return;
  }

  const response = await fetch(
    `http://localhost:3000/bookings?userId=${userId}`
  );
  const bookings = await response.json();

  for (const booking of bookings) {
    const courseResponse = await fetch(
      `http://localhost:3000/courses/${booking.courseId}`
    );
    const course = await courseResponse.json();

    const row = document.createElement('tr');
    row.innerHTML = `<td>${course.name}</td><td>${course.price}</td>`;
    tableBody.appendChild(row);
  }
});
