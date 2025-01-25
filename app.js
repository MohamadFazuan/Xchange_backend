const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/users');
const PostAd = require('./models/postAd');
const Transaction = require('./models/transaction');
const Message = require('./models/message');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const config = require('./config');

app.post('/register', async (req, res) => {
  const { username, email, password, walletId, fcmToken } = req.body;
  try {
    const user = new User();
    const registered = await user.register(username, email, password, walletId, fcmToken);
    if (registered) {
      res.status(201).send({ message: 'User created successfully' });
    } else {
      res.status(500).send({ message: 'Failed to create user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to create user' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User();
    const userFound = await user.login(username, password);
    if (userFound) {
      const token = jwt.sign({ userId: userFound.id }, config.jwt.secret, {
        expiresIn: config.jwt.expires
      });
      res.send(userFound);
    } else {
      res.status(401).send({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = new User();
    const registered = await user.register(username, email, password);
    if (registered) {
      res.status(201).send({ message: 'User created successfully' });
    } else {
      res.status(500).send({ message: 'Failed to create user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to create user' });
  }
});

app.post('/exchange-rate', async (req, res) => {
  const { fromCurrency, toCurrency } = req.body;
  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${config.rate.apiKey}/pair/${fromCurrency}/${toCurrency}`);
    const exchangeRate = response.data.conversion_rate;
    res.json({ exchangeRate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

// Add a new post ad
app.post('/postAd', async (req, res) => {
  const {
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
  } = req.body;

  try {
    const post = new PostAd();
    const posted = await post.add(
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
      total);
    if (posted) {
      res.status(201).send({ message: 'Ad posted' });
    } else {
      res.status(500).send({ message: 'Failed to post' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
});

// Delete a post ad
app.delete('/postAd/:id', (req, res) => {
  const id = req.params.id;

  try {
    const post = new PostAd();
    const deleted = post.delete(id);
    if (deleted) {
      res.status(201).send({ message: 'Ad deleted' });
    } else {
      res.status(500).send({ message: 'Failed to delete ad' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

// Query all posted ad
app.get('/postAd/queryAll', async (req, res) => {

  try {
    const post = new PostAd();
    const query = await post.queryAll();

    if (query) {
      res.status(201).json(query);
    } else {
      res.status(500).send({ message: 'Failed to find ad' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

// Query post by exchange
app.post('/postAd/querybyExchange', async (req, res) => {
  const from = req.body.from;
  const to = req.body.to;
  const minAmount = req.body.minAmount;
  const maxAmount = req.body.maxAmount;

  try {
    const post = new PostAd();
    const query = await post.queryByExchange(from, to, minAmount, maxAmount);

    if (query) {
      res.status(201).json(query);
    } else {
      res.status(500).send({ message: 'Failed to find ad' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

app.get('/postAd/querybyId/', async (req, res) => {
  var id = req.query.id

  try {
    const post = new PostAd();
    const query = await post.queryById(id);

    if (query) {
      res.status(200).json(query);
    } else {
      res.status(500).send({ message: 'Failed to find ad' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

app.post('/postAd/delete', async (req, res) => {
  var id = req.body.id

  try {
    const post = new PostAd();
    const query = await post.delete(id);

    if (query) {
      res.status(200).json(query);
    } else {
      res.status(500).send({ message: 'Failed to find ad' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

app.get('/users', async (req, res) => {
  try {
    const user = new User();
    const query = await user.getAllUsers();

    if (query) {
      res.status(200).json(query);
    } else {
      res.status(500).send({ message: 'Failed to find ad' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

app.post('/transaction/add', async (req, res) => {
  const {
    from, to, fromAmount, toAmount, fromCurrency, toCurrency,
  } = req.body;

  try {
    const tx = new Transaction();
    const posted = await tx.add(
      from, to, fromAmount, toAmount, fromCurrency, toCurrency);
    if (posted) {
      res.status(201).send({ message: 'Transaction Added' });
    } else {
      res.status(500).send({ message: 'Failed to add transaction' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
});

app.post('/transaction/query', async (req, res) => {
  const walletId = req.body.walletId

  try {
    const tx = new Transaction();
    const query = await tx.query(walletId);
    if (query) {
      res.status(201).json(query);
    } else {
      res.status(500).send({ message: 'Failed to query' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
});

app.post('/send-message', async (req, res) => {
  const { to, title, body, dataQr } = req.body;

  try {
    const messages = new Message();
    const sendMessage = messages.sendNotification(to, title, body, dataQr);

    if (sendMessage) {
      res.status(200).json({
        message: 'Message sent successfully',
        data: sendMessage
      });
    } else {
      res.status(500).send({ message: 'Failed to send message' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

app.post('/update-fcm-token', async (req, res) => {
  const { username, newFcmToken } = req.body;

  try {
    const message = new Message();
    const updated = await message.updateFcm(username, newFcmToken);
    if (updated) {
      res.status(201).send({ message: 'Fcm token updated' });
    } else {
      res.status(500).send({ message: 'Failed to update fcm token' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});