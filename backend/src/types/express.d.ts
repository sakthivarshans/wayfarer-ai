/**
 * Adds `req.user`, populated by the `requireAuth` middleware after a
 * Firebase ID token is verified. Any route behind that middleware can read
 * `req.user` without a manual cast.
 */
export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
