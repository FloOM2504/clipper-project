window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('clipper-theme') || 'light'
  document.body.dataset.theme = savedTheme
  document.getElementById('themeToggleBtn').textContent = savedTheme === 'dark' ? '☀️' : '🌙'
})
