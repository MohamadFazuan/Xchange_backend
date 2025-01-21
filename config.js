require('dotenv').config(); // Load environment variables from .env

module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',  // 'db' will work in Docker
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'mydb'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'defaultSecret',
    expires: process.env.JWT_EXPIRES || '1h'
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
    password: process.env.BCRYPT_PASSWORD || 'defaultPassword'
  },
  rate: {
    apiKey: process.env.RATE_API_KEY || 'defaultApiKey'
  },
  fcm:{
    serverKey: process.env.MESSAGING_SERVER_KEY
  }
};