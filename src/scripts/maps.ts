import 'leaflet/dist/leaflet.css';
import type { TripDestination } from '../data/trips';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function initializeMap(element: HTMLElement) {
  const id = element.dataset.travelMap!;
  const isZh = element.dataset.locale === 'zh-CN';
  const hint = isZh ? '拖动地图探索，点击地点查看详情。' : 'Drag to explore. Choose a stop to take a closer look.';
  const status = document.querySelector<HTMLElement>(`[data-map-status="${id}"]`);
  let destinations: TripDestination[];
  try {
    destinations = JSON.parse(element.dataset.destinations || '[]');
    const route: TripDestination[] = JSON.parse(element.dataset.route || element.dataset.destinations || '[]');
    if (!destinations.length) throw new Error('No destinations');
    const L = await import('leaflet');
    element.replaceChildren();
    const isAtlas = element.dataset.variant === 'atlas';
    const map = L.map(element, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 18,
      zoomSnap: 0.25,
      worldCopyJump: true,
      keyboard: true,
      zoomAnimation: !reducedMotion,
      fadeAnimation: !reducedMotion,
      markerZoomAnimation: !reducedMotion,
    });
    const points: [number, number][] = destinations.map((stop) => [stop.lat, stop.lng]);
    const routePoints: [number, number][] = route.map((stop) => [stop.lat, stop.lng]);
    const bounds = L.latLngBounds(points);
    let selectedMarker: import('leaflet').Marker | undefined;
    const reset = () => {
      selectedMarker?.closeTooltip();
      selectedMarker = undefined;
      const compact = element.clientWidth < 500;
      map.fitBounds(bounds.pad(0.04), { padding: [compact ? 18 : 40, compact ? 50 : 65], maxZoom: 9, animate: !reducedMotion });
      document.querySelectorAll<HTMLButtonElement>(`[data-map-select="${id}"]`).forEach((button) => button.setAttribute('aria-pressed', 'false'));
      if (status) status.textContent = hint;
    };
    reset();

    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: `&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> ${isZh ? '贡献者' : 'contributors'}`,
      maxZoom: 19,
    }).addTo(map);
    let errors = 0;
    tileLayer.on('tileerror', () => {
      if (++errors >= 3 && status) status.textContent = isZh ? '地图底图暂时无法加载，可以通过地点链接查看。' : 'Map tiles are unavailable. The stop list and city links still work.';
    });

    L.polyline(routePoints, { color: '#dd6745', weight: 2.5, opacity: 0.8, dashArray: '5 7', interactive: false }).addTo(map);
    const markers = destinations.map((stop, index) => {
      const label = document.createElement('span');
      label.textContent = stop.name;
      const marker = L.marker([stop.lat, stop.lng], {
        title: stop.name,
        alt: isZh ? `${stop.name}，路线地点 ${index + 1}` : `${stop.name}, route stop ${index + 1}`,
        icon: L.divIcon({
          className: 'travel-marker',
          html: `<span class="marker-core">${index + 1}</span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
      }).addTo(map);
      marker.bindTooltip(label, { direction: 'top', offset: [0, -18], className: 'travel-map-tooltip' });
      marker.on('click', () => select(index));
      return marker;
    });

    function select(index: number) {
      const stop = destinations[index];
      if (!stop) return;
      selectedMarker?.closeTooltip();
      map.flyTo([stop.lat, stop.lng], isAtlas ? 8 : 11, { animate: !reducedMotion, duration: 0.8 });
      markers[index].openTooltip();
      selectedMarker = markers[index];
      document.querySelectorAll<HTMLButtonElement>(`[data-map-select="${id}"]`).forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.stopId === stop.id)));
      if (status) status.textContent = `${stop.name} · ${stop.description}`;
    }

    document.querySelectorAll<HTMLButtonElement>(`[data-map-select="${id}"]`).forEach((button) => {
      button.disabled = false;
      button.addEventListener('click', () => select(destinations.findIndex((stop) => stop.id === button.dataset.stopId)));
    });
    document.querySelector(`[data-map-zoom-in="${id}"]`)?.addEventListener('click', () => map.zoomIn());
    document.querySelector(`[data-map-zoom-out="${id}"]`)?.addEventListener('click', () => map.zoomOut());
    document.querySelector(`[data-map-reset="${id}"]`)?.addEventListener('click', reset);
    document.querySelectorAll<HTMLButtonElement>(`[data-map-zoom-in="${id}"], [data-map-zoom-out="${id}"], [data-map-reset="${id}"]`).forEach(button => { button.disabled = false; });
    new ResizeObserver(() => map.invalidateSize({ animate: false })).observe(element);
  } catch {
    element.replaceChildren();
    const message = document.createElement('p');
    message.className = 'map-fallback';
    message.textContent = isZh ? '地图暂时无法加载，请通过各地点的地图链接查看。' : 'The map couldn’t load. Each stop is still yours to explore using the city links.';
    element.append(message);
    if (status) status.textContent = isZh ? '可使用地点旁的地图链接查看行程路线。' : 'Use the city links to explore the route.';
  }
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      void initializeMap(entry.target as HTMLElement);
    }
  });
}, { rootMargin: '300px' });
document.querySelectorAll<HTMLElement>('[data-travel-map]').forEach((element) => observer.observe(element));
