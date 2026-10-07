export type Role = 'resident' | 'admin' | 'caseworker';

export const ROLES: Role[] = ['resident', 'admin', 'caseworker'];

export type Permission =
  //Already enforced in the project
  | 'MANAGE_ANNOUNCEMENTS' // create/edit/delete announcements
  | 'VIEW_ALL_REQUESTS' // see all residents' pass/curfew/work-schedule requests 
  | 'REVIEW_REQUESTS' // approve/deny those requests
  | 'MANAGE_USERS' // add/edit/disable other users' accounts and change their roles (admin only)

  // Universal: every role gets these
  | 'VIEW_OWN_PROFILE'
  | 'VIEW_ANNOUNCEMENTS'
  | 'VIEW_CLASSES'
  | 'REGISTER_CLASSES'
  | 'VIEW_RESOURCES'
  | 'VIEW_OWN_APPOINTMENTS'
  | 'BOOK_APPOINTMENT'
  | 'RESCHEDULE_OWN_APPOINTMENT'
  | 'SUBMIT_WORK_SCHEDULE'
  | 'SUBMIT_PASS_REQUEST'
  | 'SUBMIT_CURFEW_REQUEST'
  | 'ACCESS_INFLOW'

// --- NOT YET IMPLEMENTED ---
//
// These permissions were discussed as a team, but the related features
// do not exist in the project yet. They are defined here for future use.
//
// - VIEW_ALL_APPOINTMENTS: No staff view for all residents' appointments yet.
// - EDIT_REQUESTS / DELETE_REQUESTS: Request APIs currently support submitting
//   and reviewing requests, but not editing or deleting them.
// - VIEW_RESIDENT_PROFILES: No staff resident profile page or endpoint yet.
// - MANAGE_COACH_ACCOUNTS / ADD_COACH / EDIT_COACH / DISABLE_COACH /
//   MANAGE_COACH_BOOKING_LINKS: Coach = caseworker. 
// - MANAGE_INFLOW_PAGE: No staff management for the Inflow page yet.
  | 'VIEW_ALL_APPOINTMENTS'
  | 'EDIT_REQUESTS'
  | 'DELETE_REQUESTS'
  | 'VIEW_RESIDENT_PROFILES'
  | 'MANAGE_COACH_ACCOUNTS'
  | 'ADD_COACH'
  | 'EDIT_COACH'
  | 'DISABLE_COACH'
  | 'MANAGE_COACH_BOOKING_LINKS'
  | 'MANAGE_INFLOW_PAGE';

const UNIVERSAL_PERMISSIONS: Permission[] = [
  'VIEW_OWN_PROFILE',
  'VIEW_ANNOUNCEMENTS',
  'VIEW_CLASSES',
  'REGISTER_CLASSES',
  'VIEW_RESOURCES',
  'VIEW_OWN_APPOINTMENTS',
  'BOOK_APPOINTMENT',
  'RESCHEDULE_OWN_APPOINTMENT',
  'SUBMIT_WORK_SCHEDULE',
  'SUBMIT_PASS_REQUEST',
  'SUBMIT_CURFEW_REQUEST',
  'ACCESS_INFLOW',
];

// Admin's permissions on top of the universal set.
const ADMIN_PERMISSIONS: Permission[] = [
  'MANAGE_ANNOUNCEMENTS',
  'VIEW_ALL_REQUESTS',
  'REVIEW_REQUESTS',
  'MANAGE_USERS',
  'VIEW_ALL_APPOINTMENTS',
  'DELETE_REQUESTS',
  'VIEW_RESIDENT_PROFILES',
  'MANAGE_COACH_ACCOUNTS',
  'ADD_COACH',
  'EDIT_COACH',
  'DISABLE_COACH',
  'MANAGE_COACH_BOOKING_LINKS',
  'MANAGE_INFLOW_PAGE',
];

// Caseworker's permissions on top of the universal set. 
const CASEWORKER_PERMISSIONS: Permission[] = [
  'MANAGE_ANNOUNCEMENTS',
  'VIEW_ALL_REQUESTS',
  'REVIEW_REQUESTS',
  'VIEW_ALL_APPOINTMENTS',
  'EDIT_REQUESTS',
  'DELETE_REQUESTS',
  'VIEW_RESIDENT_PROFILES',
];

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  resident: new Set(UNIVERSAL_PERMISSIONS),
  admin: new Set([...UNIVERSAL_PERMISSIONS, ...ADMIN_PERMISSIONS]),
  caseworker: new Set([...UNIVERSAL_PERMISSIONS, ...CASEWORKER_PERMISSIONS]),
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as string[]).includes(value);
}

export function can(
  role: string | null | undefined,
  permission: Permission
): boolean {
  if (!isRole(role)) return false;
  return ROLE_PERMISSIONS[role].has(permission);
}