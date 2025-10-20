const API_BASE =
  process.env.REACT_APP_DIGIPIN_AGENT_API ||
  process.env.REACT_APP_AGENT_API ||
  "http://localhost:8080";

type FetchInit = RequestInit & { signal?: AbortSignal };

async function requestJson<T>(path: string, options: FetchInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);

  if (!response.ok) {
    const detail = (data as any)?.detail || response.statusText;
    throw new Error(detail || "Request failed");
  }

  return data;
}

export async function askDigipinAgent(
  message: string,
  context?: Record<string, unknown>
) {
  return requestJson<{
    message: string;
    response: string;
  }>("/api/agent/respond", {
    method: "POST",
    body: JSON.stringify({ message, context }),
  });
}

export async function encodeViaBackend(lat: number, lon: number) {
  return requestJson<{ pin: string }>("/api/digipin/encode", {
    method: "POST",
    body: JSON.stringify({ latitude: lat, longitude: lon }),
  });
}

export async function decodeViaBackend(pin: string) {
  return requestJson<{
    latitude: number;
    longitude: number;
    bounds: {
      south_west: { lat: number; lon: number };
      north_east: { lat: number; lon: number };
    };
  }>("/api/digipin/decode", {
    method: "POST",
    body: JSON.stringify({ pin }),
  });
}

export async function distanceViaBackend(startPin: string, endPin: string) {
  return requestJson<{ meters: number; kilometers: number; formatted: string }>(
    "/api/digipin/distance",
    {
      method: "POST",
      body: JSON.stringify({ start_pin: startPin, end_pin: endPin }),
    }
  );
}

export async function nearestViaBackend(referencePin: string, candidates: string[]) {
  return requestJson<{ nearest: string }>("/api/digipin/nearest", {
    method: "POST",
    body: JSON.stringify({ reference_pin: referencePin, candidates }),
  });
}
