document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError'); // Get error message container

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from submitting the default way

    const email = document.getElementById('inputEmail').value.trim();
    const password = document.getElementById('inputPassword').value.trim();

    if (!email || !password) {
      loginError.textContent = 'Please enter both email and password.';
      loginError.style.display = 'block'; // Show error message
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/users');
      if (!response.ok) throw new Error('Failed to fetch users.');

      const users = await response.json();

      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        // Save user details in localStorage
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name);

        // Check if the user was redirected from another page (e.g., checkout.html)
        const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');

        if (redirectAfterLogin) {
          localStorage.removeItem('redirectAfterLogin'); // Remove stored redirect
          window.location.href = redirectAfterLogin; // ✅ Go back to the correct page
        } else {
          window.location.href = 'index.html'; // ✅ Only redirect to index if no stored redirect
        }
      } else {
        loginError.textContent = 'Invalid email or password.'; // Show message
        loginError.style.display = 'block';
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      loginError.textContent = 'An error occurred while logging in.';
      loginError.style.display = 'block';
    }
  });

  // Hide error message when user types
  document.getElementById('inputEmail').addEventListener('input', () => {
    loginError.style.display = 'none';
  });

  document.getElementById('inputPassword').addEventListener('input', () => {
    loginError.style.display = 'none';
  });
});
