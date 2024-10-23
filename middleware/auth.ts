import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getValue } from '../services/driver';

export interface AuthenticatedRequest extends Request {
  user?: any; // You can define a more specific type for the user
}

const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY!);

    // Attach decoded token data to req.user (or req.auth)
    req.user = decoded;
    const driverToken = await getValue(req?.user?.id)
    if (token !== driverToken) {
      return res.status(401).json({ message: "Logged in using other device" })
    }

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default isAuth;
