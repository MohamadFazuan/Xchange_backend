const mysql = require('mysql2/promise');
const config = require('../config.js');

class PostAd {
  constructor() {
    this.connection = null; // Initialize a connection holder
  }

  _log(action, status, details = '') {
    console.log(`[PostAd][${action}][${status}] ${details}`);
  }

  // Create the database connection once and reuse it
  async connect() {
    if (!this.connection) {
      this._log('connect', 'start', 'Establishing database connection');
      try {
        this.connection = await mysql.createConnection({
          host: config.db.host,
          port: config.db.port,
          user: config.db.user,
          password: config.db.password,
          database: config.db.database,
          ssl: {
            rejectUnauthorized: false
          }
        });
        this._log('connect', 'success', 'Database connection established');
      } catch (error) {
        this._log('connect', 'error', `Failed to connect: ${error.message}`);
        throw error;
      }
    }
  }

  async add(
    fromCurrency,
    fromAmount,
    toCurrency,
    toAmount,
    name,
    walletId,
    fromDate,
    toDate,
    location,
    exchangePayment,
    taxCharges,
    serviceFee,
    total
  ) {
    this._log('add', 'start', `Adding new post: ${fromCurrency}${fromAmount} -> ${toCurrency}${toAmount}`);
    const query = `
      INSERT INTO post (
        from_currency, from_amount, to_currency, to_amount, name,
        walletId, from_date, to_date, location, exchange_payment,
        tax_charges, service_fee, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      fromCurrency, fromAmount, toCurrency, toAmount, name,
      walletId, fromDate, toDate, location, exchangePayment,
      taxCharges, serviceFee, total
    ];

    try {
      await this.connect(); // Ensure connection is established
      await this.connection.execute(query, values);
      this._log('add', 'success', `Post added successfully`);
      return true;
    } catch (error) {
      this._log('add', 'error', `Failed to add post: ${error.message}`);
      return false;
    }
  }

  async updatePost(
    id,
    fromCurrency,
    fromAmount,
    toCurrency,
    toAmount,
    name,
    walletId,
    fromDate,
    toDate,
    location,
    taxCharges,
    serviceFee,
  ) {
    this._log('updatePost', 'start', `Updating post ID ${id}: ${fromCurrency}${fromAmount} -> ${toCurrency}${toAmount}`);
    const query = `
        UPDATE post 
        SET from_currency = ?, 
            from_amount = ?,
            to_currency = ?,
            to_amount = ?,
            name = ?,
            walletId = ?,
            from_date = ?,
            to_date = ?,
            location = ?,
            exchange_payment = ?,
            tax_charges = ?,
            service_fee = ?,
            total = ?
        WHERE id = ?
    `;

    const values = [
      fromCurrency,
      fromAmount,
      toCurrency,
      toAmount,
      name,
      walletId,
      fromDate,
      toDate,
      location,
      toAmount,
      taxCharges,
      serviceFee,
      toAmount,
      id
    ];

    try {
      await this.connect();
      const [result] = await this.connection.execute(query, values);
      if (result.affectedRows > 0) {
        this._log('updatePost', 'success', `Post ${id} updated successfully`);
        return true;
      } else {
        this._log('updatePost', 'error', `Post ${id} not found`);
        return false;
      }
    } catch (error) {
      this._log('updatePost', 'error', `Failed to update post: ${error.message}`);
      return false;
    }
  }

  async delete(id) {
    this._log('delete', 'start', `Deleting post ID: ${id}`);
    const query = `DELETE FROM post WHERE id = ?`;
    const values = [id];

    try {
      await this.connect(); // Ensure connection is established
      await this.connection.execute(query, values);
      this._log('delete', 'success', `Deleted post ID: ${id}`);
      return true;
    } catch (error) {
      this._log('delete', 'error', `Delete failed: ${error.message}`);
      return false;
    }
  }

  async queryAll() {
    this._log('queryAll', 'start', 'Fetching all posts');
    const query = `SELECT * FROM post`;

    try {
      await this.connect(); // Ensure connection is established
      const [rows] = await this.connection.execute(query);
      this._log('queryAll', 'success', `Found ${rows.length} posts`);
      return rows.length ? rows : null;
    } catch (error) {
      this._log('queryAll', 'error', `Fetch failed: ${error.message}`);
      return false;
    }
  }

  async queryByExchange(fromCurrency, toCurrency, fromAmount, toAmount) {
    this._log('queryByExchange', 'start', `Searching ${fromCurrency}${fromAmount} -> ${toCurrency}${toAmount}`);
    const query = `
      SELECT *
      FROM post
      WHERE 
        (from_currency = ? AND to_currency = ? AND to_amount >= ?)
        OR
        (from_currency = ? AND to_currency = ? AND from_amount >= ?)
      ORDER BY from_amount ASC
    `;

    const values = [toCurrency, fromCurrency, toAmount,
      toCurrency, fromCurrency, fromAmount
    ]; // Reverse match parameters

    try {
      await this.connect();
      const [rows] = await this.connection.execute(query, values);
      this._log('queryByExchange', 'success', `Found ${rows.length} matching posts`);
      return rows.length ? rows : null;
    } catch (error) {
      this._log('queryByExchange', 'error', `Search failed: ${error.message}`);
      return false;
    }
  }

  async queryById(id) {
    this._log('queryById', 'start', `Searching post ID: ${id}`);
    const query = `SELECT * FROM post WHERE id = ?`;
    const values = [id];

    try {
      await this.connect(); // Ensure connection is established
      const [rows] = await this.connection.execute(query, values);
      this._log('queryById', 'success', rows.length ? `Found post ID: ${id}` : 'Post not found');
      return rows.length ? rows[0] : null;
    } catch (error) {
      this._log('queryById', 'error', `Search failed: ${error.message}`);
      return false;
    }
  }

  async queryByUser(username) {
    this._log('queryByUser', 'start', `Searching post ID: ${username}`);
    const query = `SELECT * FROM post WHERE name = ?`;
    const values = [username];

    try {
      await this.connect(); // Ensure connection is established
      const [rows] = await this.connection.execute(query, values);
      this._log('queryByUser', 'success', rows.length ? `Found post ID: ${username}` : 'Post not found');
      return rows.length ? rows : null;
    } catch (error) {
      this._log('queryByUser', 'error', `Search failed: ${error.message}`);
      return false;
    }
  }

  // Close the connection when the app is shutting down
  async closeConnection() {
    if (this.connection) {
      this._log('closeConnection', 'start', 'Closing database connection');
      try {
        await this.connection.end();
        this._log('closeConnection', 'success', 'Database connection closed');
      } catch (error) {
        this._log('closeConnection', 'error', `Failed to close connection: ${error.message}`);
      }
    }
  }
}

module.exports = PostAd;