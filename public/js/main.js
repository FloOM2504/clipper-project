// Hauptinitialisierung nach DOM-Load
window.addEventListener('DOMContentLoaded', async () => {
  const savedTheme = localStorage.getItem('clipper-theme') || 'light'
  document.body.dataset.theme = savedTheme
  document.getElementById('themeToggleBtn').textContent = savedTheme === 'dark' ? '☀️' : '🌙'

  try {
    const res = await fetch('/api/session')
    const data = await res.json()
    if (data.loggedIn) {
      userRole = data.role
      document.getElementById('loginContainer').style.display = 'none'
      document.getElementById('appContainer').style.display = 'block'
      if (userRole === 'admin') {
        document.getElementById('collectionForm').style.display = 'block'
      }
      fetchCollections()
    }
  } catch (e) {
    console.error('Session-Prüfung fehlgeschlagen:', e)
  }
})
