const days = [...document.querySelectorAll<HTMLDetailsElement>('.itinerary-day')];
const expandButton = document.querySelector<HTMLButtonElement>('[data-expand-days]');
function syncExpandButton() {
  if (!expandButton) return;
  const allOpen = days.length > 0 && days.every(day => day.open);
  expandButton.setAttribute('aria-expanded', String(allOpen));
  const label = document.createTextNode(allOpen ? 'Collapse all days ' : 'Expand all days ');
  const icon = expandButton.querySelector('svg');
  expandButton.replaceChildren(label);
  if (icon) expandButton.append(icon);
}
expandButton?.addEventListener('click', () => {
  const shouldOpen = !days.every(day => day.open);
  days.forEach(day => { day.open = shouldOpen; });
  syncExpandButton();
});
days.forEach(day => day.addEventListener('toggle', syncExpandButton));

let beforePrintState: boolean[] = [];
window.addEventListener('beforeprint', () => {
  beforePrintState = days.map(day => day.open);
  days.forEach(day => { day.open = true; });
});
window.addEventListener('afterprint', () => {
  days.forEach((day, index) => { day.open = beforePrintState[index] ?? day.open; });
});
document.querySelector('[data-print-trip]')?.addEventListener('click', () => window.print());

const notes = document.querySelector<HTMLTextAreaElement>('[data-trip-notes]');
const saveStatus = document.querySelector<HTMLElement>('[data-notes-status]');
if (notes) {
  const key = notes.dataset.notesKey!;
  const unavailableMessage = 'Storage unavailable. Export a copy to keep your notes.';
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) { notes.value = saved; if (saveStatus) saveStatus.textContent = 'Saved on this device.'; }
  } catch { if (saveStatus) saveStatus.textContent = unavailableMessage; }
  let timer: ReturnType<typeof setTimeout>;
  let dirty = false;
  function save() {
    try {
      localStorage.setItem(key, notes!.value);
      dirty = false;
      if (saveStatus) saveStatus.textContent = 'Saved on this device.';
    } catch { if (saveStatus) saveStatus.textContent = unavailableMessage; }
  }
  notes.addEventListener('input', () => {
    dirty = true;
    if (saveStatus) saveStatus.textContent = 'Saving…';
    clearTimeout(timer);
    timer = setTimeout(save, 350);
  });
  window.addEventListener('pagehide', () => {
    if (dirty) { clearTimeout(timer); save(); }
  });
  window.addEventListener('storage', (event) => {
    if (event.key === key && !dirty) {
      notes.value = event.newValue ?? '';
      if (saveStatus) saveStatus.textContent = 'Updated from another tab.';
    }
  });
  document.querySelector('[data-export-notes]')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ trip: notes.dataset.tripSlug, exportedAt: new Date().toISOString(), notes: notes.value }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${notes.dataset.tripSlug}-notes.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
