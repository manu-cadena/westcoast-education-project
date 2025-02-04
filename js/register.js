document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.querySelector('form');

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Get input values
    const firstName = document.getElementById('inputFirstName').value.trim();
    const lastName = document.getElementById('inputLastName').value.trim();
    const billingAddress = document
      .getElementById('inputBillingAddress')
      .value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const password = document.getElementById('inputPassword').value.trim();
    const confirmPassword = document
      .getElementById('inputPasswordConfirm')
      .value.trim();

    // Basic validation
    if (
      !firstName ||
      !lastName ||
      !billingAddress ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      alert('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      // Check if email already exists
      const response = await fetch('http://localhost:3000/users');
      const users = await response.json();
      const existingUser = users.find((user) => user.email === email);

      if (existingUser) {
        alert('Email is already registered.');
        return;
      }

      // Create new user object
      const newUser = {
        id: users.length + 1, // Generate a unique ID
        name: `${firstName} ${lastName}`,
        email,
        billingAddress,
        password, // In real-world apps, NEVER store passwords in plain text!
      };

      // Add new user to database
      const addUserResponse = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!addUserResponse.ok) {
        throw new Error('Failed to create user.');
      }

      // Automatically log in the user after registration
      localStorage.setItem('userId', newUser.id);
      localStorage.setItem('userEmail', newUser.email);
      localStorage.setItem('userName', newUser.name);

      alert('Account created successfully! Redirecting to Dashboard...');
      window.location.href = 'index.html'; // Redirect to the dashboard
    } catch (error) {
      console.error('Error registering user:', error);
      alert('An error occurred while registering.');
    }
  });
});
