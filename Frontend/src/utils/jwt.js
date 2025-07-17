// utils/jwt.js
export function getTokenExpiration(token) {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000; // convert to ms
  } catch (err) {
    return null;
  }
}
