// utils/auth.js
export function isLoggedIn() {
    return !!localStorage.getItem("token");
  }
  