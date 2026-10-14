const days = [...document.querySelectorAll<HTMLDetailsElement>('.itinerary-day')];
const isZh = document.documentElement.lang === 'zh-CN';
const expandButton = document.querySelector<HTMLButtonElement>('[data-expand-days]');
function syncExpandButton() {
  if (!expandButton) return;
  const allOpen = days.length > 0 && days.every(day => day.open);
  expandButton.setAttribute('aria-expanded', String(allOpen));
  const label = document.createTextNode(isZh ? (allOpen ? '收起全部日程 ' : '展开全部日程 ') : (allOpen ? 'Collapse all days ' : 'Expand all days '));
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
  const unavailableMessage = isZh ? '暂时无法保存，请导出一份笔记。' : 'Storage unavailable. Export a copy to keep your notes.';
  const savedMessage = isZh ? '已保存在这台设备上。' : 'Saved on this device.';
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) { notes.value = saved; if (saveStatus) saveStatus.textContent = savedMessage; }
  } catch { if (saveStatus) saveStatus.textContent = unavailableMessage; }
  let timer: ReturnType<typeof setTimeout>;
  let dirty = false;
  function save() {
    try {
      localStorage.setItem(key, notes!.value);
      dirty = false;
      if (saveStatus) saveStatus.textContent = savedMessage;
    } catch { if (saveStatus) saveStatus.textContent = unavailableMessage; }
  }
  notes.addEventListener('input', () => {
    dirty = true;
    if (saveStatus) saveStatus.textContent = isZh ? '正在保存…' : 'Saving…';
    clearTimeout(timer);
    timer = setTimeout(save, 350);
  });
  window.addEventListener('pagehide', () => {
    if (dirty) { clearTimeout(timer); save(); }
  });
  window.addEventListener('storage', (event) => {
    if (event.key === key && !dirty) {
      notes.value = event.newValue ?? '';
      if (saveStatus) saveStatus.textContent = isZh ? '已同步这台设备另一个标签页的修改。' : 'Updated from another tab.';
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
