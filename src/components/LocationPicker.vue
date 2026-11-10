<template>
  <div class="location-picker">

    <p class="label">
      Pin the exact event/campaign location
      (required for GPS attendance proof).
    </p>

    <div
      ref="mapEl"
      class="map"
      role="application"
      aria-label="Select location on interactive map"
    ></div>

    <p v-if="modelValue" class="coords">
      📍
      {{ modelValue.lat.toFixed(6) }},
      {{ modelValue.lng.toFixed(6) }}
    </p>

    <p v-else class="coords">
      Tap the map or use your current location to set the pin.
    </p>

    <div class="buttons">

      <ion-button
        size="small"
        fill="outline"
        @click="useMyLocation"
      >
        Use my current location
      </ion-button>

      <ion-button
        size="small"
        fill="clear"
        color="danger"
        :disabled="!modelValue"
        @click="clearPin"
      >
        Clear pin
      </ion-button>

    </div>

    <p v-if="message" class="coords">
      {{ message }}
    </p>

  </div>
</template>

<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';

import { IonButton } from '@ionic/vue';

import {
  loadLeaflet,
  addTiles,
} from '../services/osmMap';

import type { MapPoint } from '../services/osmMap';

const props = defineProps<{
  modelValue: MapPoint | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: MapPoint | null): void;
}>();

const mapEl = ref<HTMLElement | null>(null);
const message = ref('');

let map: any = null;
let marker: any = null;
let L: any = null;

function showPin(point: MapPoint | null) {
  if (!map || !L) {
    return;
  }

  if (marker) {
    map.removeLayer(marker);
    marker = null;
  }

  if (point) {
    marker = L.circleMarker(
      [point.lat, point.lng],
      {
        radius: 9,
        color: '#143b2b',
        fillColor: '#f3b75d',
        fillOpacity: 1,
      }
    ).addTo(map);
  }
}

function setPin(point: MapPoint) {
  const p = {
    lat: Math.round(point.lat * 1e6) / 1e6,
    lng: Math.round(point.lng * 1e6) / 1e6,
  };

  showPin(p);

  emit('update:modelValue', p);
}

function clearPin() {
  showPin(null);

  emit('update:modelValue', null);
}

function useMyLocation() {
  if (!navigator.geolocation) {
    message.value =
      'GPS unavailable on this device.';

    return;
  }

  message.value = 'Getting GPS location…';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const point = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setPin(point);

      map?.setView(
        [point.lat, point.lng],
        16
      );

      message.value = 'Location pinned.';
    },

    () => {
      message.value =
        'Allow location permission, or tap the map instead. HTTPS is required outside localhost.';
    },

    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000,
    }
  );
}

onMounted(async () => {
  await nextTick();

  try {
    L = await loadLeaflet();

    if (!mapEl.value) {
      return;
    }

    const start = props.modelValue || {
      lat: 12.8797,
      lng: 121.774,
    };

    map = L.map(mapEl.value, {
      scrollWheelZoom: false,
    }).setView(
      [start.lat, start.lng],
      props.modelValue ? 16 : 6
    );

    addTiles(L, map);

    showPin(props.modelValue);

    map.on('click', (e: any) => {
      setPin({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    });

    setTimeout(() => {
      map?.invalidateSize();
    }, 150);

  } catch (e) {
    message.value =
      e instanceof Error
        ? e.message
        : 'Map could not load.';
  }
});

watch(
  () => props.modelValue,
  (point) => {
    if (map) {
      showPin(point);

      if (point) {
        map.setView(
          [point.lat, point.lng],
          16
        );
      }
    }
  }
);

onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>

<style scoped>
.location-picker {
  width: 100%;
  min-width: 0;
}

.label {
  font-size: 13px;
  font-weight: 700;
  color: #173729;
}

.map {
  width: 100%;
  height: 300px;
  border: 1px solid #d9dbc6;
  border-radius: 12px;
  background: #e5ecdf;
  z-index: 0;
}

.coords {
  font-size: 12px;
  color: #5a685d;
  margin: 10px 0;
}

.buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>