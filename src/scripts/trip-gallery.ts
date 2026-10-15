interface GalleryController {
  element: HTMLElement;
  hasPhoto: (id: string) => boolean;
  showPhoto: (id: string, reveal: boolean) => void;
}

interface GallerySelection {
  animate?: boolean;
  reveal?: boolean;
  focus?: boolean;
  announce?: boolean;
}

function initializeGallery(element: HTMLElement): GalleryController | undefined {
  const trackElement = element.querySelector<HTMLElement>('[data-gallery-track]');
  const slides = [...element.querySelectorAll<HTMLElement>('[data-gallery-photo]')];
  if (!trackElement || slides.length === 0 || element.dataset.galleryReady) return;
  const track: HTMLElement = trackElement;

  const photoIds = slides.map(slide => slide.dataset.galleryPhoto ?? '');
  const pages = [...element.querySelectorAll<HTMLAnchorElement>('[data-gallery-select]')];
  const pagination = element.querySelector<HTMLElement>('[data-gallery-pagination]');
  const previous = element.querySelector<HTMLButtonElement>('[data-gallery-prev]');
  const next = element.querySelector<HTMLButtonElement>('[data-gallery-next]');
  const buttons = element.querySelector<HTMLElement>('[data-gallery-controls]');
  const count = element.querySelector<HTMLElement>('[data-gallery-count]');
  const status = element.querySelector<HTMLElement>('[data-gallery-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isZh = element.lang === 'zh-CN';

  let currentIndex = -1;
  let lastAnnounced = -1;
  let pendingIndex: number | undefined;
  let scrollFrame = 0;
  let settleTimer = 0;
  let isPrinting = false;
  let trackWidth = track.clientWidth;
  let drag: { pointerId: number; startX: number; startScroll: number; startIndex: number; moved: boolean } | undefined;
  let suppressClickUntil = 0;

  const bounded = (index: number) => Math.max(0, Math.min(slides.length - 1, index));
  const nearestIndex = () => {
    let nearest = 0;
    let distance = Infinity;
    slides.forEach((slide, index) => {
      const difference = Math.abs(slide.offsetLeft - track.scrollLeft);
      if (difference < distance) { nearest = index; distance = difference; }
    });
    return nearest;
  };

  function synchronize(index: number, announce = false) {
    const selected = bounded(index);
    const slide = slides[selected];
    if (!slide) return;
    if (selected !== currentIndex) {
      currentIndex = selected;
      element.dataset.galleryCurrent = photoIds[selected];
      if (count) count.textContent = `${selected + 1} / ${slides.length}`;
      if (previous) {
        if (selected === 0 && document.activeElement === previous) track.focus({ preventScroll: true });
        previous.disabled = selected === 0;
      }
      if (next) {
        if (selected === slides.length - 1 && document.activeElement === next) track.focus({ preventScroll: true });
        next.disabled = selected === slides.length - 1;
      }

      // Keep links in offscreen captions out of the keyboard and reading order.
      slides.forEach((item, itemIndex) => {
        const inactive = itemIndex !== selected;
        if (inactive && item.contains(document.activeElement)) track.focus({ preventScroll: true });
        item.inert = inactive;
      });
      pages.forEach(page => {
        const active = page.dataset.gallerySelect === photoIds[selected];
        page.tabIndex = active ? 0 : -1;
        if (active) page.setAttribute('aria-current', 'true');
        else page.removeAttribute('aria-current');
      });
      const activePage = pages.find(page => page.dataset.gallerySelect === photoIds[selected]);
      if (activePage && pagination) {
        const pageBounds = activePage.getBoundingClientRect();
        const paginationBounds = pagination.getBoundingClientRect();
        if (pageBounds.left < paginationBounds.left) pagination.scrollLeft += pageBounds.left - paginationBounds.left;
        else if (pageBounds.right > paginationBounds.right) pagination.scrollLeft += pageBounds.right - paginationBounds.right;
      }
    }
    if (announce && selected !== lastAnnounced && status) {
      status.textContent = isZh
        ? `第${selected + 1}张，共${slides.length}张：${slide.dataset.galleryTitle ?? ''}`
        : `Photo ${selected + 1} of ${slides.length}: ${slide.dataset.galleryTitle ?? ''}`;
      lastAnnounced = selected;
    }
  }

  function settle() {
    if (isPrinting || drag) return;
    pendingIndex = undefined;
    synchronize(nearestIndex(), true);
  }

  function scheduleSettle() {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settle, 160);
  }

  function select(index: number, options: GallerySelection = {}) {
    const selected = bounded(index);
    const slide = slides[selected];
    if (!slide) return;
    const animate = options.animate !== false && !reducedMotion.matches;
    pendingIndex = selected;
    synchronize(selected);
    if (options.announce === false) lastAnnounced = selected;
    if (options.focus) track.focus({ preventScroll: true });
    track.scrollTo({ left: slide.offsetLeft, behavior: animate ? 'smooth' : 'instant' });
    if (options.reveal) element.scrollIntoView({ block: 'start', behavior: animate ? 'smooth' : 'instant' });
    if (Math.abs(track.scrollLeft - slide.offsetLeft) < 2) {
      pendingIndex = undefined;
      synchronize(selected, options.announce !== false);
    } else scheduleSettle();
  }

  function photoFragmentIndex() {
    let fragment: string;
    try { fragment = decodeURIComponent(window.location.hash.slice(1)); }
    catch { return -1; }
    return fragment.startsWith('photo-') ? photoIds.indexOf(fragment.slice(6)) : -1;
  }

  track.addEventListener('scroll', () => {
    if (isPrinting) return;
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      if (isPrinting) return;
      if (pendingIndex !== undefined) {
        const target = slides[pendingIndex];
        if (target && Math.abs(track.scrollLeft - target.offsetLeft) < 2) pendingIndex = undefined;
      }
      if (pendingIndex === undefined) synchronize(nearestIndex());
    });
    scheduleSettle();
  }, { passive: true });
  track.addEventListener('scrollend', settle);
  track.addEventListener('wheel', () => { pendingIndex = undefined; }, { passive: true });

  previous?.addEventListener('click', () => select(currentIndex - 1));
  next?.addEventListener('click', () => select(currentIndex + 1));
  element.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target !== track && !target?.closest('[data-gallery-controls], [data-gallery-pagination]')) return;
    let index: number;
    if (event.key === 'ArrowLeft') index = currentIndex - 1;
    else if (event.key === 'ArrowRight') index = currentIndex + 1;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = slides.length - 1;
    else return;
    event.preventDefault();
    select(index);
    if (target?.closest('[data-gallery-pagination]')) pages.find(page => page.dataset.gallerySelect === photoIds[bounded(index)])?.focus({ preventScroll: true });
  });

  // Touch scrolling stays native; mouse dragging supplies the same interaction.
  track.addEventListener('pointerdown', event => {
    pendingIndex = undefined;
    if (event.pointerType !== 'mouse' || event.button !== 0 || slides.length < 2) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest('[data-gallery-image]')) return;
    drag = { pointerId: event.pointerId, startX: event.clientX, startScroll: track.scrollLeft, startIndex: nearestIndex(), moved: false };
    track.focus({ preventScroll: true });
    track.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  track.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(distance) < 6) return;
    drag.moved = true;
    track.dataset.galleryDragging = 'true';
    track.scrollLeft = drag.startScroll - distance;
    event.preventDefault();
  });

  function endDrag(event?: PointerEvent) {
    if (!drag) return;
    const finished = drag;
    drag = undefined;
    let index = nearestIndex();
    const distance = event ? event.clientX - finished.startX : 0;
    if (finished.moved && index === finished.startIndex && Math.abs(distance) >= Math.min(100, track.clientWidth * .18)) index += distance < 0 ? 1 : -1;
    delete track.dataset.galleryDragging;
    if (track.hasPointerCapture(finished.pointerId)) track.releasePointerCapture(finished.pointerId);
    if (finished.moved) {
      suppressClickUntil = performance.now() + 350;
      select(index);
    }
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', () => endDrag());
  track.addEventListener('lostpointercapture', () => endDrag());
  track.addEventListener('click', event => {
    if (performance.now() >= suppressClickUntil) return;
    suppressClickUntil = 0;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  function alignAfterResize() {
    const width = track.clientWidth;
    if (isPrinting || width === 0 || Math.abs(width - trackWidth) < 1) return;
    trackWidth = width;
    select(currentIndex, { animate: false, announce: false });
  }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(alignAfterResize).observe(track);
  else window.addEventListener('resize', alignAfterResize);

  // Preserve the selected slide even when print styles show only the first photo.
  window.addEventListener('beforeprint', () => {
    isPrinting = true;
    window.clearTimeout(settleTimer);
    const first = slides[0];
    if (first) first.inert = false;
  });
  window.addEventListener('afterprint', () => {
    isPrinting = false;
    slides.forEach((slide, index) => { slide.inert = index !== currentIndex; });
    window.requestAnimationFrame(() => {
      trackWidth = track.clientWidth;
      select(currentIndex, { animate: false, announce: false });
    });
  });
  window.addEventListener('pageshow', () => {
    if (!isPrinting) synchronize(nearestIndex());
  });
  window.addEventListener('hashchange', () => {
    const index = photoFragmentIndex();
    if (index >= 0) select(index, { animate: false, reveal: true, announce: false });
  });

  const fragmentIndex = photoFragmentIndex();
  const initialIndex = fragmentIndex >= 0 ? fragmentIndex : nearestIndex();
  synchronize(initialIndex);
  lastAnnounced = initialIndex;
  element.dataset.galleryReady = 'true';
  if (buttons) buttons.hidden = slides.length < 2;
  if (fragmentIndex >= 0) select(fragmentIndex, { animate: false, reveal: true, announce: false });

  return {
    element,
    hasPhoto: id => photoIds.includes(id),
    showPhoto: (id, reveal) => select(photoIds.indexOf(id), { reveal, focus: reveal }),
  };
}

const galleries = [...document.querySelectorAll<HTMLElement>('[data-trip-gallery]')]
  .map(initializeGallery)
  .filter((gallery): gallery is GalleryController => Boolean(gallery));

document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-gallery-select]') : null;
  if (!target || (target instanceof HTMLButtonElement && target.disabled)) return;
  if (target instanceof HTMLAnchorElement && ((target.target && target.target !== '_self') || target.hasAttribute('download'))) return;
  const id = target.dataset.gallerySelect;
  if (!id) return;
  const gallery = galleries.find(item => item.hasPhoto(id));
  if (!gallery) return;
  event.preventDefault();
  gallery.showPhoto(id, !gallery.element.contains(target));
});

export {};
