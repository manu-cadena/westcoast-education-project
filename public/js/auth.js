import { removeLocalStorageItem, setLocalStorageItem } from './localStorage.js';

export function handleLogout() {
  removeLocalStorageItem('userId');
  removeLocalStorageItem('userName');
  alert('You have been logged out.');
  window.location.href = 'index.html'; // Redirect to home
}

export function preventUnauthorizedCheckout() {
  const checkoutLink = document.querySelector(
    ".nav-link[href='checkout.html']"
  );
  if (checkoutLink) {
    checkoutLink.addEventListener('click', (event) => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        event.preventDefault();
        alert('You must be logged in to access checkout.');
        setLocalStorageItem('redirectAfterLogin', 'checkout.html');
        window.location.href = 'login.html';
      }
    });
  }
}
