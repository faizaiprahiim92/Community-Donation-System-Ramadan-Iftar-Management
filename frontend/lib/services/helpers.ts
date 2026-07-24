import type { User } from "./users";

export function buildNameMap(users: User[]): Record<number, string> {
  const map: Record<number, string> = {};
  for (const u of users) map[u.id] = u.fullName;
  return map;
}

export function buildRoleMap(users: User[]): Record<number, string> {
  const map: Record<number, string> = {};
  for (const u of users) map[u.id] = u.role;
  return map;
}

export function buildNameToId(users: User[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const u of users) map[u.fullName] = u.id;
  return map;
}
