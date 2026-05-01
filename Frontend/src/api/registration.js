import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const REGISTRATIONS_URL = `${BASE_URL}/registrations`;
const registrationClient = axios.create({
  baseURL: REGISTRATIONS_URL,
});

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
};

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  fallbackMessage;

export const applyForEvent = async (eventId) => {
  try {
    const response = await registrationClient.post(`/${eventId}`, null, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to apply for event"));
  }
};

export const getMyApplications = async () => {
  try {
    const response = await registrationClient.get("/me", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch applications"));
  }
};
