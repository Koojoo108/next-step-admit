// Clear localStorage and force refresh
console.log('🧹 CLEARING LOCALSTORAGE AND FORCING REFRESH');

// Clear all application-related localStorage
localStorage.removeItem('applications');
localStorage.removeItem('application-draft');
localStorage.removeItem('admin-auth');

console.log('✅ LocalStorage cleared');

// Force refresh the page
console.log('🔄 Forcing page refresh...');
setTimeout(() => {
  window.location.reload();
}, 1000);
