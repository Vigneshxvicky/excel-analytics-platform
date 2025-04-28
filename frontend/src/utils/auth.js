// src/utils/auth.js
// src/utils/auth.js
export const getUserFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No auth token available.");
      return null;
    }
    try {
      // Get payload of JWT
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      console.log("Decoded token in getUserFromToken:", decoded);
      return decoded;  // Should include userId, role, and name
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };
  // Check if the token is expired
  export const isTokenExpired = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return true;
    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime >= exp;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true;
    }
  };