const days = [...document.querySelectorAll<HTMLDetailsElement>('.itinerary-day')];
const printDetails = [...document.querySelectorAll<HTMLDetailsElement>('.itinerary-day, .day-alternative, details[data-trip-references]')];
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

let beforePrintState: Map<HTMLDetailsElement, boolean> | undefined;
window.addEventListener('beforeprint', () => {
  beforePrintState ??= new Map(printDetails.map(detail => [detail, detail.open]));
  printDetails.forEach(detail => { detail.open = true; });
  syncExpandButton();
});
window.addEventListener('afterprint', () => {
  if (!beforePrintState) return;
  beforePrintState.forEach((wasOpen, detail) => { detail.open = wasOpen; });
  beforePrintState = undefined;
  syncExpandButton();
});
document.querySelector('[data-print-trip]')?.addEventListener('click', () => window.print());

function revealTripFragment() {
  let id: string;
  try { id = decodeURIComponent(window.location.hash.slice(1)); }
  catch { return; }
  if (!id.startsWith('source-') && !id.startsWith('day-') && !id.startsWith('alternative-')) return;
  const target = document.getElementById(id);
  if (!target) return;
  for (let ancestor: Element | null = target; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
  }
  target.scrollIntoView({ block: 'start', behavior: 'instant' });
  syncExpandButton();
}
window.addEventListener('hashchange', revealTripFragment);
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;
  const url = new URL(anchor.href);
  if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search && url.hash === window.location.hash) revealTripFragment();
});
revealTripFragment();
syncExpandButton();
