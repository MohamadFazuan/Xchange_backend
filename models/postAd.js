const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('../config.js');

class PostAd {

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
        total) {
        const connection = await mysql.createConnection({
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            database: config.db.database
        });

        // Check if user already exists
        const insert = `INSERT INTO post (
            from_currency,
            from_amount,
            to_currency,
            to_amount,
            name,
            walletId,
            from_date,
            to_date,
            location,
            exchange_payment,
            tax_charges,
            service_fee,
            total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
            exchangePayment,
            taxCharges,
            serviceFee,
            total
        ];

        try {
            await connection.execute(insert, values);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            await connection.end();
        }
    }

    async delete(id) {
        const connection = await mysql.createConnection({
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            database: config.db.database
        });

        const pick = `DELETE FROM post WHERE id = ?`;
        const values = [id];

        try {
            await connection.execute(pick, values);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            await connection.end();
        }
        
    }

    async queryAll() {
        const connection = await mysql.createConnection({
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            database: config.db.database
        });

        const query = `SELECT * FROM post`;

        try {
            const [rows] = await connection.execute(query);
            if (rows.length === 0) {
                return null;
            }

            return rows;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            await connection.end();
        }
    }

    async queryByExchange(fromCurrency, toCurrency) {
        const connection = await mysql.createConnection({
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            database: config.db.database
        });

        const query = `SELECT * FROM post WHERE from_currency = ? AND to_currency = ?`;
        const values = [fromCurrency, toCurrency];

        try {
            const [rows] = await connection.execute(query, values);
            if (rows.length === 0) {
                return null;
            }

            return rows;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            await connection.end();
        }
    }

    // New method to query a post by ID
    async queryById(id) {
        const connection = await mysql.createConnection({
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            database: config.db.database
        });

        const query = `SELECT * FROM post WHERE id = ?`;
        const values = [id];

        try {
            const [rows] = await connection.execute(query, values);
            if (rows.length === 0) {
                return null; // No post found with the given ID
            }

            return rows[0]; // Return the first row (the post)
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            await connection.end();
        }
    }
}

module.exports = PostAd;