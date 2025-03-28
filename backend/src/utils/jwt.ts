import jwt from 'jsonwebtoken';

// Define TokenPayload interface for type safety
interface TokenPayload {
  userId: string;
  role: string;
  [key: string]: any; // Allows other properties in the payload
}

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret'; // Replace with a strong secret
const jwtExpiration = process.env.JWT_EXPIRATION || '1h';

if (!jwtSecret) {
  console.warn('JWT_SECRET is not defined in the environment. Using a default secret (for development only!).');
}

export function generateToken(userId: string, role: string): string {
    const payload = {
      userId: userId,
      role: role,
    };

    // @ts-ignore - Bypass TypeScript checking for jwt.sign
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiration,
    });
    return token;
  }

export function verifyToken(token: string): TokenPayload {
  try {
    // @ts-ignore - Bypass TypeScript checking for jwt.verify
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token signature');
    } else {
      throw new Error('Invalid token');
    }
  }
}
