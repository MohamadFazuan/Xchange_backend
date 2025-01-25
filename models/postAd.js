const mysql = require('mysql2/promise');
const config = require('../config.js');

class PostAd {
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
          ssl: {
            rejectUnauthorized: false
          }
        });
        console.log('Database connection established.');
      } catch (error) {
        console.error('Error establishing database connection:', error);
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
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async delete(id) {
    const query = `DELETE FROM post WHERE id = ?`;
    const values = [id];

    try {
      await this.connect(); // Ensure connection is established
      await this.connection.execute(query, values);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async queryAll() {
    const query = `SELECT * FROM post`;

    try {
      await this.connect(); // Ensure connection is established
      const [rows] = await this.connection.execute(query);
      return rows.length ? rows : null;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async queryByExchange(fromCurrency, toCurrency, minAmount, maxAmount) {
    const query = `
      SELECT *,
        (from_amount / to_amount) AS exchange_rate,
        to_amount AS available_amount,
        from_amount AS required_amount,
        'reverse' AS match_type
      FROM post
      WHERE 
        from_currency = ? AND to_currency = ? AND to_amount >= ?
      ORDER BY exchange_rate ASC
    `;
    
    const values = [toCurrency, fromCurrency, minAmount]; // Reverse match parameters
  
    try {
      await this.connect();
      const [rows] = await this.connection.execute(query, values);
  
      const matchedRows = rows.map(row => ({
        ...row,
        matchedAmount: Math.min(row.available_amount, maxAmount),
        equivalentAmount: Math.round(
          Math.min(row.available_amount, maxAmount) / row.exchange_rate * 100
        ) / 100
      }));
  
      return matchedRows.length ? matchedRows : [];
      
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async queryById(id) {
    const query = `SELECT * FROM post WHERE id = ?`;
    const values = [id];

    try {
      await this.connect(); // Ensure connection is established
      const [rows] = await this.connection.execute(query, values);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // Close the connection when the app is shutting down
  async closeConnection() {
    if (this.connection) {
      try {
        await this.connection.end();
        console.log('Database connection closed.');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}

module.exports = PostAd;