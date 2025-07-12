import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse, IUser } from '../types/index';
export const requireRole = (roles: IUser['role'][]) => {
    return (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }
  
      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
        return;
      }
  
      next();
    };
  };
  
  // Specific role middleware
  export const requireUser = requireRole(['user', 'admin']);
  export const requireAdmin = requireRole(['admin']);
  