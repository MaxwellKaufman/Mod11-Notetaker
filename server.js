const express = require("express");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");

const noteData = require("./db/db.json");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public/notes.html"));
});

app.get("/api/notes", (req, res) => {
  console.log(`${req.method} request received to get notes`);
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Failed to read notes." });
      return;
    }
    try {
      const parsedNotes = JSON.parse(data);
      res.status(200).json(parsedNotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to parse notes data." });
    }
  });
});

app.post("/api/notes", (req, res) => {
  console.info(`${req.method} add note request`);
  const { title, text } = req.body;
  if (!title || !text) {
    res.status(400).json({ error: "Title and text are required." });
    return;
  }
  const newNote = { id: uuid.v4(), title, text };
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to read notes data." });
      return;
    }
    try {
      const parsedNotes = JSON.parse(data);
      parsedNotes.push(newNote);
      fs.writeFile(
        "./db/db.json",
        JSON.stringify(parsedNotes, null, 2),
        (err) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to save note." });
            return;
          }
          console.log("New note added");
          res.status(200).json(newNote);
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to parse notes data." });
    }
  });
});

app.get("/api/notes/:id", (req, res) => {
  const id = req.params.id;
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to read notes data." });
      return;
    }
    try {
      const parsedNotes = JSON.parse(data);
      const foundNote = parsedNotes.find((note) => note.id === id);
      if (!foundNote) {
        res.status(404).json({ error: "Note not found." });
        return;
      }
      res.status(200).json(foundNote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to parse notes data." });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
