const assert = require('assert');
const sinon = require('sinon');
const axios = require('axios');
const Message = require('../models/message');
const config = require('../config');

describe('Message', () => {
    describe('sendMessage', () => {
        let message;
        let connectionStub;
        let axiosStub;

        beforeEach(() => {
            message = new Message();
            connectionStub = {
                execute: sinon.stub()
            };
            message.connect = sinon.stub().resolves();
            message.connection = connectionStub;
            axiosStub = sinon.stub(axios, 'post');
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should successfully send a message', async () => {
            // Arrange
            const fcmToken = 'test-token';
            connectionStub.execute.resolves([[{ fcm_token: fcmToken }]]);
            axiosStub.resolves({ data: { success: true } });

            // Act
            const result = await message.sendMessage('testUser', 'Hello!');

            // Assert
            assert.strictEqual(result, true);
            assert(connectionStub.execute.calledOnce);
            assert(axiosStub.calledWith(
                'https://fcm.googleapis.com/fcm/send',
                {
                    to: fcmToken,
                    notification: {
                        title: 'Lets Xchange!',
                        body: 'Hello!'
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `key=${config.fcm.serverKey}`
                    }
                }
            ));
        });

        it('should return false when database query fails', async () => {
            // Arrange
            connectionStub.execute.rejects(new Error('Database error'));

            // Act
            const result = await message.sendMessage('testUser', 'Hello!');

            // Assert
            assert.strictEqual(result, false);
        });

        it('should return false when FCM API call fails', async () => {
            // Arrange
            connectionStub.execute.resolves([[{ fcm_token: 'test-token' }]]);
            axiosStub.rejects(new Error('FCM API error'));

            // Act
            const result = await message.sendMessage('testUser', 'Hello!');

            // Assert
            assert.strictEqual(result, false);
        });

        it('should return false when recipient not found', async () => {
            // Arrange
            connectionStub.execute.resolves([[]]);

            // Act
            const result = await message.sendMessage('nonexistentUser', 'Hello!');

            // Assert
            assert.strictEqual(result, false);
        });
    });
});