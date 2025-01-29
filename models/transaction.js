const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../config.js');

class Transaction {
    constructor() {
        this.connection = null; // Initialize a connection holder
    }

    _log(action, status, details = '') {
        console.log(`[Transaction][${action}][${status}] ${details}`);
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

    async add(from, to, fromAmount, toAmount, fromCurrency, toCurrency) {
        this._log('create', 'start', `Creating transaction: Buyer: ${from}, Seller: ${to}`);
        await this.connect(); // Ensure connection is established

        const query = 'INSERT INTO transactions (`from`, `to`, from_currency, to_currency, from_amount, to_amount, timestamp) VALUES (?, ?, ?, ?, ?, ?, NOW())';
        const values = [
            from, to, fromCurrency, toCurrency, fromAmount, toAmount
        ];

        try {
            await this.connection.execute(query, values);
            this._log('create', 'success', `Transaction created successfully`);
            return true;
        } catch (error) {
            this._log('create', 'error', `Create failed: ${error.message}`);
            return false;
        }
    }

    async query(name) {
        this._log('get', 'start', `Fetching transaction ID: ${name}`);
        const query = 'SELECT * FROM transactions WHERE `from` = ? OR `to` = ?';
        const values = [name, name];

        try {
            await this.connect();
            const [rows] = await this.connection.execute(query, values);
            this._log('get', 'success', `Transaction found`);
            return rows.length ? rows : null; // Return all users
        } catch (error) {
            this._log('get', 'error', `Get failed: ${error.message}`);
            return [];
        }
    }
}

module.exports = Transaction;