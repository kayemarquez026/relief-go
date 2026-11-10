import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import router from '../src/volunteerRoutes.js';

const routeLayers = router.stack.filter(layer => layer.route);
const route = (method, path) => routeLayers.find(layer =>
  layer.route.path === path && layer.route.methods[method]
);

test('only organizer endpoints register volunteer application and attendance decisions', () => {
  for (const path of [
    '/organizer/volunteers/:id',
    '/organizer/volunteers/:id/attendance'
  ]) {
    const found = route('patch', path);
    assert.ok(found, `Missing organizer review: ${path}`);
    assert.ok(found.route.stack.some(layer => layer.name === 'organizer'),
      `${path} must have organizer role middleware`);
  }
  assert.equal(route('patch', '/admin/volunteers/:id'), undefined);
  assert.equal(route('patch', '/admin/volunteers/:id/attendance'), undefined);
});

test('legacy admin volunteer listing is denied rather than revealing private records', () => {
  const found = route('get', '/admin/volunteers');
  assert.ok(found);
  assert.match(found.route.stack.at(-1).handle.toString(), /fail\(403/);
});

test('volunteer and organizer evidence views are authenticated', () => {
  for (const path of [
    '/campaigns/:id/volunteers',
    '/volunteers/:id/attendance',
    '/volunteer-evidence/:id'
  ]) {
    const found = route('get', path);
    assert.ok(found, `Missing private endpoint: ${path}`);
    // Both the token-auth wrapper and the actual route handler must exist.
    assert.ok(found.route.stack.length >= 2);
  }
});
