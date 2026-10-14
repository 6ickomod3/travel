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
