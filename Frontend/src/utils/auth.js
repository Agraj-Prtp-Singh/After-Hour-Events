const STORAGE_KEYS = {
  token: "token",
  user: "user",
};

const ROLE_HOME_ROUTES = {
  admin: "/admin/dashboard",
  student: "/student-dashboard",
  vendor: "/planner/dashboard",
  planner: "/planner/dashboard",
  event_planner: "/planner/dashboard",
  organizer: "/planner/dashboard",
};

const getStorages = () => [localStorage, sessionStorage];

export function getStoredToken() {
  for (const storage of getStorages()) {
    const token = storage.getItem(STORAGE_KEYS.token);
    if (token) {
      return token;
    }
  }

  return "";
}

export function getStoredUser() {
  for (const storage of getStorages()) {
    const rawUser = storage.getItem(STORAGE_KEYS.user);

    if (!rawUser) {
      continue;
    }

    try {
      return JSON.parse(rawUser);
    } catch {
      storage.removeItem(STORAGE_KEYS.user);
    }
  }

  return null;
}

export function normalizeRole(role) {
  if (!role) {
    return "";
  }

  const normalized = String(role).trim().toLowerCase();

  if (
    normalized === "event_planner" ||
    normalized === "planner" ||
    normalized === "organizer"
  ) {
    return "event_planner";
  }

  return normalized;
}

export function getHomeRouteForRole(role) {
  return ROLE_HOME_ROUTES[normalizeRole(role)] || "/";
}

export function persistAuthSession(authData, rememberMe = false) {
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;

  otherStorage.removeItem(STORAGE_KEYS.token);
  otherStorage.removeItem(STORAGE_KEYS.user);

  storage.setItem(STORAGE_KEYS.token, authData?.token || "");
  storage.setItem(STORAGE_KEYS.user, JSON.stringify(authData?.user || {}));
}

export function clearAuthSession() {
  for (const storage of getStorages()) {
    storage.removeItem(STORAGE_KEYS.token);
    storage.removeItem(STORAGE_KEYS.user);
  }
}

export function isAuthenticated() {
  return Boolean(getStoredToken());
}
