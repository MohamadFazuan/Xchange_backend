const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../config.js');

class User {
  constructor() {
    this.connection = null; // Initialize a connection holder
  }

  // Create the database connection once and reuse it
  async connect() {
    if (!this.connection) {
      try {
        this.connection = await mysql.createConnection({
          host: config.db.host,
          port: config.db.port,
          user: config.db.user,
          password: config.db.password,
          database: config.db.database,
        });
        console.log('Database connection established.');
      } catch (error) {
        console.error('Error establishing database connection:', error);
        throw error;
      }
    }
  }

  async register(username, email, password, walletId, fcmToken) {
    await this.connect();

    // Check if user already exists
    const query1 = `SELECT * FROM users WHERE username = ? OR email = ?`;
    const values1 = [username, email];


    try {
      const [rows] = await this.connection.execute(query1, values1);
      if (rows.length > 0) {
        // User already exists, return error
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }

    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);

    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `INSERT INTO users (id, username, email, password, wallet_id, fcm_token) VALUES (null, ?, ?, ?, ?, ?)`;
    const values = [username, email, hashedPassword, walletId, fcmToken];

    try {
      await this.connection.execute(query, values);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      await this.connection.end();
    }
  }

  async login(username, password) {
    await this.connect();

    const query = `SELECT * FROM users WHERE username = ?`;
    const values = [username];

    try {
      const [rows] = await this.connection.execute(query, values);
      if (rows.length === 0) {
        return null;
      }

      const user = rows[0];
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      return user;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      await this.connection.end();
    }
  }

  // Inside your User class

  async getAllUsers() {
    await this.connect();

    const query = 'SELECT * FROM users';

    try {
      const [rows] = await this.connection.execute(query);
      return rows; // Return all users
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      await this.connection.end();
    }
  }
}

module.exports = User;