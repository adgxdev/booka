import { SignupBody, LoginBody, UpdateUserBody, ChangePasswordBody } from "./types/user";

const API = process.env.NEXT_PUBLIC_API_URL!;

// Sign up
export async function signupUser(body: SignupBody) {
  const res = await fetch(`${API}/api/users/signup-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Log in (Sets cookies automatically)
export async function loginUser(body: LoginBody) {
  const res = await fetch(`${API}/api/users/login-user`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Log out (clears cookies)
export async function logoutUser() {
  await fetch(`${API}/api/users/logout-user`, {
    method: "GET",
    credentials: "include",
  });
}

// Refresh User Token
export async function refreshUserToken() {
  const res = await fetch(`${API}/api/users/refresh-user-token`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

// Get User Info
export async function getUser() {
  const res = await fetch(`${API}/api/users/get-personal-user-info`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.data;
}

// Update User Info
export async function updateUser(body: UpdateUserBody) {
  const res = await fetch(`${API}/api/users/update-personal-user-info`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Change User Password
export async function changeUserPassword(body: ChangePasswordBody) {
  const res = await fetch(`${API}/api/users/change-user-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}