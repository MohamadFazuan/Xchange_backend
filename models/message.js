const config = require('../config.js');
const axios = require('axios');
const mysql = require('mysql2/promise');
const fs = require('fs');
const { google } = require('googleapis');

class Message {
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
            return accessToken;
        } catch (error) {
            console.error('Error fetching OAuth token:', error.message);
            return false
        }
    }

    async sendNotification(to, message) {
        try {
            const accessToken = await this.getOAuthToken();
            const query = 'SELECT fcm_token FROM users WHERE username = ?';
            const values = [to]
            const deviceToken = '';
            const title = "Let's Exchange";


            try {
                await this.connect();
                const [rows] = await this.connection.execute(query, values);

                if (!rows.length || !rows[0].fcm_token) {
                    console.error(`No FCM token found for user: ${to}`);
                    return res.status(404).json({ error: 'No FCM token found for user' });
                }

                deviceToken = rows[0].fcm_token;

            } catch (error) {
                console.log(error);
                
            }

            const url = `https://fcm.googleapis.com/v1/projects/${process.env.PROJECT_ID}/messages:send`;
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            };

            const payload = {
                message: {
                    token: deviceToken,
                    notification: {
                        title,
                        message,
                    },
                },
            };

            const response = await axios.post(url, payload, { headers });
            if (response.status === 200) {
                console.log('Push notification sent successfully');
                return true;
            } else {
                console.error('Failed to send push notification:', response.data);
                return false;
            }
        } catch (error) {
            console.error('Error sending push notification:', error.message);
            return false;
        }
    }

    async updateFcm(username, newFcmToken) {
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
                return result.affectedRows > 0;
            } catch (error) {
                console.error(error);
                return [];
            }
        } catch (error) {
            console.error('Error updating FCM token:', error);
            throw error;
        }
    }
}

module.exports = Message;