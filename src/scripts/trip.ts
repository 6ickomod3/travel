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

interface DaySwipe {
  identifier: number;
  day: HTMLDetailsElement;
  date: string;
  x: number;
  y: number;
  scrollX: number;
  scrollY: number;
  startedAt: number;
}

const HISTORY_KEY = 'journeyAtlasDailyView';

function initializeTripItinerary(element: HTMLElement) {
  if (element.dataset.itineraryReady) return;

  const days = [...element.querySelectorAll<HTMLDetailsElement>('.itinerary-day[data-itinerary-date]')];
  const dates = new Map(days.map(day => [day.dataset.itineraryDate!, day]));
  const sectionDisclosures = new Map<string, HTMLDetailsElement>();
  document.querySelectorAll<HTMLDetailsElement>('details[data-trip-section]').forEach(detail => {
    const id = detail.dataset.tripSection;
    const section = id ? document.getElementById(id) : null;
    if (id && section?.tagName === 'SECTION' && detail.parentElement === section) sectionDisclosures.set(id, detail);
  });
  const navigationSections = new Set<string>();
  document.querySelectorAll<HTMLAnchorElement>('.trip-subnav-links > a[href^="#"]').forEach(anchor => {
    const url = new URL(anchor.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
    let id: string;
    try { id = decodeURIComponent(url.hash.slice(1)); }
    catch { return; }
    if (document.getElementById(id)?.tagName === 'SECTION') navigationSections.add(id);
  });
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
  const swipeHint = element.querySelector<HTMLElement>('[data-day-swipe-hint]');
  const supportsTouch = typeof TouchEvent !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
  const isZh = element.dataset.tripLanguage === 'zh-CN';
  const slug = element.dataset.tripSlug ?? '';
  let selectedDate = days[0]?.dataset.itineraryDate ?? '';
  let mode: ItineraryMode = 'focus';
  let printSnapshot: PrintSnapshot | undefined;
  let historyTimer: number | undefined;
  let restoreFrame: number | undefined;
  let isRestoringPrint = false;
  let isRestoringHistory = false;
  let swipe: DaySwipe | undefined;
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
    if (swipeHint) swipeHint.hidden = !supportsTouch || mode !== 'focus' || days.length < 2;

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
    if (!navigationSections.has(id) && !sectionDisclosures.has(id) && !['source-', 'day-', 'alternative-', 'ticket-', 'dining-', 'stay-', 'cost-', 'flight-'].some(prefix => id.startsWith(prefix))) return;
    return document.getElementById(id) ?? undefined;
  }

  function targetDay(target?: HTMLElement) {
    const day = target?.closest<HTMLDetailsElement>('.itinerary-day[data-itinerary-date]');
    return day && element.contains(day) ? day : undefined;
  }

  function revealAncestors(target: HTMLElement) {
    const sectionDisclosure = sectionDisclosures.get(target.id);
    if (sectionDisclosure) setDetailsOpen(sectionDisclosure, true);
    for (let ancestor: Element | null = target; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor instanceof HTMLDetailsElement) setDetailsOpen(ancestor, true);
    }
  }

  function scrollToTarget(target: HTMLElement) {
    if (target !== element && element.contains(target) && navigation) {
      const inset = Number.parseFloat(getComputedStyle(navigation).top) || 0;
      window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - navigation.offsetHeight - inset - 18), behavior: 'instant' });
    } else target.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  function focusFragment(target: HTMLElement) {
    const disclosure = target instanceof HTMLDetailsElement ? target : sectionDisclosures.get(target.id);
    const focusTarget = disclosure ? disclosure.querySelector<HTMLElement>(':scope > summary') : target;
    if (!focusTarget) return;
    if (!focusTarget.hasAttribute('tabindex') && focusTarget.tagName !== 'SUMMARY') focusTarget.tabIndex = -1;
    focusTarget.focus({ preventScroll: true });
  }

  function navigateToFragment(hash: string, options: { focus?: boolean; dateControl?: boolean } = {}) {
    if (printSnapshot || isRestoringPrint || isRestoringHistory) return;
    const target = fragmentTarget(hash);
    if (!target) return;
    cancelSwipe();
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

  function adjacentDay(direction: -1 | 1) {
    const index = selectedIndex();
    return index < 0 ? undefined : days[index + direction];
  }

  function cancelSwipe() {
    swipe = undefined;
  }

  function swipeBlocked() {
    return mode !== 'focus' || Boolean(printSnapshot) || isRestoringPrint || isRestoringHistory
      || (window.visualViewport?.scale ?? 1) > 1.05
      || window.getSelection()?.isCollapsed === false;
  }

  function nativeGestureTarget(target: Element, day: HTMLDetailsElement) {
    if (target.closest('a, button, input, textarea, select, label, summary, table, [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"]), [draggable="true"], [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="slider"], [role="scrollbar"], [role="table"], img, video, audio, canvas, iframe, .leaflet-container, [data-gallery-track], [data-day-swipe-ignore]')) return true;
    for (let ancestor: Element | null = target; ancestor && ancestor !== day; ancestor = ancestor.parentElement) {
      const overflow = getComputedStyle(ancestor).overflowX;
      if ((overflow === 'auto' || overflow === 'scroll') && ancestor.scrollWidth > ancestor.clientWidth + 1) return true;
    }
    return false;
  }

  function beginSwipe(event: TouchEvent) {
    cancelSwipe();
    if (swipeBlocked() || event.touches.length !== 1 || days.length < 2) return;
    const target = event.target instanceof Element ? event.target : null;
    const day = target?.closest<HTMLDetailsElement>('.itinerary-day');
    const touch = event.touches[0];
    if (!target?.closest('.day-content') || !day || day !== selectedDay() || !day.open || day.hidden
      || touch.clientX < 24 || touch.clientX > window.innerWidth - 24 || nativeGestureTarget(target, day)) return;
    swipe = { identifier: touch.identifier, day, date: selectedDate, x: touch.clientX, y: touch.clientY,
      scrollX: window.scrollX, scrollY: window.scrollY, startedAt: performance.now() };
  }

  function moveSwipe(event: TouchEvent) {
    const ongoing = swipe;
    if (!ongoing) return;
    const touch = [...event.touches].find(point => point.identifier === ongoing.identifier);
    if (swipeBlocked() || event.touches.length !== 1 || !touch || selectedDate !== ongoing.date
      || (Math.abs(touch.clientY - ongoing.y) > 18 && Math.abs(touch.clientY - ongoing.y) > Math.abs(touch.clientX - ongoing.x))
      || Math.abs(window.scrollY - ongoing.scrollY) > 12 || Math.abs(window.scrollX - ongoing.scrollX) > 12) cancelSwipe();
  }

  function endSwipe(event: TouchEvent) {
    const finished = swipe;
    cancelSwipe();
    if (!finished || swipeBlocked() || event.touches.length !== 0 || selectedDate !== finished.date
      || selectedDay() !== finished.day || !finished.day.isConnected || !finished.day.open || finished.day.hidden
      || performance.now() - finished.startedAt > 900
      || Math.abs(window.scrollY - finished.scrollY) > 12 || Math.abs(window.scrollX - finished.scrollX) > 12) return;
    const touch = [...event.changedTouches].find(point => point.identifier === finished.identifier);
    if (!touch) return;
    const distance = touch.clientX - finished.x;
    if (Math.abs(distance) < Math.max(64, Math.min(100, finished.day.clientWidth * .18))
      || Math.abs(distance) < Math.abs(touch.clientY - finished.y) * 1.7) return;
    const destination = adjacentDay(distance < 0 ? 1 : -1);
    if (!destination) return;
    if (event.cancelable) event.preventDefault();
    navigateToDate(destination.dataset.itineraryDate!);
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
    cancelSwipe();
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
    const keepCurrentView = !view && Boolean(target) && !day && dates.has(selectedDate);
    selectedDate = day?.dataset.itineraryDate ?? view?.date ?? (keepCurrentView ? selectedDate : days[0]?.dataset.itineraryDate ?? '');
    mode = view?.mode ?? (keepCurrentView ? mode : 'focus');
    applyView({ openSelected: !keepCurrentView, openAll: !keepCurrentView && mode === 'all' });
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
    cancelSwipe();
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
    const day = adjacentDay(-1);
    if (day) navigateToDate(day.dataset.itineraryDate!);
  });
  next?.addEventListener('click', () => {
    const day = adjacentDay(1);
    if (day) navigateToDate(day.dataset.itineraryDate!);
  });

  // Passive movement preserves native scrolling; only a completed day change cancels a synthetic tap.
  element.addEventListener('touchstart', beginSwipe, { passive: true });
  element.addEventListener('touchmove', moveSwipe, { passive: true });
  element.addEventListener('touchend', endSwipe, { passive: false });
  window.addEventListener('touchstart', event => { if (event.touches.length > 1) cancelSwipe(); }, { passive: true, capture: true });
  window.addEventListener('touchcancel', cancelSwipe, { passive: true });
  window.addEventListener('blur', cancelSwipe);
  element.addEventListener('contextmenu', cancelSwipe);
  document.addEventListener('visibilitychange', cancelSwipe);
  document.addEventListener('selectionchange', () => { if (window.getSelection()?.isCollapsed === false) cancelSwipe(); });
  window.addEventListener('scroll', () => {
    if (swipe && (Math.abs(window.scrollY - swipe.scrollY) > 12 || Math.abs(window.scrollX - swipe.scrollX) > 12)) cancelSwipe();
  }, { passive: true });

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
    cancelSwipe();
    if (printSnapshot) return;
    if (restoreFrame !== undefined) window.cancelAnimationFrame(restoreFrame);
    isRestoringPrint = false;
    const printDetails = [...document.querySelectorAll<HTMLDetailsElement>('.itinerary-day, .day-alternative, details[data-trip-references], details[data-ticket-details], details[data-trip-section]')];
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
