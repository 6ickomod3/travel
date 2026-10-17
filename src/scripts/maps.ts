import 'leaflet/dist/leaflet.css';
import type { TripDestination } from '../data/trips';
import type { VisitedLocation } from '../lib/trips';
import { withBase } from '../lib/urls';
import { distinctLocalName } from '../lib/place-names';

type MapDestination = TripDestination | VisitedLocation;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function appendLocalName(element: HTMLElement, stop: MapDestination) {
  const localName = distinctLocalName(stop.name, stop.localName);
  if (!localName) return;
  const label = document.createElement('span');
  label.className = 'local-place-name';
  label.lang = localName.language;
  label.dir = 'auto';
  label.dataset.localPlaceName = '';
  label.textContent = localName.text;
  element.append(label);
}

async function initializeMap(element: HTMLElement) {
  const id = element.dataset.travelMap!;
  const isZh = element.dataset.locale === 'zh-CN';
  const isVisited = element.dataset.mode === 'visited';
  const hint = isVisited
    ? isZh ? '点击地点查看相关旅行。' : 'Select a place to view its trips.'
    : isZh ? '拖动地图，点击地点查看详情。' : 'Drag the map. Select a destination for details.';
  const status = document.querySelector<HTMLElement>(`[data-map-status="${id}"]`);
  let destinations: MapDestination[];
  try {
    destinations = JSON.parse(element.dataset.destinations || '[]');
    const route: MapDestination[] = isVisited ? [] : JSON.parse(element.dataset.route || element.dataset.destinations || '[]');
    if (!destinations.length) throw new Error('No destinations');
    const L = await import('leaflet');
    element.replaceChildren();
    const isAtlas = element.dataset.variant === 'atlas';
    const map = L.map(element, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      minZoom: isVisited ? 0 : 2,
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
      if (isVisited) selectedMarker?.closePopup();
      selectedMarker = undefined;
      const compact = element.clientWidth < 500;
      const firstPoint = points[0];
      if (isVisited && points.length === 1 && firstPoint) {
        map.setView(firstPoint, 5, { animate: !reducedMotion });
      } else {
        map.fitBounds(bounds.pad(isVisited ? 0.06 : 0.04), { padding: [compact ? 18 : 40, compact ? 50 : 65], maxZoom: isVisited ? 7 : 9, animate: !reducedMotion });
      }
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
      if (++errors >= 3 && status) status.textContent = isVisited
        ? isZh ? '地图底图暂时无法加载，地点列表中的旅行链接仍可使用。' : 'Map tiles are unavailable. Trip links still work.'
        : isZh ? '地图底图暂时无法加载，可以通过地点链接查看。' : 'Map tiles are unavailable. The stop list and city links still work.';
    });

    if (!isVisited) L.polyline(routePoints, { color: '#dd6745', weight: 2.5, opacity: 0.8, dashArray: '5 7', interactive: false }).addTo(map);
    const markers = destinations.map((stop, index) => {
      const label = document.createElement('span');
      label.textContent = stop.name;
      appendLocalName(label, stop);
      const localName = distinctLocalName(stop.name, stop.localName);
      const title = localName ? `${stop.name} · ${localName.text}` : stop.name;
      const marker = L.marker([stop.lat, stop.lng], {
        title,
        alt: isVisited
          ? isZh ? `${title}，已到访地点` : `${title}, visited place`
          : isZh ? `${title}，路线地点 ${index + 1}` : `${title}, route stop ${index + 1}`,
        icon: L.divIcon({
          className: isVisited ? 'travel-marker travel-marker-visited' : 'travel-marker',
          html: isVisited ? '<span class="marker-core"><span class="visited-marker-dot" aria-hidden="true"></span></span>' : `<span class="marker-core">${index + 1}</span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
      }).addTo(map);
      marker.bindTooltip(label, { direction: 'top', offset: [0, -18], className: 'travel-map-tooltip' });
      if (isVisited && 'trips' in stop) {
        const popup = document.createElement('div');
        popup.className = 'visited-map-popup';
        const name = document.createElement('strong');
        name.textContent = stop.name;
        const country = document.createElement('p');
        country.className = 'visited-popup-country';
        country.textContent = stop.country;
        const trips = document.createElement('ul');
        stop.trips.forEach((trip) => {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = withBase(`trips/${trip.slug}/`);
          link.textContent = trip.title;
          item.append(link);
          trips.append(item);
        });
        popup.append(name);
        appendLocalName(popup, stop);
        popup.append(country, trips);
        marker.bindPopup(popup, { minWidth: 180, maxWidth: 280 });
      }
      marker.on('click', () => select(index));
      return marker;
    });

    function select(index: number) {
      const stop = destinations[index];
      const marker = markers[index];
      if (!stop || !marker) return;
      selectedMarker?.closeTooltip();
      if (isVisited) selectedMarker?.closePopup();
      map.flyTo([stop.lat, stop.lng], isAtlas ? 8 : 11, { animate: !reducedMotion, duration: 0.8 });
      if (isVisited) marker.openPopup();
      else marker.openTooltip();
      selectedMarker = marker;
      document.querySelectorAll<HTMLButtonElement>(`[data-map-select="${id}"]`).forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.stopId === stop.id)));
      if (status) status.textContent = isVisited && 'country' in stop
        ? `${stop.name} · ${stop.country}`
        : 'description' in stop ? `${stop.name} · ${stop.description}` : stop.name;
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
    message.textContent = isVisited
      ? isZh ? '地图暂时无法加载，请使用地点列表中的旅行链接。' : 'Map unavailable. Use the trip links in the place list.'
      : isZh ? '地图暂时无法加载，请通过各地点的地图链接查看。' : 'Map unavailable. Use the destination links to open Google Maps.';
    element.append(message);
    if (status) status.textContent = isVisited
      ? isZh ? '地点列表中的旅行链接仍可使用。' : 'Trip links are available in the place list.'
      : isZh ? '可使用地点旁的地图链接查看行程路线。' : 'Use the destination links to view the route.';
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
