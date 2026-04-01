export const registerUser = async (data) => {
  console.log("Mock API request:", data);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // simulate success
      if (data.email !== "error@test.com") {
        resolve({
          success: true,
          message: "User registered successfully",
          userId: "12345",
        });
      } else {
        reject({
          success: false,
          message: "Email already exists",
        });
      }
    }, 1000); // simulate delay
  });
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
