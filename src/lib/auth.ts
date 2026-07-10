import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken, verifyPassword } from "./session";

const SESSION_COOKIE = "wvsu_usc_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function setAdminSession(): Promise<void> {
  const token = await createSessionToken();
  if (!token) {
    throw new Error("Admin session is not configured.");
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return await verifySessionToken(token);
}

export { verifyPassword };
