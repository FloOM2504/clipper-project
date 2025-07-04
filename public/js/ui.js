// Theme wechseln
function toggleTheme() {
  const body = document.body
  const themeBtn = document.getElementById('themeToggleBtn')
  const isDark = body.dataset.theme === 'dark'

  body.dataset.theme = isDark ? 'light' : 'dark'
  themeBtn.textContent = isDark ? '🌙' : '☀️'

  localStorage.setItem('clipper-theme', body.dataset.theme)
}

// Bildanzeige
function enlargeImage(url) {
  const modal = document.getElementById('imageModal')
  const img = document.getElementById('modalImage')
  img.src = url
  modal.style.display = 'flex'
}

// Sondergrößenfeld ein-/ausblenden
function toggleCustomSize(select) {
  document.getElementById('custom_size').style.display =
    select.value === 'custom' ? 'block' : 'none'
}

// Datei-Upload-Vorschau
document.getElementById('image_file').addEventListener('change', function () {
  const file = this.files[0]
  const preview = document.getElementById('image_preview')
  if (file) {
    const reader = new FileReader()
    reader.onload = function (e) {
      preview.src = e.target.result
      preview.style.display = 'block'
    }
    reader.readAsDataURL(file)
  } else {
    preview.style.display = 'none'
    preview.src = ''
  }
})
