type ItineraryMode = 'focus' | 'all';

interface StoredItineraryView {
  slug: string;
  pathname: string;
  date: string;
  mode: ItineraryMode;
  openDates: string[];
}

interface PrintSnapshot {
  date: string;
  mode: ItineraryMode;
  details: Array<{ detail: HTMLDetailsElement; open: boolean; hidden: boolean }>;
  scrollX: number;
  scrollY: number;
  dateScroll: number;
  focused: HTMLElement | null;
}

const HISTORY_KEY = 'journeyAtlasDailyView';

function initializeTripItinerary(element: HTMLElement) {
  if (element.dataset.itineraryReady) return;

  const days = [...element.querySelectorAll<HTMLDetailsElement>('.itinerary-day[data-itinerary-date]')];
  const dates = new Map(days.map(day => [day.dataset.itineraryDate!, day]));
  const dateLinks = [...element.querySelectorAll<HTMLAnchorElement>('[data-day-select]')];
  const navigation = element.querySelector<HTMLElement>('[data-day-navigation]');
  const dateNavigation = element.querySelector<HTMLElement>('[data-day-date-navigation]');
  const previous = element.querySelector<HTMLButtonElement>('[data-day-previous]');
  const next = element.querySelector<HTMLButtonElement>('[data-day-next]');
  const modeButton = element.querySelector<HTMLButtonElement>('[data-expand-days]');
  const modeLabel = element.querySelector<HTMLElement>('[data-day-mode-label]');
  const viewLabel = element.querySelector<HTMLElement>('[data-itinerary-view-label]');
  const count = element.querySelector<HTMLElement>('[data-day-current]');
  const announcement = element.querySelector<HTMLElement>('[data-day-announcement]');
  const isZh = element.dataset.tripLanguage === 'zh-CN';
  const slug = element.dataset.tripSlug ?? '';
  let selectedDate = days[0]?.dataset.itineraryDate ?? '';
  let mode: ItineraryMode = 'focus';
  let printSnapshot: PrintSnapshot | undefined;
  let historyTimer: number | undefined;
  let restoreFrame: number | undefined;
  let isRestoringPrint = false;
  let isRestoringHistory = false;
  const programmaticToggles = new WeakMap<HTMLDetailsElement, boolean>();

  const text = (zh: string, en: string) => isZh ? zh : en;
  const selectedDay = () => dates.get(selectedDate);
  const selectedIndex = () => days.findIndex(day => day.dataset.itineraryDate === selectedDate);

  function historyObject(): Record<string, unknown> {
    return history.state && typeof history.state === 'object' && !Array.isArray(history.state)
      ? { ...history.state } : {};
  }

  function storedView(state: unknown = history.state): StoredItineraryView | undefined {
    const candidate: unknown = state && typeof state === 'object' ? (state as Record<string, unknown>)[HISTORY_KEY] : undefined;
    if (!candidate || typeof candidate !== 'object') return;
    const view = candidate as Partial<StoredItineraryView>;
    if (view.slug !== slug || view.pathname !== location.pathname || typeof view.date !== 'string' || !dates.has(view.date)) return;
    if (view.mode !== 'focus' && view.mode !== 'all') return;
    return {
      slug,
      pathname: location.pathname,
      date: view.date,
      mode: view.mode,
      openDates: Array.isArray(view.openDates) ? view.openDates.filter(date => typeof date === 'string' && dates.has(date)) : [view.date],
    };
  }

  function writeView(action: 'replace' | 'push' = 'replace', hash?: string) {
    if (printSnapshot || isRestoringPrint || isRestoringHistory || !dates.has(selectedDate)) return;
    const state = historyObject();
    state[HISTORY_KEY] = {
      slug,
      pathname: location.pathname,
      date: selectedDate,
      mode,
      openDates: days.filter(day => day.open).map(day => day.dataset.itineraryDate!),
    } satisfies StoredItineraryView;
    const url = new URL(location.href);
    if (hash !== undefined) url.hash = hash;
    if (action === 'push' && url.hash !== location.hash) history.pushState(state, '', url);
    else history.replaceState(state, '', url);
  }

  function measureNavigation() {
    if (navigation && !printSnapshot && !isRestoringPrint) element.style.setProperty('--daily-nav-height', `${navigation.offsetHeight}px`);
  }

  function keepSelectedDateVisible() {
    const link = dateLinks.find(item => item.dataset.daySelect === selectedDate);
    if (!link || !dateNavigation) return;
    const linkRect = link.getBoundingClientRect();
    const navRect = dateNavigation.getBoundingClientRect();
    if (linkRect.left < navRect.left + 3) dateNavigation.scrollBy({ left: linkRect.left - navRect.left - 3, behavior: 'instant' });
    else if (linkRect.right > navRect.right - 3) dateNavigation.scrollBy({ left: linkRect.right - navRect.right + 3, behavior: 'instant' });
  }

  function synchronizeNavigation(keepVisible = true) {
    const index = selectedIndex();
    element.dataset.itineraryMode = mode;
    element.dataset.selectedDate = selectedDate;
    dateLinks.forEach(link => {
      if (link.dataset.daySelect === selectedDate) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (count) count.textContent = `${Math.max(0, index + 1)} / ${days.length}`;
    if (viewLabel) viewLabel.textContent = mode === 'focus' ? text('单日查看', 'One day') : text('查看全程', 'All days');
    if (modeLabel) modeLabel.textContent = mode === 'focus' ? text('查看全程', 'View all') : text('单日查看', 'One day');
    modeButton?.setAttribute('aria-expanded', String(mode === 'all'));

    // Keep boundary controls focusable so selecting the last day does not lose keyboard focus.
    previous?.setAttribute('aria-disabled', String(index <= 0));
    next?.setAttribute('aria-disabled', String(index < 0 || index >= days.length - 1));
    if (previous) previous.disabled = false;
    if (next) next.disabled = false;
    if (keepVisible) keepSelectedDateVisible();
    measureNavigation();
  }

  function announceDay() {
    const day = selectedDay();
    if (!day || !announcement) return;
    const label = `${day.dataset.dayLabel} · ${selectedIndex() + 1} / ${days.length} · ${day.dataset.dayTitle}`;
    if (announcement.textContent !== label) announcement.textContent = label;
  }

  function setDetailsOpen(detail: HTMLDetailsElement, open: boolean) {
    if (detail.open === open) return;
    programmaticToggles.set(detail, open);
    detail.open = open;
  }

  function applyView(options: { openSelected?: boolean; openAll?: boolean } = {}) {
    const active = document.activeElement;
    const activeDay = active instanceof Element ? active.closest<HTMLDetailsElement>('.itinerary-day') : null;
    days.forEach(day => {
      const isSelected = day.dataset.itineraryDate === selectedDate;
      day.hidden = mode === 'focus' && !isSelected;
      if (mode === 'focus' && !isSelected) setDetailsOpen(day, false);
      else if (options.openAll || (options.openSelected && isSelected)) setDetailsOpen(day, true);
    });
    synchronizeNavigation();

    // Focus changes only when the previously focused content would become hidden.
    if (activeDay?.hidden) dateLinks.find(link => link.dataset.daySelect === selectedDate)?.focus({ preventScroll: true });
  }

  function fragmentTarget(hash = location.hash): HTMLElement | undefined {
    let id: string;
    try { id = decodeURIComponent(hash.replace(/^#/, '')); }
    catch { return; }
    if (!['source-', 'day-', 'alternative-', 'ticket-', 'dining-'].some(prefix => id.startsWith(prefix))) return;
    return document.getElementById(id) ?? undefined;
  }

  function targetDay(target?: HTMLElement) {
    const day = target?.closest<HTMLDetailsElement>('.itinerary-day[data-itinerary-date]');
    return day && element.contains(day) ? day : undefined;
  }

  function revealAncestors(target: HTMLElement) {
    for (let ancestor: Element | null = target; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor instanceof HTMLDetailsElement) setDetailsOpen(ancestor, true);
    }
  }

  function scrollToTarget(target: HTMLElement) {
    if (element.contains(target) && navigation) {
      const inset = Number.parseFloat(getComputedStyle(navigation).top) || 0;
      window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - navigation.offsetHeight - inset - 18), behavior: 'instant' });
    } else target.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  function focusFragment(target: HTMLElement) {
    const focusTarget = target instanceof HTMLDetailsElement ? target.querySelector<HTMLElement>(':scope > summary') : target;
    if (!focusTarget) return;
    if (!focusTarget.hasAttribute('tabindex') && focusTarget.tagName !== 'SUMMARY') focusTarget.tabIndex = -1;
    focusTarget.focus({ preventScroll: true });
  }

  function navigateToFragment(hash: string, options: { focus?: boolean; dateControl?: boolean } = {}) {
    if (printSnapshot || isRestoringPrint || isRestoringHistory) return;
    const target = fragmentTarget(hash);
    if (!target) return;
    writeView();
    const day = targetDay(target);
    if (day) {
      selectedDate = day.dataset.itineraryDate!;
      if (options.dateControl || target.id.startsWith('dining-')) mode = 'focus';
      applyView({ openSelected: true });
      announceDay();
    }
    revealAncestors(target);
    writeView('push', hash);
    scrollToTarget(target);
    if (options.focus && !options.dateControl) focusFragment(target);
  }

  function navigateToDate(date: string) {
    if (!dates.has(date)) return;
    navigateToFragment(`#day-${date}`, { dateControl: true });
  }

  function readingDay(): HTMLDetailsElement | undefined {
    if (!navigation) return;
    const navRect = navigation.getBoundingClientRect();
    if (navRect.bottom <= 0 || navRect.top >= window.innerHeight) return;
    const readingLine = navRect.bottom + 24;
    return days.find(day => {
      const rect = day.getBoundingClientRect();
      return rect.top <= readingLine && rect.bottom > readingLine;
    });
  }

  function toggleView() {
    if (printSnapshot || isRestoringPrint || isRestoringHistory || !days.length) return;
    const priorDate = selectedDate;
    if (mode === 'all') selectedDate = readingDay()?.dataset.itineraryDate ?? selectedDate;
    mode = mode === 'focus' ? 'all' : 'focus';
    applyView({ openSelected: true, openAll: mode === 'all' });
    writeView('replace', priorDate !== selectedDate ? `#day-${selectedDate}` : undefined);
    const day = selectedDay();
    if (day) scrollToTarget(day);
    announceDay();
  }

  function restoreFromHistory(scroll: boolean, saved?: { view: StoredItineraryView | undefined; hash: string }) {
    if (printSnapshot || isRestoringPrint) return;
    const view = saved ? saved.view : storedView();
    const target = fragmentTarget(saved?.hash);
    const day = targetDay(target);
    selectedDate = day?.dataset.itineraryDate ?? view?.date ?? days[0]?.dataset.itineraryDate ?? '';
    mode = view?.mode ?? 'focus';
    applyView({ openSelected: true, openAll: mode === 'all' });
    if (view) {
      const openDates = new Set(view.openDates);
      days.forEach(item => setDetailsOpen(item, !item.hidden && openDates.has(item.dataset.itineraryDate!)));
    }
    if (target) {
      revealAncestors(target);
      if (scroll) scrollToTarget(target);
    }
    writeView();
  }

  function scheduleHistoryRestore(event: Event) {
    // Capture the incoming entry before deferred disclosure events can write to history.
    const saved = { view: storedView(event instanceof PopStateEvent ? event.state : history.state), hash: location.hash };
    isRestoringHistory = true;
    if (historyTimer !== undefined) window.clearTimeout(historyTimer);
    historyTimer = window.setTimeout(() => {
      historyTimer = undefined;
      try { restoreFromHistory(true, saved); }
      finally { isRestoringHistory = false; }
      writeView();
    }, 0);
  }

  modeButton?.addEventListener('click', toggleView);
  previous?.addEventListener('click', () => {
    const day = days[selectedIndex() - 1];
    if (day) navigateToDate(day.dataset.itineraryDate!);
  });
  next?.addEventListener('click', () => {
    const day = days[selectedIndex() + 1];
    if (day) navigateToDate(day.dataset.itineraryDate!);
  });

  dateNavigation?.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('[data-day-select]') : null;
    if (!link) return;
    const index = dateLinks.indexOf(link);
    let destination = index;
    if (event.key === 'ArrowLeft') destination = Math.max(0, index - 1);
    else if (event.key === 'ArrowRight') destination = Math.min(dateLinks.length - 1, index + 1);
    else if (event.key === 'Home') destination = 0;
    else if (event.key === 'End') destination = dateLinks.length - 1;
    else return;
    event.preventDefault();
    const nextLink = dateLinks[destination];
    if (nextLink?.dataset.daySelect) {
      navigateToDate(nextLink.dataset.daySelect);
      nextLink.focus({ preventScroll: true });
    }
  });

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!anchor || anchor.hasAttribute('data-gallery-select') || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !fragmentTarget(url.hash)) return;
    event.preventDefault();
    navigateToFragment(url.hash, { focus: event.detail === 0, dateControl: anchor.hasAttribute('data-day-select') });
  });

  days.forEach(day => day.addEventListener('toggle', () => {
    // Programmatic changes dispatch later and may coalesce; only native changes save open dates.
    const expected = programmaticToggles.get(day);
    programmaticToggles.delete(day);
    if (expected === day.open) return;
    writeView();
  }));
  window.addEventListener('hashchange', scheduleHistoryRestore);
  window.addEventListener('popstate', scheduleHistoryRestore);
  window.addEventListener('pageshow', event => { if (event.persisted) restoreFromHistory(false); });
  if (navigation && typeof ResizeObserver !== 'undefined') new ResizeObserver(measureNavigation).observe(navigation);
  else window.addEventListener('resize', measureNavigation);

  window.addEventListener('beforeprint', () => {
    if (printSnapshot) return;
    if (restoreFrame !== undefined) window.cancelAnimationFrame(restoreFrame);
    isRestoringPrint = false;
    const printDetails = [...document.querySelectorAll<HTMLDetailsElement>('.itinerary-day, .day-alternative, details[data-trip-references], details[data-ticket-details]')];
    printSnapshot = {
      date: selectedDate,
      mode,
      details: printDetails.map(detail => ({ detail, open: detail.open, hidden: detail.hidden })),
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      dateScroll: dateNavigation?.scrollLeft ?? 0,
      focused: document.activeElement instanceof HTMLElement ? document.activeElement : null,
    };
    element.dataset.itineraryPrinting = 'true';
    printDetails.forEach(detail => { detail.hidden = false; setDetailsOpen(detail, true); });
  });

  window.addEventListener('afterprint', () => {
    if (!printSnapshot) return;
    const snapshot = printSnapshot;
    isRestoringPrint = true;
    selectedDate = snapshot.date;
    mode = snapshot.mode;
    snapshot.details.forEach(({ detail, open, hidden }) => { detail.hidden = hidden; setDetailsOpen(detail, open); });
    printSnapshot = undefined;
    delete element.dataset.itineraryPrinting;
    synchronizeNavigation(false);

    // Wait for both the page and the independent gallery print handler to restore their layouts.
    restoreFrame = window.requestAnimationFrame(() => {
      restoreFrame = window.requestAnimationFrame(() => {
        if (dateNavigation) dateNavigation.scrollLeft = snapshot.dateScroll;
        isRestoringPrint = false;
        measureNavigation();
        if (snapshot.focused?.isConnected && !snapshot.focused.closest('[hidden], [inert]')) snapshot.focused.focus({ preventScroll: true });
        window.scrollTo({ left: snapshot.scrollX, top: snapshot.scrollY, behavior: 'instant' });
        restoreFrame = undefined;
      });
    });
  });
  document.querySelector('[data-print-trip]')?.addEventListener('click', () => window.print());

  element.dataset.itineraryReady = 'true';
  if (count) count.hidden = !days.length;
  if (modeButton) modeButton.hidden = days.length < 2;
  if (previous) previous.hidden = days.length < 2;
  if (next) next.hidden = days.length < 2;
  measureNavigation();
  restoreFromHistory(Boolean(location.hash));
}

const itinerary = document.querySelector<HTMLElement>('[data-trip-itinerary]');
if (itinerary) initializeTripItinerary(itinerary);

export {};
