
const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getToken() {
  return localStorage.getItem('raicToken') || '';
}

export async function apiRequest(path, options = {}) {
  const { headers = {}, ...rest } = options;
  const isForm = rest.body instanceof FormData;

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    cache: 'no-store',
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      'Cache-Control': 'no-cache',
      ...(getToken()
        ? { Authorization: `Bearer ${getToken()}` }
        : {}),
      ...headers
    }
  });

  const contentType = response.headers.get('content-type') || '';

  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      data?.message || 'Something went wrong. Please try again.'
    );
  }

  return data;
}

export async function downloadReceipt(paymentId) {
  const response = await fetch(
    `${API_BASE}/payments/${paymentId}/receipt`,
    {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Unable to download receipt.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `RAIC-Receipt-${paymentId}.pdf`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
