import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const EVENTS_URL = `${API_BASE_URL}/events`;
const eventClient = axios.create({
  baseURL: EVENTS_URL,
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

export const getEvents = async (params = {}) => {
  try {
    const response = await eventClient.get("/", { params });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch events"));
  }
};

export const getEventById = async (id) => {
  try {
    const response = await eventClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch event"));
  }
};

export const createEvent = async (payload) => {
  try {
    const response = await eventClient.post("/", payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create event"));
  }
};

export const updateEvent = async (id, payload) => {
  try {
    const response = await eventClient.patch(`/${id}`, payload, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update event"));
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await eventClient.delete(`/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete event"));
  }
};

export const getEventRegistrations = async (id) => {
  try {
    const response = await eventClient.get(`/${id}/registrations`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch event registrations"),
    );
  }
};
