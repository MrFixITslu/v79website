// Thin fetch wrapper used by every Course Builder component.
// Reuses the cookie-authenticated admin session via credentials: 'same-origin'.

export async function cbFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(input, {
    ...init,
    credentials: 'same-origin',
    headers
  });
}
