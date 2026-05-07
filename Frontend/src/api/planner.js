import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const normalizeResponse = (response) => {
  const payload = response.data?.data ?? response.data;
  return payload?.items ?? payload;
};

// Fetch planner dashboard stats
export const getPlannerStats = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/planner/stats`,
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch planner stats"
    );
  }
};

// Fetch planner's own events
export const getPlannerEvents = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/planner/events`,
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch planner events"
    );
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/planner/events`,
      eventData,
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create event"
    );
  }
};

// Update an existing event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/planner/events/${eventId}`,
      eventData,
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update event"
    );
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/planner/events/${eventId}`,
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete event"
    );
  }
};

// Fetch attendees for a specific event
export const getEventAttendees = async (eventId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/planner/events/${eventId}/attendees`,
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch attendees"
    );
  }
};

// Fetch all attendees across planner's events
export const getAllAttendees = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/planner/attendees`,
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch attendees"
    );
  }
};