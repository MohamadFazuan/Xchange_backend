const config = require('../config.js');
const axios = require('axios');
const mysql = require('mysql2/promise');
const fs = require('fs');
const { google } = require('googleapis');

class Message {
    constructor() {
        this.connection = null; // Initialize a connection holder
    }

    _log(action, status, details = '') {
        console.log(`[Message][${action}][${status}] ${details}`);
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

    /**
     * Retrieve an OAuth2 access token for Firebase.
     * @returns {Promise<string>} - The OAuth2 access token.
     */
    async getOAuthToken() {
        try {
            const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));

            const auth = new google.auth.GoogleAuth({
                credentials: serviceAccount,
                scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
            });

            const accessToken = await auth.getAccessToken();
            console.log('Access token:', accessToken);

            return accessToken;
        } catch (error) {
            console.error('Error fetching OAuth token:', error.message);
            return false
        }
    }

    async sendNotification(to, title, body, dataQr) {
        try {
            // 1. Get FCM token
            const query = 'SELECT fcm_token FROM users WHERE username = ?';
            const values = [to];

            await this.connect();
            const [rows] = await this.connection.execute(query, values);

            if (!rows.length || !rows[0].fcm_token) {
                console.error('No FCM token found for user:', to);
                return false;
            }

            // 2. Prepare FCM payload according to specs
            const payload = {
                "message": {
                    "token": rows[0].fcm_token,
                    "notification": {
                        "body": body,
                        "title": title,
                    },
                    "data": {
                        "dataQr": dataQr // Custom data field
                    }
                }
            };

            // 3. Send notification with proper headers
            const response = await axios.post(
                `https://fcm.googleapis.com/v1/projects/${process.env.PROJECT_ID}/messages:send`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${await this.getOAuthToken()}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('FCM Response:', response.data);
            return true;
        } catch (error) {
            console.error('Error sending push notification:', error.message);
            console.error('Error details:', error.response?.data);
            return false;
        }
    }

    async updateFcm(username, newFcmToken) {
        this._log('updateFcm', 'start', `Updating FCM token for: ${username}`);
        try {
            // SQL query to update the FCM token for the given username
            const query = `
            UPDATE users
            SET fcm_token = ?
            WHERE username = ?`;
            const values = [newFcmToken, username];

            try {
                await this.connect();
                const [result] = await this.connection.execute(query, values);
                this._log('updateFcm', 'success', `FCM token updated for: ${username}`);
                return result.affectedRows > 0;
            } catch (error) {
                this._log('updateFcm', 'error', `Failed to update FCM token: ${error.message}`);
                return [];
            }
        } catch (error) {
            this._log('updateFcm', 'error', `Failed to update FCM token: ${error.message}`);
            throw error;
        }
    }
}

module.exports = Message;