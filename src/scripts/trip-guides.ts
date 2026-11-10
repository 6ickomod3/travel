type Point = { x: number; y: number };
type ImageView = { zoom: number; centerX: number; centerY: number };
type ViewerSnapshot = { opener: HTMLAnchorElement; view?: ImageView; focus?: HTMLElement };
type Gesture = { points: Point[]; zoom: number; x: number; y: number };

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const midpoint = (first: Point, second: Point): Point => ({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 });
const distance = (first: Point, second: Point) => Math.hypot(first.x - second.x, first.y - second.y);

class GuideImageViewer {
  private readonly stage: HTMLElement;
  private readonly image: HTMLImageElement;
  private readonly zoomOutput: HTMLOutputElement;
  private readonly loading: HTMLElement;
  private readonly zoomIn: HTMLButtonElement;
  private readonly zoomOut: HTMLButtonElement;
  private opener?: HTMLAnchorElement;
  private ready = false;
  private fitScale = 1;
  private zoom = 1;
  private x = 0;
  private y = 0;
  private width = 0;
  private height = 0;
  private pointers = new Map<number, Point>();
  private gesture?: Gesture;
  private pendingView?: ImageView;
  private previousOverflow?: string;
  private skipCloseFocus = false;

  constructor(private readonly dialog: HTMLDialogElement) {
    this.stage = dialog.querySelector<HTMLElement>('[data-guide-stage]')!;
    this.image = dialog.querySelector<HTMLImageElement>('[data-guide-viewer-image]')!;
    this.zoomOutput = dialog.querySelector<HTMLOutputElement>('[data-guide-zoom]')!;
    this.loading = dialog.querySelector<HTMLElement>('[data-guide-loading]')!;
    this.zoomIn = dialog.querySelector<HTMLButtonElement>('[data-guide-zoom-in]')!;
    this.zoomOut = dialog.querySelector<HTMLButtonElement>('[data-guide-zoom-out]')!;

    this.image.addEventListener('load', () => this.loaded());
    this.image.addEventListener('error', () => {
      this.ready = false;
      this.image.hidden = true;
      this.loading.hidden = false;
      this.loading.textContent = this.dialog.lang === 'zh-CN'
        ? '原图暂时无法载入，可使用“查看原图”链接。'
        : 'Image unavailable. Use the Open image link.';
    });
    dialog.querySelector('[data-guide-close]')?.addEventListener('click', () => this.close());
    dialog.addEventListener('cancel', event => { event.preventDefault(); this.close(); });
    dialog.addEventListener('close', () => {
      this.unlockPage();
      this.clearPointers();
      if (!this.skipCloseFocus && this.opener?.isConnected && !this.opener.closest('[hidden], [inert]')) this.opener.focus({ preventScroll: true });
      this.skipCloseFocus = false;
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) this.close();
    });
    this.zoomIn.addEventListener('click', () => this.zoomAt(this.zoom * 1.4));
    this.zoomOut.addEventListener('click', () => this.zoomAt(this.zoom / 1.4));
    dialog.querySelector('[data-guide-reset]')?.addEventListener('click', () => this.fit());

    this.stage.addEventListener('pointerdown', event => {
      if (!this.ready || event.button !== 0) return;
      event.preventDefault();
      this.stage.setPointerCapture(event.pointerId);
      this.pointers.set(event.pointerId, this.localPoint(event));
      this.startGesture();
    });
    this.stage.addEventListener('pointermove', event => {
      if (!this.pointers.has(event.pointerId) || !this.gesture) return;
      event.preventDefault();
      this.pointers.set(event.pointerId, this.localPoint(event));
      const points = [...this.pointers.values()].slice(0, 2);
      const gesture = this.gesture;
      if (points.length === 1 && gesture.points.length === 1) {
        this.x = gesture.x + points[0]!.x - gesture.points[0]!.x;
        this.y = gesture.y + points[0]!.y - gesture.points[0]!.y;
      } else if (points.length === 2 && gesture.points.length === 2) {
        const startDistance = distance(gesture.points[0]!, gesture.points[1]!);
        if (startDistance < 1) return;
        const startCenter = midpoint(gesture.points[0]!, gesture.points[1]!);
        const center = midpoint(points[0]!, points[1]!);
        this.zoom = clamp(gesture.zoom * distance(points[0]!, points[1]!) / startDistance, 1, 8);
        const ratio = this.zoom / gesture.zoom;
        this.x = center.x - (startCenter.x - gesture.x) * ratio;
        this.y = center.y - (startCenter.y - gesture.y) * ratio;
      }
      this.render();
    });
    const endPointer = (event: PointerEvent) => {
      this.pointers.delete(event.pointerId);
      if (this.stage.hasPointerCapture(event.pointerId)) this.stage.releasePointerCapture(event.pointerId);
      this.startGesture();
    };
    this.stage.addEventListener('pointerup', endPointer);
    this.stage.addEventListener('pointercancel', endPointer);
    this.stage.addEventListener('lostpointercapture', event => {
      if (this.pointers.delete(event.pointerId)) this.startGesture();
    });
    this.stage.addEventListener('wheel', event => {
      if (!this.ready || !dialog.open) return;
      event.preventDefault();
      const point = this.localPoint(event);
      this.zoomAt(this.zoom * Math.exp(-event.deltaY * .002), point);
    }, { passive: false });
    this.stage.addEventListener('keydown', event => {
      if (!this.ready) return;
      if (event.key === '+' || event.key === '=') this.zoomAt(this.zoom * 1.4);
      else if (event.key === '-' || event.key === '_') this.zoomAt(this.zoom / 1.4);
      else if (event.key === '0' || event.key === 'Home') this.fit();
      else if (event.key === 'ArrowLeft') { this.x += event.shiftKey ? 100 : 40; this.render(); }
      else if (event.key === 'ArrowRight') { this.x -= event.shiftKey ? 100 : 40; this.render(); }
      else if (event.key === 'ArrowUp') { this.y += event.shiftKey ? 100 : 40; this.render(); }
      else if (event.key === 'ArrowDown') { this.y -= event.shiftKey ? 100 : 40; this.render(); }
      else return;
      event.preventDefault();
      event.stopPropagation();
    });
    const resize = () => {
      if (dialog.open && this.ready && (this.width !== this.stage.clientWidth || this.height !== this.stage.clientHeight)) this.fit(this.view());
    };
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(this.stage);
    else window.addEventListener('resize', resize);
  }

  open(opener: HTMLAnchorElement, view?: ImageView): boolean {
    if (typeof this.dialog.showModal !== 'function') return false;
    this.opener = opener;
    this.pendingView = view;
    this.dialog.querySelector<HTMLElement>('[data-guide-viewer-title]')!.textContent = opener.dataset.guideTitle ?? '';
    this.dialog.querySelector<HTMLElement>('[data-guide-viewer-caption]')!.textContent = opener.dataset.guideCaption ?? '';
    const original = this.dialog.querySelector<HTMLAnchorElement>('[data-guide-original]')!;
    original.href = opener.href;
    this.image.alt = opener.dataset.guideAlt ?? opener.dataset.guideTitle ?? '';
    const changed = this.image.src !== opener.href;
    if (changed) {
      this.ready = false;
      this.image.hidden = true;
      this.loading.hidden = false;
      this.loading.textContent = this.dialog.lang === 'zh-CN' ? '正在载入原图…' : 'Loading image…';
      this.image.src = opener.href;
    }
    this.clearPointers();
    if (!this.dialog.open) this.dialog.showModal();
    this.lockPage();
    if (this.image.complete && this.image.naturalWidth > 0) this.loaded();
    return true;
  }

  private loaded() {
    this.ready = true;
    this.image.style.width = `${this.image.naturalWidth}px`;
    this.image.style.height = `${this.image.naturalHeight}px`;
    this.image.hidden = false;
    this.loading.hidden = true;
    if (!this.dialog.open) return;
    this.fit(this.pendingView);
    this.pendingView = undefined;
  }

  private fit(view?: ImageView) {
    if (!this.ready) return;
    this.clearPointers();
    this.width = this.stage.clientWidth;
    this.height = this.stage.clientHeight;
    if (!this.width || !this.height) return;
    this.fitScale = Math.min(this.width / this.image.naturalWidth, this.height / this.image.naturalHeight, 1);
    this.zoom = view ? clamp(view.zoom, 1, 8) : 1;
    const scale = this.fitScale * this.zoom;
    this.x = this.width / 2 - (view?.centerX ?? this.image.naturalWidth / 2) * scale;
    this.y = this.height / 2 - (view?.centerY ?? this.image.naturalHeight / 2) * scale;
    this.render();
  }

  private view(): ImageView {
    const scale = this.fitScale * this.zoom;
    return { zoom: this.zoom, centerX: (this.width / 2 - this.x) / scale, centerY: (this.height / 2 - this.y) / scale };
  }

  private zoomAt(nextZoom: number, point: Point = { x: this.width / 2, y: this.height / 2 }) {
    if (!this.ready) return;
    const next = clamp(nextZoom, 1, 8);
    const ratio = next / this.zoom;
    this.x = point.x - (point.x - this.x) * ratio;
    this.y = point.y - (point.y - this.y) * ratio;
    this.zoom = next;
    this.render();
    this.startGesture();
  }

  private render() {
    const scale = this.fitScale * this.zoom;
    const imageWidth = this.image.naturalWidth * scale;
    const imageHeight = this.image.naturalHeight * scale;
    this.x = imageWidth <= this.width ? (this.width - imageWidth) / 2 : clamp(this.x, this.width - imageWidth, 0);
    this.y = imageHeight <= this.height ? (this.height - imageHeight) / 2 : clamp(this.y, this.height - imageHeight, 0);
    this.image.style.transform = `translate(${this.x}px, ${this.y}px) scale(${scale})`;
    this.zoomOutput.value = `${Math.round(this.zoom * 100)}%`;
    this.zoomIn.disabled = this.zoom >= 8;
    this.zoomOut.disabled = this.zoom <= 1;
  }

  private localPoint(event: MouseEvent): Point {
    const bounds = this.stage.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  private startGesture() {
    const points = [...this.pointers.values()].slice(0, 2);
    this.gesture = points.length ? { points, zoom: this.zoom, x: this.x, y: this.y } : undefined;
    this.stage.dataset.dragging = String(points.length > 0);
  }

  private clearPointers() {
    this.pointers.clear();
    this.gesture = undefined;
    this.stage.dataset.dragging = 'false';
  }

  private lockPage() {
    if (this.previousOverflow !== undefined) return;
    this.previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }

  private unlockPage() {
    if (this.previousOverflow === undefined) return;
    document.documentElement.style.overflow = this.previousOverflow;
    this.previousOverflow = undefined;
  }

  private close() {
    this.unlockPage();
    this.clearPointers();
    this.dialog.close();
  }

  beforePrint(): ViewerSnapshot | undefined {
    if (!this.dialog.open || !this.opener) return;
    const focus = document.activeElement instanceof HTMLElement && this.dialog.contains(document.activeElement)
      ? document.activeElement : undefined;
    const snapshot = { opener: this.opener, view: this.ready ? this.view() : undefined, focus };
    this.skipCloseFocus = true;
    this.close();
    return snapshot;
  }
}

let guidePrinting = false;
const guidePrintMedia = window.matchMedia('print');
const panelControllers = new Map<HTMLElement, { select: (id: string) => void }>();
const figureControllers = new Map<HTMLElement, { select: (id: string) => void; refresh: () => void }>();
const switches = [...document.querySelectorAll<HTMLElement>('[data-guide-switch]')];
switches.forEach(root => {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>(':scope > [data-guide-tabs] > [data-guide-tab]')];
  const panels = [...root.querySelectorAll<HTMLElement>(':scope > [data-guide-panel]')];
  const select = (id: string) => {
    if (!panels.some(panel => panel.dataset.guidePanel === id)) return;
    root.dataset.guideActive = id;
    panels.forEach(panel => { panel.hidden = panel.dataset.guidePanel !== id; });
    buttons.forEach(button => {
      const active = button.dataset.guideTab === id;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
  };
  panelControllers.set(root, { select });
  buttons.forEach((button, index) => {
    button.disabled = false;
    button.addEventListener('click', () => select(button.dataset.guideTab!));
    button.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowLeft') next = Math.max(0, index - 1);
      else if (event.key === 'ArrowRight') next = Math.min(buttons.length - 1, index + 1);
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      event.stopPropagation();
      const nextButton = buttons[next];
      if (nextButton) { select(nextButton.dataset.guideTab!); nextButton.focus({ preventScroll: true }); }
    });
  });
  const initial = root.dataset.guideDefault;
  select(panels.some(panel => panel.dataset.guidePanel === initial) ? initial! : panels[0]!.dataset.guidePanel!);
  const tabs = root.querySelector<HTMLElement>('[data-guide-tabs]');
  if (tabs) tabs.hidden = false;
});

const mobileFigures = window.matchMedia('(max-width: 700px)');
document.querySelectorAll<HTMLElement>('[data-guide-figure-switch]').forEach(root => {
  const controls = root.querySelector<HTMLElement>('[data-guide-figure-controls]');
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-guide-figure-select]')];
  const figures = [...root.querySelectorAll<HTMLElement>('[data-guide-figure]')];
  if (!figures.length) return;
  let selected = figures.find(figure => figure.dataset.guideFigure === root.dataset.guideFigureDefault)?.dataset.guideFigure
    ?? figures[0]!.dataset.guideFigure!;

  const scrollChoiceIntoView = () => {
    const button = buttons.find(item => item.dataset.guideFigureSelect === selected);
    if (!controls || controls.hidden || !button || !controls.clientWidth) return;
    const left = button.getBoundingClientRect().left - controls.getBoundingClientRect().left + controls.scrollLeft;
    const right = left + button.offsetWidth;
    if (left < controls.scrollLeft) controls.scrollLeft = left;
    else if (right > controls.scrollLeft + controls.clientWidth) controls.scrollLeft = right - controls.clientWidth;
  };
  const refresh = () => {
    if (guidePrinting || guidePrintMedia.matches) return;
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    root.dataset.guideFigureActive = selected;
    figures.forEach(figure => { figure.hidden = mobileFigures.matches && figure.dataset.guideFigure !== selected; });
    buttons.forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.guideFigureSelect === selected)); });
    if (controls) controls.hidden = !mobileFigures.matches || buttons.length < 2;
    if (active && root.contains(active)) {
      if (mobileFigures.matches && active.closest('[data-guide-figure][hidden]')) buttons.find(button => button.dataset.guideFigureSelect === selected)?.focus({ preventScroll: true });
      else if (!mobileFigures.matches && controls?.contains(active)) figures.find(figure => figure.dataset.guideFigure === selected)?.querySelector<HTMLAnchorElement>('[data-guide-open]')?.focus({ preventScroll: true });
    }
    scrollChoiceIntoView();
  };
  const select = (id: string) => {
    if (!figures.some(figure => figure.dataset.guideFigure === id)) return;
    selected = id;
    refresh();
  };
  figureControllers.set(root, { select, refresh });
  buttons.forEach((button, index) => {
    button.disabled = false;
    button.addEventListener('click', () => select(button.dataset.guideFigureSelect!));
    button.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowLeft') next = Math.max(0, index - 1);
      else if (event.key === 'ArrowRight') next = Math.min(buttons.length - 1, index + 1);
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      event.stopPropagation();
      const nextButton = buttons[next];
      if (nextButton) { select(nextButton.dataset.guideFigureSelect!); nextButton.focus({ preventScroll: true }); }
    });
  });
  refresh();
});
mobileFigures.addEventListener('change', () => figureControllers.forEach(controller => controller.refresh()));

export function revealGuideTarget(target: HTMLElement): void {
  if (guidePrinting || guidePrintMedia.matches) return;
  const panel = target.closest<HTMLElement>('[data-guide-panel]');
  const panelRoot = panel?.closest<HTMLElement>('[data-guide-switch]');
  if (panel && panelRoot && panel.dataset.guidePanel) panelControllers.get(panelRoot)?.select(panel.dataset.guidePanel);
  const figure = target.closest<HTMLElement>('[data-guide-figure]');
  const figureRoot = figure?.closest<HTMLElement>('[data-guide-figure-switch]');
  if (figure && figureRoot && figure.dataset.guideFigure) figureControllers.get(figureRoot)?.select(figure.dataset.guideFigure);
}

const dialog = document.querySelector<HTMLDialogElement>('[data-guide-viewer]');
const viewer = dialog ? new GuideImageViewer(dialog) : undefined;
document.addEventListener('click', event => {
  if (!viewer || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-guide-open]') : null;
  if (link) {
    revealGuideTarget(link);
    if (viewer.open(link)) event.preventDefault();
  }
});

let printSnapshot: {
  panels: Array<{ panel: HTMLElement; hidden: boolean }>;
  figures: Array<{ figure: HTMLElement; hidden: boolean }>;
  details: Array<{ detail: HTMLDetailsElement; open: boolean }>;
  images: Array<{ image: HTMLImageElement; loading: string | null }>;
  viewer?: ViewerSnapshot;
} | undefined;

window.addEventListener('beforeprint', () => {
  if (printSnapshot) return;
  guidePrinting = true;
  const panels = [...document.querySelectorAll<HTMLElement>('[data-guide-panel]')];
  const figures = [...document.querySelectorAll<HTMLElement>('[data-guide-figure]')];
  const details = [...document.querySelectorAll<HTMLDetailsElement>('[data-guide-details]')];
  const images = [...document.querySelectorAll<HTMLImageElement>('[data-trip-day-guide] img')];
  printSnapshot = {
    panels: panels.map(panel => ({ panel, hidden: panel.hidden })),
    figures: figures.map(figure => ({ figure, hidden: figure.hidden })),
    details: details.map(detail => ({ detail, open: detail.open })),
    images: images.map(image => ({ image, loading: image.getAttribute('loading') })),
    viewer: viewer?.beforePrint(),
  };
  panels.forEach(panel => { panel.hidden = false; });
  figures.forEach(figure => { figure.hidden = false; });
  details.forEach(detail => { detail.open = true; });
  images.forEach(image => { image.loading = 'eager'; });
});

window.addEventListener('afterprint', () => {
  if (!printSnapshot) return;
  const snapshot = printSnapshot;
  printSnapshot = undefined;
  guidePrinting = false;
  snapshot.panels.forEach(({ panel, hidden }) => { panel.hidden = hidden; });
  snapshot.figures.forEach(({ figure, hidden }) => { figure.hidden = hidden; });
  snapshot.details.forEach(({ detail, open }) => { detail.open = open; });
  snapshot.images.forEach(({ image, loading }) => {
    if (loading === null) image.removeAttribute('loading');
    else image.setAttribute('loading', loading);
  });
  if (snapshot.viewer) {
    const saved = snapshot.viewer;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      if (saved.opener.isConnected && viewer?.open(saved.opener, saved.view)) {
        if (saved.focus?.isConnected && !saved.focus.closest('[hidden], [inert]')) saved.focus.focus({ preventScroll: true });
      }
    }));
  }
  window.requestAnimationFrame(() => figureControllers.forEach(controller => controller.refresh()));
});

export {};
