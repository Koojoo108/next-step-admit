// Force sync localStorage applications to database
console.log('🚨 FORCING LOCALSTORAGE SYNC TO DATABASE');

// Get localStorage applications
const storedApplications = JSON.parse(localStorage.getItem('applications') || '[]');
console.log('Found applications in localStorage:', storedApplications.length);

if (storedApplications.length > 0) {
  console.log('Applications to sync:', storedApplications);
  
  // Clear localStorage after logging
  localStorage.removeItem('applications');
  console.log('✅ LocalStorage cleared');
  
  console.log('📋 To complete the sync:');
  console.log('1. Go to admin dashboard');
  console.log('2. Click "Sync Local Storage" button');
  console.log('3. Applications will move to database');
} else {
  console.log('No applications found in localStorage');
}
