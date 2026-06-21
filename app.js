require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// 404 handler - must come after all other routes
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found – Edu-Edge Academics' });
});

app.listen(PORT, () => {
  console.log(`Edu-Edge running on http://localhost:${PORT}`);
});

module.exports = app;
