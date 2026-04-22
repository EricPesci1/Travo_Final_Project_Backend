import { getApiBaseUrl } from '@/constants/api';

export type ApiCity = {
  id: number;
  city: string;
  state_name: string;
  lat: string;
  lng: string;
};

export type ApiDimUser = {
  user_key: number;
  username: string;
  last_name: string;
  first_name: string;
  phone_number: string;
  date_created: string;
  email: string;
};

export type ApiRelationship = {
  id: number;
  requester: number;
  addressee: number;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  date_sent: string;
};

export type ApiReview = {
  id: number;
  user: number;
  rating: number;
  description: string;
  city: number;
  created_at: string;
  pros: string;
  cons: string;
  date_start: string | null;
  date_end: string | null;
};

export type CreateReviewInput = {
  username: string;
  city_name: string;
  state_name: string;
  rating: number;
  description: string;
  pros?: string[];
  cons?: string[];
};

export async function getCities(): Promise<ApiCity[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/cities/`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GET /cities/ failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }
  return res.json() as Promise<ApiCity[]>;
}

export async function listUsers(): Promise<ApiDimUser[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/dim-users/`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GET /dim-users/ failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }
  return res.json() as Promise<ApiDimUser[]>;
}

export async function listRelationships(username?: string): Promise<ApiRelationship[]> {
  const base = getApiBaseUrl();
  const url = username
    ? `${base}/relationships/?username=${encodeURIComponent(username)}`
    : `${base}/relationships/`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GET /relationships/ failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }
  return res.json() as Promise<ApiRelationship[]>;
}

export async function sendFriendRequest(input: {
  requester_username: string;
  addressee_username: string;
}): Promise<ApiRelationship> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/relationships/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `POST /relationships/ failed (${res.status}): ${text.slice(0, 500)}`,
    );
  }
  return res.json() as Promise<ApiRelationship>;
}

export async function updateRelationshipStatus(input: {
  id: number;
  status: ApiRelationship['status'];
}): Promise<ApiRelationship> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/relationships/${input.id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: input.status }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `PATCH /relationships/${input.id}/ failed (${res.status}): ${text.slice(0, 500)}`,
    );
  }
  return res.json() as Promise<ApiRelationship>;
}

export async function listReviews(username?: string): Promise<ApiReview[]> {
  const base = getApiBaseUrl();
  const url = username
    ? `${base}/reviews/?username=${encodeURIComponent(username)}`
    : `${base}/reviews/`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GET /reviews/ failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }
  return res.json() as Promise<ApiReview[]>;
}

export async function createReview(input: CreateReviewInput): Promise<unknown> {
  const base = getApiBaseUrl();
  const payload = {
    username: input.username,
    city_name: input.city_name,
    state_name: input.state_name,
    rating: input.rating,
    description: input.description,
    pros: (input.pros ?? []).join('\n'),
    cons: (input.cons ?? []).join('\n'),
  };

  const res = await fetch(`${base}/reviews/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `POST /reviews/ failed (${res.status}): ${text.slice(0, 500)}`,
    );
  }

  return res.json();
}
