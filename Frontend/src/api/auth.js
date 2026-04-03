import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1/auth"; // change if needed

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    // better error handling
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed",
    );
  }
};

export const verifyOtp = async (otp) => {
  console.log("Verifying OTP:", otp);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (otp === "123456") {
        resolve({
          success: true,
          message: "OTP verified",
        });
      } else {
        reject({
          message: "Invalid OTP",
        });
      }
    }, 1000);
  });
};
