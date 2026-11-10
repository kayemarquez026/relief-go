export interface MapPoint {
  lat: number;
  lng: number;
}

export type LeafletMap = any;

let loader: Promise<any> | null = null;

export async function loadLeaflet(): Promise<any> {
  if ((window as any).L) {
    return (window as any).L;
  }

  if (loader) {
    return loader;
  }

  loader = new Promise((resolve, reject) => {
    if (!document.querySelector('#rg-leaflet-css')) {
      const css = document.createElement('link');

      css.id = 'rg-leaflet-css';
      css.rel = 'stylesheet';
      css.href =
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

      css.integrity =
        'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';

      css.crossOrigin = 'anonymous';

      document.head.appendChild(css);
    }

    const script = document.createElement('script');

    script.src =
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

    script.integrity =
      'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';

    script.crossOrigin = 'anonymous';
    script.async = true;

    script.onload = () => {
      resolve((window as any).L);
    };

    script.onerror = () => {
      loader = null;

      reject(
        new Error(
          'Map library could not load. Check your internet connection.'
        )
      );
    };

    document.head.appendChild(script);
  });

  return loader;
}

export function addTiles(L: any, map: any): void {
  L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,

      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
    }
  ).addTo(map);
}

export function validPoint(
  lat: number | null | undefined,
  lng: number | null | undefined
): boolean {
  return (
    lat != null &&
    lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}