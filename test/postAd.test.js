const assert = require('assert');
const sinon = require('sinon');
const PostAd = require('../models/postAd');

describe('PostAd', () => {
    describe('queryByExchange', () => {
        let postAd;
        let connectionStub;

        beforeEach(() => {
            postAd = new PostAd();
            connectionStub = {
                execute: sinon.stub()
            };
            postAd.connect = sinon.stub().resolves();
            postAd.connection = connectionStub;
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should find posts with sufficient exchange amounts', async () => {
            // Arrange
            const expectedQuery = `
                SELECT * 
                FROM post 
                WHERE 
                    (from_currency = ? AND to_currency = ? AND to_amount >= ?) 
                    OR 
                    (from_currency = ? AND to_currency = ? AND from_amount >= ?)
            `;
            connectionStub.execute.resolves([[]]);

            // Act
            await postAd.queryByExchange('USD', 'MYR', 100, 500);

            // Assert
            assert(connectionStub.execute.calledWith(
                expectedQuery,
                ['USD', 'MYR', 100, 'MYR', 'USD', 100]
            ));
        });

        it('should return matching posts with sufficient amounts', async () => {
            // Arrange
            const mockPosts = [{
                id: 1,
                from_currency: 'USD',
                to_currency: 'MYR',
                from_amount: 200,
                to_amount: 800,
            }];
            connectionStub.execute.resolves([mockPosts]);

            // Act
            const result = await postAd.queryByExchange('USD', 'MYR', 100, 1000);

            // Assert
            assert.deepStrictEqual(result, mockPosts);
        });
    });
});