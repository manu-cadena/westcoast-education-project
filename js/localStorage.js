// 📂 js/localStorage.js

// Retrieve an item from localStorage, defaulting to an empty array if not found
export function getLocalStorageItem(key, defaultValue = []) {
  return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

// Save an item to localStorage
export function setLocalStorageItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Remove an item from localStorage
export function removeLocalStorageItem(key) {
  localStorage.removeItem(key);
}

// Clear all localStorage data (use with caution)
export function clearLocalStorage() {
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.clear();
}

// Add an item to a localStorage array (e.g., adding a course to selectedCourses)
export function addToLocalStorageArray(key, newItem) {
  const items = getLocalStorageItem(key);
  items.push(newItem);
  setLocalStorageItem(key, items);
}

// Remove an item from a localStorage array by matching a specific property (e.g., removing a course by id)
export function removeFromLocalStorageArray(key, itemId, property = 'id') {
  const items = getLocalStorageItem(key);
  const updatedItems = items.filter((item) => item[property] !== itemId);
  setLocalStorageItem(key, updatedItems);
}

// ✅ Function to retrieve courses from localStorage
export function getStoredCourses() {
  return JSON.parse(localStorage.getItem('selectedCourses')) || [];
}

// ✅ Function to remove a course from localStorage
export function removeStoredCourse(courseId) {
  let courses = getStoredCourses();
  courses = courses.filter((course) => course.id !== courseId);
  localStorage.setItem('selectedCourses', JSON.stringify(courses));
}

// ✅ Function to clear stored courses
export function clearStoredCourses() {
  localStorage.removeItem('selectedCourses');
}

export function logoutUser() {
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  window.location.href = 'index.html'; // Redirect to home after logout
}
