const express = require('express');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const { testDB } = config;

mongoose.connect(testDB);

app.prepare()
  .then(() => {
    const server = express();

    server.get('/a', (req, res) => app.render(req, res, '/b', req.query));

    server.get('/b', (req, res) => app.render(req, res, '/a', req.query));

    server.get('/posts/:id', (req, res) => app.render(req, res, '/posts', { id: req.params.id }));

    server.get('*', (req, res) => handle(req, res));
    server.use(bodyParser.urlencoded({ extended: false }));
    server.use(bodyParser.json());
    server.use(morgan('dev'));

    server.use('/api', [
      authRoutes,
      userRoutes,
    ]);

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`)
    });
  });
