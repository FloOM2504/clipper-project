// Slot-Klick zum Markieren/Umschalten
async function toggleClipper(event, elem, colId, pos) {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  const owned = !elem.classList.contains('owned') ? 1 : 0

  await fetch('/api/ownership', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection_id: colId, position: pos, owned })
  })

  fetchCollections()
}
