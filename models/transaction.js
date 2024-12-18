const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../config.js');

class Transaction {
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

    async add(from, to, fromAmount, toAmount, fromCurrency, toCurrency) {

        await this.connect(); // Ensure connection is established

        const timestamp = Date.now();
        const query = "INSERT INTO transactions (`from`, `to`, from_currency, to_currency, from_amount, to_amount, timestamp) VALUES (?, ?, ?, ?, ?, ?, NOW())";
        const values = [
            from, to, fromCurrency, toCurrency, fromAmount, toAmount
        ];

        try {
            await this.connection.execute(query, values);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async query(walletId) {
        await this.connect();

        const query = 'SELECT * FROM transactions WHERE `from` = ? OR `to` = ?';
        const values = [walletId]

        try {
            const [rows] = await this.connection.execute(query, values);
            return rows; // Return all users
        } catch (error) {
            console.error(error);
            return [];
        } finally {
            await this.connection.end();
        }
    }
}

module.exports = Transaction;