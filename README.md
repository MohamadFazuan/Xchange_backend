# **Currency Exchange and User Management API**

Welcome to the **Currency Exchange and User Management API**. This API allows users to register, log in, post ads for currency exchanges, query posted ads, and more. Below is a comprehensive guide on how to use the various API endpoints.

---

### **API Endpoints**

#### 1. **User Registration**
- **Endpoint**: `POST /register`
- **Description**: Allows new users to register with a username, email, password, and wallet ID.
- **Request Body**:
    ```json
    {
      "username": "john_doe",
      "email": "john.doe@example.com",
      "password": "password123",
      "walletId": "wallet12345"
    }
    ```
- **Response**:
    - **Success (201)**:
        ```json
        { "message": "User created successfully" }
        ```
    - **Failure (500)**:
        ```json
        { "message": "Failed to create user" }
        ```

#### 2. **User Login**
- **Endpoint**: `POST /login`
- **Description**: Allows users to log in using their username and password. Returns a JWT token upon successful login.
- **Request Body**:
    ```json
    {
      "username": "john_doe",
      "password": "password123"
    }
    ```
- **Response**:
    - **Success (200)**:
        ```json
        {
          "id": 1,
          "username": "john_doe",
          "email": "john.doe@example.com"
        }
        ```
    - **Failure (401)**:
        ```json
        { "message": "Invalid username or password" }
        ```

#### 3. **Exchange Rate Query**
- **Endpoint**: `POST /exchange-rate`
- **Description**: Retrieves the exchange rate between two currencies.
- **Request Body**:
    ```json
    {
      "fromCurrency": "USD",
      "toCurrency": "EUR"
    }
    ```
- **Response**:
    - **Success (200)**:
        ```json
        { "exchangeRate": 0.85 }
        ```
    - **Failure (500)**:
        ```json
        { "error": "Exchange rate query failed" }
        ```

#### 4. **Post a Currency Exchange Ad**
- **Endpoint**: `POST /postAd`
- **Description**: Allows users to post ads for currency exchanges, including exchange details and payment terms.
- **Request Body**:
    ```json
    {
      "fromCurrency": "USD",
      "fromAmount": 1000,
      "toCurrency": "EUR",
      "toAmount": 850,
      "name": "John Doe",
      "walletId": "wallet12345",
      "fromDate": "2024-11-30T00:00:00Z",
      "toDate": "2024-12-15T00:00:00Z",
      "location": "New York",
      "exchangePayment": "Bank Transfer",
      "taxCharges": 10,
      "serviceFee": 5,
      "total": 865
    }
    ```
- **Response**:
    - **Success (201)**:
        ```json
        { "message": "Ad posted" }
        ```
    - **Failure (500)**:
        ```json
        { "message": "Failed to post" }
        ```

#### 5. **Delete a Post Ad**
- **Endpoint**: `DELETE /postAd/:id`
- **Description**: Allows users to delete a posted ad by specifying the ad's ID.
- **Response**:
    - **Success (201)**:
        ```json
        { "message": "Ad deleted" }
        ```
    - **Failure (500)**:
        ```json
        { "message": "Failed to delete ad" }
        ```

#### 6. **Query All Posted Ads**
- **Endpoint**: `GET /postAd/queryAll`
- **Description**: Retrieves all posted ads for currency exchange.
- **Response**:
    - **Success (200)**:
        ```json
        [
          {
            "id": 1,
            "fromCurrency": "USD",
            "fromAmount": 1000,
            "toCurrency": "EUR",
            "toAmount": 850,
            "location": "New York"
          },
          {
            "id": 2,
            "fromCurrency": "GBP",
            "fromAmount": 500,
            "toCurrency": "USD",
            "toAmount": 650,
            "location": "London"
          }
        ]
        ```
    - **Failure (500)**:
        ```json
        { "message": "Failed to find ads" }
        ```

#### 7. **Query Ads by Exchange**
- **Endpoint**: `POST /postAd/querybyExchange`
- **Description**: Queries ads based on the currency exchange (from and to currencies).
- **Request Body**:
    ```json
    {
      "from": "USD",
      "to": "EUR"
    }
    ```
- **Response**:
    - **Success (200)**:
        ```json
        [
          {
            "id": 1,
            "fromCurrency": "USD",
            "fromAmount": 1000,
            "toCurrency": "EUR",
            "toAmount": 850,
            "location": "New York"
          }
        ]
        ```
    - **Failure (500)**:
        ```json
        { "message": "Failed to find ads" }
        ```

#### 8. **Query Post Ad by ID**
- **Endpoint**: `GET /postAd/querybyId`
- **Description**: Retrieves a specific posted ad by its ID.
- **Request Query**:
    ```bash
    /postAd/querybyId?id=1
    ```
- **Response**:
    - **Success (200)**:
        ```json
        {
          "id": 1,
          "fromCurrency": "USD",
          "fromAmount": 1000,
          "toCurrency": "EUR",
          "toAmount": 850,
          "location": "New York"
        }
        ```
    - **Failure (500)**:
        ```json
        { "message": "Failed to find ad" }
        ```

#### 9. **Friends Query (Example Route)**
- **Endpoint**: `GET /friends/queryAll`
- **Description**: Retrieves all friends (just a placeholder route in the example).
- **Response**:
    - **Success (200)**:
        ```json
        [
          { "friendId": 1, "name": "John Doe" },
          { "friendId": 2, "name": "Jane Smith" }
        ]
        ```
    - **Failure (500)**:
        ```json
        { "message": "Failed to find friends" }
        ```

---

### **Installation and Setup**

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/currency-exchange-api.git
    cd currency-exchange-api
    ```

2. **Install Dependencies**:
   Ensure you have Node.js installed, then run:
    ```bash
    npm install
    ```

3. **Configure Environment Variables**:
   - Create a `.env` file in the root of the project and define the required environment variables:
     ```dotenv
     MYSQL_ROOT_PASSWORD=rootpassword
     DB_NAME=userdata
     DB_USER=root
     DB_PASSWORD=password
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRES=1h
     RATE_API_KEY=your_exchange_api_key
     ```

4. **Start the Application**:
    Run the following command to start the Express server:
    ```bash
    npm start
    ```

    The server will be running on `http://localhost:3000`.

---

### **License**

This project is licensed under the MIT License.

---

This README provides all the necessary information to get started with the **Currency Exchange and User Management API**, including endpoint usage, installation, and configuration.