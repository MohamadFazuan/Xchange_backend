const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('../config.js');

class User {
  async register(username, email, password, walletId) {
    const connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    });

    // Check if user already exists
    const query1 = `SELECT * FROM users WHERE username = ? OR email = ?`;
    const values1 = [username, email];

    try {
      const [rows] = await connection.execute(query1, values1);
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

    const query = `INSERT INTO users (id, username, email, password, walletId) VALUES (null, ?, ?, ?, ?)`;
    const values = [username, email, hashedPassword, walletId];

    try {
      await connection.execute(query, values);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      await connection.end();
    }
  }

  async login(username, password) {
    const connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    });

    const query = `SELECT * FROM users WHERE username = ?`;
    const values = [username];

    try {
      const [rows] = await connection.execute(query, values);
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
      await connection.end();
    }
  }
}

module.exports = User;