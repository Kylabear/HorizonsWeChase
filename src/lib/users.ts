import type { UserRole } from "./types";

export interface AppUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

function getUsers(): AppUser[] {
  return [
    {
      id: "1",
      username: "kyla",
      password: process.env.USER_KYLA_PASSWORD || "MyprettyBeybb",
      name: "Kyla",
      role: "user",
    },
    {
      id: "2",
      username: "cedes",
      password: process.env.USER_CEDES_PASSWORD || "123@testingpass",
      name: "Cedes",
      role: "user",
    },
    {
      id: "3",
      username: "Admin",
      password: process.env.ADMIN_PASSWORD || "RomantiziceLife",
      name: "Admin",
      role: "admin",
    },
  ];
}

export function findUser(username: string, password: string) {
  const normalizedUser = username.trim().toLowerCase();
  const normalizedPass = password.trim();

  return getUsers().find(
    (u) =>
      u.username.toLowerCase() === normalizedUser &&
      u.password === normalizedPass,
  );
}
