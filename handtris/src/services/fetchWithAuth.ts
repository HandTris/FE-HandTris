import { getAccessToken } from "@/util/getAccessToken";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    // 'cache-control': 'no-cache',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
}
