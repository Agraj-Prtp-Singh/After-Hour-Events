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

// Fetch student dashboard stats (events attended, upcoming, total bookings)
export const getStudentStats = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/student/stats`,
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch student stats"
    );
  }
};

// Fetch student's bookings
export const getStudentBookings = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/student/bookings`,
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch bookings"
    );
  }
};

// Fetch all available events (for browse / dashboard preview)
export const getEvents = async (params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/events`, {
      ...getAuthHeaders(),
      params,
    });
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch events"
    );
  }
};

// Fetch a single event by ID
export const getEventById = async (eventId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/events/${eventId}`,
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch event details"
    );
  }
};

// Book an event
export const bookEvent = async (eventId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/student/bookings`,
      { eventId },
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to book event"
    );
  }
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/student/bookings/${bookingId}`,
      getAuthHeaders()
    );
    return normalizeResponse(response);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to cancel booking"
    );
  }
};