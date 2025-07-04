// Authentifizierung
let userRole = null

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  const remember = document.getElementById('rememberMe').checked

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, remember })
  })

  if (res.ok) {
    const data = await res.json()
    userRole = data.role
    document.getElementById('loginContainer').style.display = 'none'
    document.getElementById('appContainer').style.display = 'block'
    if (userRole === 'admin') {
      document.getElementById('collectionForm').style.display = 'block'
    }
    fetchCollections()
  } else {
    alert('Login fehlgeschlagen')
  }
})

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const username = document.getElementById('newUsername').value
  const password = document.getElementById('newPassword').value

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  const result = await res.json()
  if (res.ok) {
    alert('Benutzer registriert – jetzt einloggen')
  } else {
    alert('Fehler: ' + (result.error || 'Unbekannter Fehler bei der Registrierung'))
  }
})

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/logout')
  location.reload()
})
