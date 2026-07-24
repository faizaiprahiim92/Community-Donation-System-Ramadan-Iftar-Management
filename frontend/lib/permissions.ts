export type Role = "Manager" | "Leader" | "Volunteer";

interface PagePermission {
  canView: Role[];
  canCreate: Role[];
  canEdit: Role[];
  canDelete: Role[];
}

export const pagePermissions: Record<string, PagePermission> = {
  dashboard: {
    canView: ["Manager", "Leader", "Volunteer"],
    canCreate: [],
    canEdit: [],
    canDelete: [],
  },
  users: {
    canView: ["Manager", "Leader"],
    canCreate: ["Manager"],
    canEdit: ["Manager"],
    canDelete: ["Manager"],
  },
  donations: {
    canView: ["Manager", "Leader", "Volunteer"],
    canCreate: ["Manager", "Leader"],
    canEdit: ["Manager", "Leader"],
    canDelete: ["Manager"],
  },
  expenses: {
    canView: ["Manager", "Leader", "Volunteer"],
    canCreate: ["Manager", "Leader"],
    canEdit: ["Manager", "Leader"],
    canDelete: ["Manager"],
  },
  reports: {
    canView: ["Manager", "Leader", "Volunteer"],
    canCreate: ["Manager", "Leader"],
    canEdit: ["Manager", "Leader"],
    canDelete: ["Manager"],
  },
  tasks: {
    canView: ["Manager", "Leader", "Volunteer"],
    canCreate: ["Manager", "Leader"],
    canEdit: ["Manager", "Leader"],
    canDelete: ["Manager"],
  },
  gallery: {
    canView: ["Manager", "Leader", "Volunteer"],
    canCreate: ["Manager", "Leader"],
    canEdit: ["Manager", "Leader"],
    canDelete: ["Manager", "Volunteer"],
  },
  messages: {
    canView: ["Manager", "Leader", "Volunteer"],
    canCreate: ["Manager", "Leader", "Volunteer"],
    canEdit: ["Manager", "Leader", "Volunteer"],
    canDelete: ["Manager"],
  },
};

export const sidebarPages: Record<string, Role[]> = {
  "/dashboard": ["Manager", "Leader", "Volunteer"],
  "/dashboard/users": ["Manager", "Leader"],
  "/dashboard/donations": ["Manager", "Leader", "Volunteer"],
  "/dashboard/expenses": ["Manager", "Leader", "Volunteer"],
  "/dashboard/reports": ["Manager", "Leader", "Volunteer"],
  "/dashboard/tasks": ["Manager", "Leader", "Volunteer"],
  "/dashboard/gallery": ["Manager", "Leader", "Volunteer"],
  "/dashboard/messages": ["Manager", "Leader", "Volunteer"],
};

export function canAccess(role: Role | undefined, page: string, action: "canView" | "canCreate" | "canEdit" | "canDelete" = "canView"): boolean {
  if (!role) return false;
  const perm = pagePermissions[page];
  if (!perm) return false;
  return perm[action].includes(role);
}

export function canAccessPage(role: Role | undefined, href: string): boolean {
  if (!role) return false;
  const allowed = sidebarPages[href];
  if (!allowed) return true;
  return allowed.includes(role);
}
