import 'leaflet/dist/leaflet.css';
import type { LayerGroup, Map as LeafletMap, Marker } from 'leaflet';
import type { ResolvedDayMap, ResolvedMapView, ResolvedMapStop } from '../lib/trip-maps';
import { distinctLocalName } from '../lib/place-names';

type Leaflet = typeof import('leaflet');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const printMedia = window.matchMedia('print');
let printing = printMedia.matches;
let restoringPrint = false;
let leaflet: Promise<Leaflet> | undefined;

function localName(element: HTMLElement, stop: ResolvedMapStop) {
  const name = distinctLocalName(stop.place.name, stop.place.localName);
  if (!name) return;
  const label = document.createElement('span');
  label.className = 'local-place-name';
  label.lang = name.language;
  label.dir = 'auto';
  label.textContent = name.text;
  element.append(label);
}

class DailyMap {
  readonly root: HTMLElement;
  readonly canvas: HTMLElement;
  readonly config: ResolvedDayMap;
  readonly isZh: boolean;
  private map?: LeafletMap;
  private layers?: LayerGroup;
  private library?: Leaflet;
  private markers = new Map<string, Marker>();
  private loading?: Promise<void>;
  private failed = false;
  private inViewport = false;
  private activeViewId: string;
  private selectedStop?: number;
  private tileErrors = 0;
  private interactive = false;
  private readonly needsActivation = window.matchMedia('(any-pointer: coarse)').matches || navigator.maxTouchPoints > 0;

  constructor(root: HTMLElement) {
    this.root = root;
    this.canvas = root.querySelector<HTMLElement>('[data-travel-map]')!;
    this.config = JSON.parse(root.dataset.dayMapConfig || '{}');
    this.isZh = root.lang === 'zh-CN';
    this.activeViewId = this.config.defaultViewId;
    this.interactive = !this.needsActivation;
    root.dataset.mapInteractive = String(this.interactive);
    root.dataset.dayMapView = this.activeViewId;
    root.dataset.dayMapState = 'idle';
    const interact = root.querySelector<HTMLButtonElement>('[data-map-interact]');
    if (interact) {
      interact.hidden = !this.needsActivation;
      interact.disabled = false;
      interact.addEventListener('click', () => {
        this.interactive = !this.interactive;
        this.updateInteraction();
        void this.ensureMap();
      });
    }
    root.querySelectorAll<HTMLButtonElement>('[data-day-map-view]').forEach(button => {
      button.disabled = false;
      button.addEventListener('click', () => this.selectView(button.dataset.dayMapView!));
    });
    root.querySelectorAll<HTMLButtonElement>('[data-day-map-stop]').forEach(button => {
      button.disabled = false;
      button.addEventListener('click', () => {
        const viewId = button.dataset.dayMapStopView!;
        const index = Number(button.dataset.dayMapStop);
        if (viewId !== this.activeViewId) this.selectView(viewId);
        this.selectStop(index);
      });
    });
    root.querySelector('[data-map-reset]')?.addEventListener('click', () => this.drawView());
    root.querySelector('[data-map-zoom-in]')?.addEventListener('click', () => this.map?.zoomIn());
    root.querySelector('[data-map-zoom-out]')?.addEventListener('click', () => this.map?.zoomOut());
    this.updateInteraction();
  }

  private text(zh: string, en: string): string { return this.isZh ? zh : en; }
  private view(): ResolvedMapView { return this.config.views.find(view => view.id === this.activeViewId)!; }

  private eligible(): boolean {
    if (printing || restoringPrint || printMedia.matches || !this.inViewport || !this.root.isConnected
      || this.root.closest('[hidden], [data-itinerary-printing="true"]') || document.visibilityState === 'hidden') return false;
    for (let ancestor: Element | null = this.root.parentElement; ancestor; ancestor = ancestor.parentElement) {
      if (ancestor instanceof HTMLDetailsElement && !ancestor.open) return false;
    }
    return this.canvas.getBoundingClientRect().width > 0 && this.canvas.getBoundingClientRect().height > 0;
  }

  setVisible(visible: boolean) {
    this.inViewport = visible;
    this.refresh();
  }

  refresh() {
    if (!this.eligible()) { this.map?.stop(); return; }
    if (this.map) this.map.invalidateSize({ animate: false, pan: false });
    else void this.ensureMap();
  }

  private async ensureMap(): Promise<void> {
    if (this.map || this.loading || this.failed || !this.eligible()) return this.loading;
    this.root.dataset.dayMapState = 'loading';
    this.loading = this.mount().catch(() => {
      this.failed = true;
      this.root.dataset.dayMapState = 'unavailable';
      this.map?.remove();
      this.map = undefined;
      this.canvas.replaceChildren();
      const message = document.createElement('p');
      message.className = 'map-fallback';
      message.textContent = this.text('地图暂时无法加载，可使用下方地点列表和地图链接。', 'Map unavailable. Use the stop list and map links below.');
      this.canvas.append(message);
      this.status(this.text('地点列表和地图链接仍可使用。', 'The stop list and map links remain available.'));
    }).finally(() => { this.loading = undefined; });
    return this.loading;
  }

  private async mount() {
    const L = await (leaflet ??= import('leaflet'));
    // A date can become hidden while the shared map module is being downloaded.
    if (!this.eligible()) { this.root.dataset.dayMapState = 'idle'; return; }
    this.library = L;
    this.canvas.replaceChildren();
    this.map = L.map(this.canvas, {
      zoomControl: false, attributionControl: true, scrollWheelZoom: false,
      dragging: this.interactive, touchZoom: this.interactive, doubleClickZoom: this.interactive,
      boxZoom: this.interactive, keyboard: true, tapHold: false,
      minZoom: 2, maxZoom: 18, zoomSnap: 0.25,
      zoomAnimation: !reducedMotion, fadeAnimation: !reducedMotion, markerZoomAnimation: !reducedMotion,
    });
    this.layers = L.layerGroup().addTo(this.map);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: `&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> ${this.text('贡献者', 'contributors')}`,
    }).addTo(this.map);
    tiles.on('tileerror', () => {
      if (++this.tileErrors >= 3) this.status(this.text('底图暂时无法加载，地点和地图链接仍可使用。', 'Map tiles are unavailable. Stops and map links still work.'));
    });
    this.drawView(true);
    this.root.querySelectorAll<HTMLButtonElement>('[data-map-reset], [data-map-zoom-in], [data-map-zoom-out]').forEach(button => { button.disabled = false; });
    this.root.dataset.dayMapState = 'ready';
    new ResizeObserver(() => { if (this.eligible()) this.map?.invalidateSize({ animate: false, pan: false }); }).observe(this.canvas);
    this.updateInteraction();
  }

  private selectView(id: string) {
    if (!this.config.views.some(view => view.id === id)) return;
    this.activeViewId = id;
    this.selectedStop = undefined;
    this.root.dataset.dayMapView = id;
    this.root.querySelectorAll<HTMLElement>('[data-day-map-panel]').forEach(panel => { panel.hidden = panel.dataset.dayMapPanel !== id; });
    this.root.querySelectorAll<HTMLButtonElement>('[data-day-map-view]').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.dayMapView === id)); });
    this.drawView();
    void this.ensureMap();
  }

  private drawView(restoreSelection = false) {
    const L = this.library;
    if (!this.map || !this.layers || !L) return;
    const selected = restoreSelection ? this.selectedStop : undefined;
    this.selectedStop = undefined;
    this.map.stop();
    this.map.closePopup();
    this.layers.clearLayers();
    this.markers.clear();
    const view = this.view();
    {
      const groups = new Map<string, Array<{ stop: ResolvedMapStop; index: number }>>();
      view.stops.forEach((stop, index) => { const visits = groups.get(stop.placeId) ?? []; visits.push({ stop, index }); groups.set(stop.placeId, visits); });
      for (const [placeId, visits] of groups) {
        const first = visits[0]!;
        const numbers = visits.map(visit => visit.index + 1).join('·');
        const core = document.createElement('span');
        core.className = 'marker-core';
        core.textContent = numbers;
        const native = distinctLocalName(first.stop.place.name, first.stop.place.localName);
        const title = `${first.stop.place.name}${native ? ` · ${native.text}` : ''} · ${numbers}`;
        const optional = visits.every(visit => visit.stop.optional);
        const marker = L.marker([first.stop.place.lat, first.stop.place.lng], {
          title, keyboard: true,
          icon: L.divIcon({ className: `travel-marker day-map-marker${optional ? ' day-map-marker-optional' : ''}`, html: core, iconSize: [30, 30], iconAnchor: [15, 15] }),
        }).addTo(this.layers);
        marker.getElement()?.setAttribute('aria-label', title);
        marker.bindPopup(this.popup(visits), { minWidth: 160, maxWidth: Math.min(280, Math.max(160, this.canvas.clientWidth - 56)), autoPanPadding: [12, 12] });
        marker.on('click', () => this.selectStop(first.index));
        this.markers.set(placeId, marker);
      }
      const sequence = view.stops.filter(stop => !stop.optional && stop.connect !== false).map(stop => [stop.place.lat, stop.place.lng] as [number, number]);
      if (view.track) L.polyline(view.track.coordinates, { color: '#365743', weight: 3, opacity: .85, interactive: false }).addTo(this.layers);
      else if (sequence.length > 1) L.polyline(sequence, { color: '#b94628', weight: 2.5, opacity: .75, dashArray: '5 7', interactive: false }).addTo(this.layers);
      const points = view.stops.map(stop => [stop.place.lat, stop.place.lng] as [number, number]);
      const compact = this.canvas.clientWidth < 500;
      if (points.length === 1) this.map.setView(points[0]!, view.scope === 'transport' ? 13 : 16, { animate: false });
      else this.map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [compact ? 22 : 32, 24], paddingBottomRight: [compact ? 40 : 50, 28], maxZoom: view.scope === 'transport' ? 15 : 16, animate: false });
      this.root.querySelectorAll<HTMLButtonElement>('[data-day-map-stop]').forEach(button => { button.setAttribute('aria-pressed', 'false'); });
      this.status(this.tileErrors >= 3 ? this.text('底图暂时无法加载，地点和地图链接仍可使用。', 'Map tiles are unavailable. Stops and map links still work.')
        : `${view.label} · ${view.stops.length} ${this.text('个地点', 'stops')}`);
      if (selected !== undefined && view.id === this.activeViewId) this.selectStop(selected);
    }
  }

  private selectStop(index: number) {
    const stop = this.view().stops[index];
    if (!stop) return;
    this.selectedStop = index;
    this.root.querySelectorAll<HTMLButtonElement>('[data-day-map-stop]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.dayMapStopView === this.activeViewId && Number(button.dataset.dayMapStop) === index));
    });
    const marker = this.markers.get(stop.placeId);
    if (this.map && marker) {
      this.map.flyTo([stop.place.lat, stop.place.lng], Math.max(this.map.getZoom(), this.view().scope === 'transport' ? 14 : 16), { animate: !reducedMotion, duration: .4 });
      marker.openPopup();
    } else void this.ensureMap();
    this.status(`${index + 1} · ${stop.place.name}${stop.optional ? this.text(' · 可选', ' · Optional') : ''}`);
  }

  private popup(visits: Array<{ stop: ResolvedMapStop; index: number }>): HTMLElement {
    const first = visits[0]!.stop;
    const popup = document.createElement('div');
    popup.className = 'day-map-popup';
    const title = document.createElement('strong');
    title.textContent = first.place.name;
    popup.append(title);
    localName(popup, first);
    visits.forEach(({ stop, index }) => {
      const visit = document.createElement('p');
      visit.className = 'day-map-popup-visit';
      if (stop.scheduleHref) {
        const link = document.createElement('a');
        link.href = stop.scheduleHref;
        link.textContent = this.text(`第${index + 1}站 · 查看行程`, `Stop ${index + 1} · View schedule`);
        visit.append(link);
      } else visit.textContent = this.text(`第${index + 1}站`, `Stop ${index + 1}`);
      if (stop.optional) visit.append(this.text(' · 可选', ' · Optional'));
      popup.append(visit);
      if (stop.note) { const note = document.createElement('p'); note.textContent = stop.note; popup.append(note); }
    });
    if (first.place.coordinateNote) { const note = document.createElement('p'); note.textContent = first.place.coordinateNote; popup.append(note); }
    const links = document.createElement('div');
    links.className = 'day-map-popup-links';
    for (const [label, href] of [
      ['Google Maps', `https://www.google.com/maps/search/?api=1&query=${first.place.lat},${first.place.lng}`],
      ['Apple Maps', `https://maps.apple.com/?ll=${first.place.lat},${first.place.lng}&q=${encodeURIComponent(first.place.localName?.text ?? first.place.name)}`],
      [this.text('位置来源', 'Location source'), first.place.coordinateSource.url],
    ]) {
      const link = document.createElement('a');
      link.href = href!;
      link.textContent = label!;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      links.append(link);
    }
    popup.append(links);
    return popup;
  }

  private updateInteraction() {
    this.root.dataset.mapInteractive = String(this.interactive);
    const button = this.root.querySelector<HTMLButtonElement>('[data-map-interact]');
    if (button) {
      button.setAttribute('aria-pressed', String(this.interactive));
      button.textContent = this.interactive ? this.text('结束地图操作', 'Done with map') : this.text('操作地图', 'Explore map');
    }
    for (const handler of [this.map?.dragging, this.map?.touchZoom, this.map?.doubleClickZoom, this.map?.boxZoom]) {
      if (this.interactive) handler?.enable(); else handler?.disable();
    }
    this.map?.scrollWheelZoom.disable();
  }

  private status(message: string) { const status = this.root.querySelector<HTMLElement>('[data-map-status]'); if (status) status.textContent = message; }
}

const controllers = new Map<HTMLElement, DailyMap>();
document.querySelectorAll<HTMLElement>('[data-day-map]').forEach(root => {
  try { controllers.set(root, new DailyMap(root)); }
  catch { root.dataset.dayMapState = 'unavailable'; }
});

if (controllers.size) {
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => controllers.get(entry.target as HTMLElement)?.setVisible(entry.isIntersecting)); });
  for (const root of controllers.keys()) observer.observe(root);
  const refresh = () => controllers.forEach(controller => controller.refresh());
  const mutations = new MutationObserver(refresh);
  document.querySelectorAll<HTMLElement>('[data-trip-itinerary], .itinerary-day').forEach(element => mutations.observe(element, { attributes: true, attributeFilter: ['open', 'hidden', 'data-itinerary-printing'] }));
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pageshow', refresh);
  window.addEventListener('beforeprint', () => { printing = true; refresh(); });
  window.addEventListener('afterprint', () => {
    printing = false;
    restoringPrint = true;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => { restoringPrint = false; refresh(); }));
  });
  printMedia.addEventListener('change', event => { printing = event.matches; refresh(); });
}
