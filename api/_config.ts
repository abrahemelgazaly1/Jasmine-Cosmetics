// Environment/config shared by all serverless functions.
export const env = {
  mongoUri: process.env.MONGO_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev_secret_change_me',
};

export const SHIPPING_FEE = 120;
