const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json()); 

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, img TEXT, summary TEXT)");

  const stmt = db.prepare("INSERT INTO books (name, img, summary) VALUES (?, ?, ?)");

  const books = [
    {
      name: "Harry Potter and the Order of the Phoenix",
      img: "https://bit.ly/2IcnSwz",
      summary: "Harry Potter and Dumbledore's warning about the return of Lord Voldemort is not heeded by the wizard authorities who, in turn, look to undermine Dumbledore's authority at Hogwarts and discredit Harry."
    },
    {
      name: "The Lord of the Rings: The Fellowship of the Ring",
      img: "https://bit.ly/2tC1Lcg",
      summary: "A young hobbit, Frodo, who has found the One Ring that belongs to the Dark Lord Sauron, begins his journey with eight companions to Mount Doom, the only place where it can be destroyed."
    },
    {
      name: "Avengers: Endgame",
      img: "https://bit.ly/2Pzczlb",
      summary: "Adrift in space with no food or water, Tony Stark sends a message to Pepper Potts as his oxygen supply starts to dwindle. Meanwhile, the remaining Avengers -- Thor, Black Widow, Captain America, and Bruce Banner -- must figure out a way to bring back their vanquished allies for an epic showdown with Thanos -- the evil demigod who decimated the planet and the universe."
    }
  ];

  books.forEach(book => {
    stmt.run(book.name, book.img, book.summary);
  });

  stmt.finalize();
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = db;


const db = require('./server.js'); // Import the database

// CREATE
app.post('/books', (req, res) => {
  const { name, img, summary } = req.body;
  db.run('INSERT INTO books (name, img, summary) VALUES (?, ?, ?)', [name, img, summary], function(err) {
    if (err) {
      return res.status(400).send(err.message);
    }
    res.status(201).send({ id: this.lastID });
  });
});

// READ all
app.get('/books', (req, res) => {
  db.all('SELECT * FROM books', [], (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(200).json(rows);
  });
});

// READ one by ID
app.get('/books/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (!row) {
      return res.status(404).send('Book not found');
    }
    res.status(200).json(row);
  });
});

// UPDATE
app.patch('/books/:id', (req, res) => {
  const { id } = req.params;
  const { name, img, summary } = req.body;
  db.run('UPDATE books SET name = ?, img = ?, summary = ? WHERE id = ?', [name, img, summary, id], function(err) {
    if (err) {
      return res.status(400).send(err.message);
    }
    if (this.changes === 0) {
      return res.status(404).send('Book not found');
    }
    res.status(200).send('Book updated');
  });
});

// DELETE
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM books WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (this.changes === 0) {
      return res.status(404).send('Book not found');
    }
    res.status(200).send('Book deleted');
  });
});

