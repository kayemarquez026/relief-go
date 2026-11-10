<template>
  <div class="location-map">

    <div
      v-if="hasPoint"
      ref="mapEl"
      class="map"
      role="application"
      aria-label="Interactive event location map"
    ></div>

    <p v-else class="hint">
      The organizer has not selected an exact map pin.
      {{ address }}
    </p>

    <p v-if="error" class="hint">
      {{ error }}
    </p>

    <a
      v-if="link"
      class="open-map"
      :href="link"
      target="_blank"
      rel="noopener noreferrer"
    >
      Open directions in Google Maps ↗
    </a>

  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  nextTick,
} from 'vue';

import {
  loadLeaflet,
  addTiles,
  validPoint,
} from '../services/osmMap';

const props = defineProps<{
  latitude: number | null;
  longitude: number | null;
  address: string;
}>();

const mapEl = ref<HTMLElement | null>(null);
const error = ref('');

let map: any = null;
let marker: any = null;

const hasPoint = computed(() => {
  return validPoint(
    props.latitude,
    props.longitude
  );
});

const link = computed(() => {
  if (hasPoint.value) {
    return (
      'https://www.google.com/maps/search/?api=1&query=' +
      `${props.latitude},${props.longitude}`
    );
  }

  if (props.address) {
    return (
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(props.address)
    );
  }

  return '';
});

async function render() {
  await nextTick();

  if (!hasPoint.value || !mapEl.value) {
    return;
  }

  try {
    const L = await loadLeaflet();

    if (!mapEl.value) {
      return;
    }

    const point: [number, number] = [
      props.latitude!,
      props.longitude!,
    ];

    if (!map) {
      map = L.map(mapEl.value, {
        scrollWheelZoom: false,
      }).setView(point, 16);

      addTiles(L, map);

      marker = L.circleMarker(point, {
        radius: 9,
        color: '#143b2b',
        fillColor: '#f3b75d',
        fillOpacity: 1,
      }).addTo(map);
    } else {
      map.setView(point, 16);
      marker.setLatLng(point);
    }

    setTimeout(() => {
      map?.invalidateSize();
    }, 150);

    error.value = '';

  } catch (e) {
    error.value =
      e instanceof Error
        ? e.message
        : 'Unable to load the map.';
  }
}

onMounted(render);

watch(
  () => [props.latitude, props.longitude],
  render,
  { flush: 'post' }
);

onBeforeUnmount(() => {
  map?.remove();

  map = null;
  marker = null;
});
</script>

<style scoped>
.location-map {
  width: 100%;
  min-width: 0;
}

.map {
  width: 100%;
  height: 260px;
  border-radius: 12px;
  z-index: 0;
  background: #eaf0e3;
}

.hint {
  font-size: 12px;
  color: #58695b;
  padding: 10px;
  background: #f4f0e5;
  border-radius: 9px;
}

.open-map {
  display: inline-block;
  margin: 10px 0;
  color: #173729;
  font-weight: 800;
  font-size: 12px;
}
</style>