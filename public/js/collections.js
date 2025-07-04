// Fetch & Render der Kollektionen
async function fetchCollections() {
  const res = await fetch('/api/collections')
  const data = await res.json()

  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || ''
  const sizeFilter = document.getElementById('sizeFilter')?.value || ''
  const container = document.getElementById('collections')
  container.innerHTML = ''

  const filtered = data.filter((col) => {
    const matchesName = col.name.toLowerCase().includes(searchTerm)
    const matchesSize =
      sizeFilter === '' ||
      (sizeFilter === 'custom' && ![2, 4, 8].includes(col.size)) ||
      parseInt(sizeFilter) === col.size
    return matchesName && matchesSize
  })

  for (const col of filtered) {
    const ownershipRes = await fetch(`/api/ownership/${col.id}`)
    const ownership = await ownershipRes.json()
    const ownedSet = new Set(ownership.filter((o) => o.owned).map((o) => o.position))

    const card = document.createElement('div')
    card.className = 'card'
    card.setAttribute('data-id', col.id)
    const cardWidth = col.size * 56 + (col.size - 1) * 10 + 40
    card.setAttribute('style', `width: ${cardWidth}px`)

    let html = `
      <div class="collection-header">
        ${
          userRole === 'admin'
            ? `<button class="edit-icon" onclick="editCollection(${col.id})">✏️</button>`
            : ''
        }
        <div class="collection-info">
          <img src="${col.image_url}" onclick="enlargeImage('${
      col.image_url
    }')" class="collection-img" />
          <div>
            <h2>${col.name}</h2>
            <p><span class="collection-tag">${col.size}er Serie</span> ${col.description || ''}</p>
          </div>
        </div>
      </div>
      <div class="clipper-grid">
    `

    for (let i = 1; i <= col.size; i++) {
      const isOwned = ownedSet.has(i)
      html += `
        <div class="clipper-slot ${isOwned ? 'owned' : ''}" data-col-id="${
        col.id
      }" data-position="${i}">
          <img src="/uploads/clippers/collection_${
            col.id
          }_${i}.jpg" class="clipper-silhouette" alt="Clipper"
            onerror="this.src='images/clipper_silhouette_transparent.png'">
          <span>#${i}</span>
        </div>
      `
    }

    html += `</div>
      <div class="progress">
        <span>${ownedSet.size} von ${col.size} markiert</span>
        <progress max="${col.size}" value="${ownedSet.size}"></progress>
      </div>
    `

    card.innerHTML = html
    container.appendChild(card)

    card.querySelectorAll('.clipper-slot').forEach((slot) => {
      slot.addEventListener('click', async (e) => {
        e.preventDefault()
        e.stopPropagation()

        const colId = parseInt(slot.dataset.colId)
        const pos = parseInt(slot.dataset.position)
        const owned = !slot.classList.contains('owned') ? 1 : 0

        await fetch('/api/ownership', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collection_id: colId, position: pos, owned })
        })

        slot.classList.toggle('owned', !!owned)
        const progressBar = slot.closest('.card').querySelector('progress')
        const label = slot.closest('.card').querySelector('.progress span')
        const ownedNow = slot.closest('.card').querySelectorAll('.clipper-slot.owned').length
        const max = parseInt(progressBar.getAttribute('max'))
        progressBar.value = ownedNow
        label.textContent = `${ownedNow} von ${max} markiert`
      })
    })
  }
}

// Collection bearbeiten
async function editCollection(id) {
  if (currentEditId !== null && currentEditId !== id) {
    await fetchCollections()
  }

  currentEditId = id
  const res = await fetch('/api/collections')
  const data = await res.json()
  const col = data.find((c) => c.id === id)
  const card = document.querySelector(`.card[data-id='${id}']`)
  if (!card || !col) return

  card.innerHTML = `
    <input type="text" id="edit_name_${id}" value="${col.name}" placeholder="Name" />
    <input type="text" id="edit_desc_${id}" value="\${col.description}" placeholder="Beschreibung" />
    <label>Bild-URL (optional):</label>
    <div class="image-input-group">
      <input type="url" id="edit_img_url_${id}" value="\${col.image_url}" placeholder="Bild-URL" />
      <label for="edit_img_file_${id}" class="upload-label" title="Bild hochladen">
        <i class="fa-solid fa-image"></i>
        <input type="file" id="edit_img_file_${id}" accept="image/*" hidden />
      </label>
    </div>
    <img id="edit_img_preview_${id}" src="\${col.image_url}" class="upload-preview" />
    <input type="number" id="edit_size_${id}" value="\${col.size}" min="1" placeholder="Größe" />
    <button onclick="saveCollectionEdit(${id})">💾 Speichern</button>
    <button onclick="cancelCollectionEdit(${id})">❌ Abbrechen</button>
    <button onclick="deleteCollection(${id})" style="background-color: #ff3b30; color: white; margin-top: 12px;">
      🗑️ Kollektion löschen
    </button>
  `

  document.getElementById(`edit_img_file_${id}`).addEventListener('change', function () {
    const file = this.files[0]
    const preview = document.getElementById(`edit_img_preview_${id}`)
    const urlInput = document.getElementById(`edit_img_url_${id}`)

    if (file) {
      const reader = new FileReader()
      reader.onload = function (e) {
        preview.src = e.target.result
        preview.style.display = 'block'
      }
      reader.readAsDataURL(file)
      urlInput.value = ''
    }
  })

  card.classList.add('editing')
}

async function cancelCollectionEdit(id) {
  await fetchCollections()
  currentEditId = null
}

async function saveCollectionEdit(id) {
  const name = document.getElementById(`edit_name_${id}`).value
  const description = document.getElementById(`edit_desc_${id}`).value
  const imageUrlInput = document.getElementById(`edit_img_url_${id}`).value
  const imageFile = document.getElementById(`edit_img_file_${id}`).files[0]
  let image_url = imageUrlInput

  if (imageFile) {
    const formData = new FormData()
    formData.append('image', imageFile)
    const uploadRes = await fetch('/api/upload-image', { method: 'POST', body: formData })
    if (uploadRes.ok) {
      const uploadData = await uploadRes.json()
      image_url = uploadData.image_url
      document.getElementById(`edit_img_url_${id}`).value = ''
    } else {
      alert('Bild-Upload fehlgeschlagen')
      return
    }
  }

  const size = parseInt(document.getElementById(`edit_size_${id}`).value)

  await fetch(`/api/collections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, image_url, size })
  })

  fetchCollections()
}

async function deleteCollection(id) {
  const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' })
  if (res.ok) {
    currentEditId = null
    fetchCollections()
  } else {
    alert('Fehler beim Löschen')
  }
}

// Rundumberechnung der Bildhöhe nach jedem Rendern
function adjustClipperHeights() {
  document.querySelectorAll('.card').forEach((card) => {
    const headerH = card.querySelector('.collection-header').offsetHeight
    const progressH = card.querySelector('.progress').offsetHeight
    const available = card.clientHeight - headerH - progressH - 16 // 16px Puffer

    card.querySelectorAll('.clipper-silhouette').forEach((img) => {
      img.style.height = available + 'px'
    })
  })
}

// Nach jedem Neuladen der Collections aufrufen
const originalFetch = fetchCollections
fetchCollections = async () => {
  await originalFetch()
  adjustClipperHeights()
}
