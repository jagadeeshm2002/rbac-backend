const allowedSites = ["http://localhost:3000", "http://localhost:5173"];

export const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (allowedSites.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
