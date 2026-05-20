import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const BASE_URL = API_BASE_URL;
const AUTH_URL = `${BASE_URL}/auth`;

const unwrapResponse = (response) => response.data?.data ?? response.data;
const getAuthConfig = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const getApiErrorMessage = (error, fallbackMessage) => {
  if (error.response) {
    return (
      error.response.data?.message ||
      error.response.data?.error ||
      fallbackMessage
    );
  }

  if (error.request) {
    return `Backend server is not reachable on ${API_BASE_URL}.`;
  }

  return fallbackMessage;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await axios.post(
      `${AUTH_URL}/change-password`,
      { currentPassword, newPassword },
      getAuthConfig(),
    );

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Password change failed"));
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post(
      `${AUTH_URL}/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Login failed"));
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(
      `${AUTH_URL}/forgot-password`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to send password reset instructions"),
    );
  }
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  try {
    const response = await axios.post(
      `${AUTH_URL}/reset-password`,
      { email, otp, newPassword },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Password reset failed"));
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${AUTH_URL}/register`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Registration failed"));
  }
};

export const sendOtp = async (email) => {
  try {
    const response = await axios.post(
      `${AUTH_URL}/otp/send`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to send OTP"));
  }
};

export const verifyOtp = async ({ email, otp }) => {
  try {
    const response = await axios.post(
      `${AUTH_URL}/otp/verify`,
      { email, otp },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return unwrapResponse(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "OTP verification failed"));
  }
};
