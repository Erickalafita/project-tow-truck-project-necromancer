// Basic JWT verification functions

interface DecodedToken {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    // In a real implementation, you would use a library like jsonwebtoken
    // For now, we'll just decode the base64 token to extract the payload
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
} 