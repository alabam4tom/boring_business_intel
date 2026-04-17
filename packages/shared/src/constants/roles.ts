export const ROLES = ["owner", "admin", "viewer", "platform_admin"] as const;
export type Role = (typeof ROLES)[number];
