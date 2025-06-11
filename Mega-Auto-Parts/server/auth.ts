import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

export function setupAuth(app: Express) {
  // Session configuration
  const PgStore = connectPg(session);
  const sessionStore = new PgStore({
    conString: process.env.DATABASE_URL,
    tableName: "sessions",
    createTableIfMissing: false,
  });

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "mega-auto-parts-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Passport configuration
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for admin login
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const admin = await storage.validateAdminPassword(username, password);
        if (admin) {
          return done(null, admin);
        } else {
          return done(null, false, { message: "Невалидно корисничко име или лозинка" });
        }
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Serialize/deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const admin = await storage.getAdminByUsername(String(id));
      done(null, admin);
    } catch (error) {
      done(error);
    }
  });
}

// Middleware to check if user is authenticated admin
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    next();
  } else {
    res.status(401).json({ message: "Потребна е автентификација" });
  }
};

// Check if user is authenticated
export const checkAuth: RequestHandler = (req, res, next) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user : null
  });
};