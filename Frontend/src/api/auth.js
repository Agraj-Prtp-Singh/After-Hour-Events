import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1";
const AUTH_URL = `${BASE_URL}/auth`;

const unwrapResponse = (response) => response.data?.data ?? response.data;
const getApiErrorMessage = (error, fallbackMessage) => {
  if (error.response) {
    return (
      error.response.data?.message ||
      error.response.data?.error ||
      fallbackMessage
    );
  }

  if (error.request) {
    return "Backend server is not reachable on http://localhost:5000.";
  }

  return fallbackMessage;
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
