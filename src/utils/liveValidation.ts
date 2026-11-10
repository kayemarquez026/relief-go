const phone = /^09\d{9}$/;
const addressLetters = /\p{L}/u;
const letters = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const amount = /^\d+(?:\.\d{1,2})?$/;

const fields =
  'input, textarea, select, ion-input, ion-textarea, ion-select';

const fieldContainers =
  '.field-group, .input-group, .form-group, .form-field, .input-field, .proof-form, label';

const authPages = [
  '.relief-register-page',
  '.register-page',
  '.register-form',
  '.register-shell',
  '.relief-login-page',
  '.login-page',
  '.login-form'
].join(', ');

type Field = HTMLElement & {
  value?: unknown;
  files?: FileList | null;
  validity?: ValidityState;
};

let initialized = false;
let hintCounter = 0;

function isAuthEvent(event: Event): boolean {
  const path = event.composedPath();

  for (const item of path) {
    if (item instanceof Element) {
      if (item.matches(authPages)) return true;
      if (/^(register-|login-)/.test(item.id)) return true;
    }
  }

  const target = event.target;

  return (
    target instanceof Element &&
    Boolean(target.closest(authPages))
  );
}

function controlValue(el: Field): string {
  return String(el.value ?? '')
    .normalize('NFC')
    .trim();
}

function requirement(
  el: Field,
  container: Element
): boolean {
  if (
    el.hasAttribute('required') ||
    el.getAttribute('aria-required') === 'true'
  ) {
    return true;
  }

  const label =
    container.querySelector('label')
      ?.textContent?.trim() ?? '';

  return /\s\*(?:\s|$)/.test(` ${label}`);
}

function hintFor(
  el: Field,
  container: Element
): string {
  const value = controlValue(el);

  const key = [
    el.id,
    el.getAttribute('name'),
    el.getAttribute('aria-label')
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const type =
    (el.getAttribute('type') ?? '').toLowerCase();

  const required = requirement(el, container);

  if (type === 'file') {
    const file = el.files?.[0];

    if (!file) {
      return required
        ? 'Choose a file to continue.'
        : '';
    }

    if (
      file.size < 1 ||
      file.size > 8 * 1024 * 1024
    ) {
      return 'Choose a non-empty file smaller than 8 MB.';
    }

    const allowed = (
      el.getAttribute('accept') ?? ''
    )
      .split(',')
      .map(value => value.trim().toLowerCase())
      .filter(Boolean);

    if (allowed.length && file.type) {
      const fileType = file.type.toLowerCase();

      const isAllowed = allowed.some(
        accepted =>
          accepted === fileType ||
          (
            accepted.endsWith('/*') &&
            fileType.startsWith(
              accepted.slice(0, -1)
            )
          ) ||
          (
            accepted.startsWith('.') &&
            file.name
              .toLowerCase()
              .endsWith(accepted)
          )
      );

      if (!isAllowed) {
        return 'This file type is not allowed. Check the formats listed on the form.';
      }
    }

    return '';
  }

  if (!value) {
    return required
      ? 'This field is required.'
      : '';
  }

  if (
    type === 'email' ||
    /email/.test(key)
  ) {
    return email.test(value) &&
      value.length <= 254
      ? ''
      : 'Enter a valid email address (e.g., name@gmail.com).';
  }

  if (
    /\b(phone|mobile|telephone)\b|contact-phone/.test(key) &&
    !/reference/.test(key)
  ) {
    return phone.test(value)
      ? ''
      : 'Use an 11-digit Philippine mobile number starting with 09.';
  }

  if (/campaign-title/.test(key)) {
    return (
      value.length >= 8 &&
      value.length <= 120 &&
      letters.test(value)
    )
      ? ''
      : 'Enter a title of 8–120 letters and spaces.';
  }

  if (
    /(location-address|event-location|volunteer-location|volunteer.*address)/.test(key)
  ) {
    return (
      value.length >= 3 &&
      value.length <= 200 &&
      addressLetters.test(value)
    )
      ? ''
      : 'Enter an address of 3–200 characters. Numbers and punctuation are allowed.';
  }

  if (/\b(city|barangay)\b/.test(key)) {
    return (
      value.length >= 2 &&
      value.length <= 100 &&
      addressLetters.test(value)
    )
      ? ''
      : 'Enter a valid location (2–100 characters).';
  }

  if (
    /(goal-amount|donation-amount|expense-amount|amount-in-pesos)/.test(key)
  ) {
    return (
      amount.test(value) &&
      Number(value) >= 0.01 &&
      Number(value) <= 10000000
    )
      ? ''
      : 'Enter ₱0.01–₱10,000,000 using at most two decimal places.';
  }

  const minLength = Number(
    el.getAttribute('minlength')
  );

  const maxLength = Number(
    el.getAttribute('maxlength')
  );

  if (
    minLength > 0 &&
    value.length < minLength
  ) {
    return `Use at least ${minLength} characters.`;
  }

  if (
    maxLength > 0 &&
    value.length > maxLength
  ) {
    return `Use no more than ${maxLength} characters.`;
  }

  if (
    el.validity?.badInput ||
    el.validity?.typeMismatch ||
    el.validity?.patternMismatch
  ) {
    return 'Please use the requested format.';
  }

  if (
    el.validity?.rangeUnderflow ||
    el.validity?.rangeOverflow
  ) {
    return 'Please enter a number within the allowed range.';
  }

  return '';
}

function sanitizeInternalInput(
  event: Event
): void {
  if (isAuthEvent(event)) return;

  const raw = event.target;

  if (!(raw instanceof HTMLInputElement)) {
    return;
  }

  const key = `${raw.id} ${raw.name}`
    .toLowerCase();

  let next = raw.value;

  if (
    /(contact-phone|contact-number|mobile-number|phone-number|volunteer-phone)/.test(key)
  ) {
    next = next
      .replace(/\D/g, '')
      .slice(0, 11);
  } else if (
    /(payout-name|full-name|volunteer-name)/.test(key)
  ) {
    next = next
      .normalize('NFC')
      .replace(/[^\p{L}\p{M} .]/gu, '')
      .replace(/ {2,}/g, ' ');
  } else {
    return;
  }

  if (next !== raw.value) {
    raw.value = next;

    raw.dispatchEvent(
      new Event('input', {
        bubbles: true
      })
    );
  }
}

function validateEvent(
  event: Event
): void {
  if (isAuthEvent(event)) return;

  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const input = (
    target.matches(fields)
      ? target
      : target.closest(fields)
  ) as Field | null;

  if (!input) return;

  const type = (
    input.getAttribute('type') ?? ''
  ).toLowerCase();

  if (
    ['hidden', 'checkbox', 'radio'].includes(type)
  ) {
    return;
  }

  if (input.hasAttribute('disabled')) {
    return;
  }

  const container =
    input.closest(fieldContainers);

  if (!container) return;

  if (
    event.type === 'input' ||
    event.type === 'ionInput'
  ) {
    if (
      !controlValue(input) &&
      !input.hasAttribute('data-rg-touched')
    ) {
      return;
    }
  }

  input.setAttribute(
    'data-rg-touched',
    'true'
  );

  const message = hintFor(
    input,
    container
  );

  let helper = Array.from(
    container.children
  ).find(
    child =>
      child.classList.contains('rg-live-hint')
  ) as HTMLElement | undefined;

  if (!message && !helper) {
    return;
  }

  if (!helper) {
    helper = document.createElement('small');

    helper.className = 'rg-live-hint';

    helper.id = `rg-hint-${++hintCounter}`;

    helper.setAttribute(
      'aria-live',
      'polite'
    );

    container.appendChild(helper);
  }

  if (!helper.id) {
    helper.id = `rg-hint-${++hintCounter}`;
  }

  helper.textContent = message;
  helper.hidden = !message;

  if (message) {
    input.setAttribute(
      'aria-invalid',
      'true'
    );

    input.setAttribute(
      'aria-describedby',
      helper.id
    );
  } else {
    input.removeAttribute(
      'aria-invalid'
    );

    if (
      input.getAttribute('aria-describedby') ===
      helper.id
    ) {
      input.removeAttribute(
        'aria-describedby'
      );
    }
  }
}

export function enableLiveValidation(): void {
  if (initialized) return;

  initialized = true;

  document.addEventListener(
    'input',
    sanitizeInternalInput,
    true
  );

  document.addEventListener(
    'ionInput',
    validateEvent
  );

  document.addEventListener(
    'ionChange',
    validateEvent
  );

  document.addEventListener(
    'input',
    validateEvent,
    true
  );

  document.addEventListener(
    'change',
    validateEvent,
    true
  );

  document.addEventListener(
    'focusout',
    validateEvent,
    true
  );
}
