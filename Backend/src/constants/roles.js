const ROLES = {
  STUDENT: 'student',
  VENDOR: 'vendor',
  EVENT_PLANNER: 'event_planner',
  ADMIN: 'admin'
};

const ROLE_ALIASES = {
  student: ROLES.STUDENT,
  user: ROLES.STUDENT,
  attendee: ROLES.STUDENT,
  participant: ROLES.STUDENT,
  vendor: ROLES.VENDOR,
  seller: ROLES.VENDOR,
  eventplanner: ROLES.EVENT_PLANNER,
  planner: ROLES.EVENT_PLANNER,
  organizer: ROLES.EVENT_PLANNER,
  eventorganizer: ROLES.EVENT_PLANNER,
  admin: ROLES.ADMIN,
  administrator: ROLES.ADMIN
};

function normalizeRole(rawRole) {
  if (!rawRole && rawRole !== '') return null;

  const normalizedKey = String(rawRole).trim().toLowerCase().replace(/[^a-z]/g, '');
  return ROLE_ALIASES[normalizedKey] || null;
}

function listAcceptedRoleInputs() {
  return [ROLES.STUDENT, ROLES.VENDOR, ROLES.EVENT_PLANNER, ROLES.ADMIN];
}

module.exports = {
  ROLES,
  normalizeRole,
  listAcceptedRoleInputs
};
