/** Normalize bank transfer references before inserting under the unique (method, lower(reference)) index. */
export function normalizePaymentReference(reference) {
  return String(reference ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
/** A campaign displays one approved payout account; the proof must be for that same method. */
export function requirePayoutMethod(method, payoutMethod) {
  if (!['GCash', 'Maya', 'Bank Transfer'].includes(method) || method !== payoutMethod) {
    const error = new Error('The selected payment method does not match the campaign payout account. Use the payout method displayed on the campaign.');
    error.status = 422;
    throw error;
  }
}
