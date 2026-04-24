import axios from "axios";

// Base root (no /auth here)
const BASE_URL = "http://localhost:5000/api/v1";

// Specific route groups
const AUTH_URL = `${BASE_URL}/auth`;

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${AUTH_URL}/register`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed",
    );
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

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to send OTP",
    );
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

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "OTP verification failed",
    );
  }
};
