import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const getAuthConfig = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  return {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const unwrapResponse = (response) => response.data?.data ?? response.data;

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || error.response?.data?.error || fallbackMessage;

export const getVendorEvents = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/vendor/events`, getAuthConfig());
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch vendor events"));
  }
};

export const applyToVendorEvent = async (eventId, payload) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/vendor/events/${eventId}/apply`,
      payload,
      getAuthConfig(),
    );
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to submit vendor application"));
  }
};

export const getMyVendorApplications = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/vendor/applications`,
      getAuthConfig(),
    );
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch vendor applications"));
  }
};