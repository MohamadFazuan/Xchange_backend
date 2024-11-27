module.exports = {
  db: {
    host: localhost,
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'userdata'
  },
  jwt: {
    secret: 'xchange',
    expires: '1h'
  },
  bcrypt: {
    saltRounds: 10,
    password: 'xchange'
  },
  rate:{
    apiKey: "d3a701e5289298041b2e6670"
  }
};