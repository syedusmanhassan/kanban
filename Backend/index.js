import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Card from "./models/card.js";
import User from "./models/user.js";
import bcrypt from 'bcrypt';
import Board from "./models/board.js";
import { connectDB } from './config/db.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from "path"
import { fileURLToPath } from 'url';



dotenv.config();

const secretKey = process.env.SECRET_KEY;
const saltRounds = 10;

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../Fronend/dist')));


mongoose.connection.once('open', async () => {
  try {
    await mongoose.connection.collection('users').dropIndex('teamName_1');
    console.log('Successfully dropped teamName index');
  } catch (err) {
    console.log('Error dropping index or index does not exist:', err.message);
  }
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Fronend/dist/index.html'));
});

app.get("/", async(req, res) => {
  try {
    const { teamName } = req.query;
    console.log("GET request for cards with teamName:", teamName);
    
    if (!teamName) {
      console.log("No teamName provided in request");
      return res.status(400).json({ error: "Team name is required" });
    }
    
    const board = await Board.findOne({ name: teamName });
    console.log("Found board:", board);
    
    if (!board) {
      console.log("No board found with name:", teamName);
      return res.status(404).json({ error: "Team not found" });
    }
    
    const cards = await Card.find({ board: board._id });
    console.log("Board ID being queried:", board._id);
    console.log("Found cards:", cards);
    
    if (cards.length === 0) {
      console.log("No cards found with board ID. Trying alternate approach...");
      // Try by using board's cards array
      const populatedBoard = await Board.findById(board._id).populate('cards');
      const cardsFromBoard = populatedBoard.cards || [];
      console.log("Cards from board populate:", cardsFromBoard);
      res.json(cardsFromBoard);
    } else {
      res.json(cards);
    }
  } catch(err) {
    console.error("Error in GET /:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/signup", async (req, res) => {
  const { email, password, teamName } = req.body;
  console.log(email, password, teamName);

  try {
    
    if (!email || !password || !teamName) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        error: "Email already registered. Please try logging in.",
        emailExists: true,
      });
    }

    
    let board = await Board.findOne({ name: teamName });
    const isNewTeam = !board;


    if (isNewTeam) {
      board = new Board({ name: teamName });
      await board.save();
    }

    
    const hashPassword = await bcrypt.hash(password, saltRounds);


    const newUser = new User({
      email,
      password: hashPassword,
      board: board._id 
    });

    
    await newUser.save();

    
    const token = jwt.sign(
      { 
        id: newUser._id, 
        email: newUser.email, 
        boardId: board._id,
        teamName: board.name 
      },
      secretKey,
      { expiresIn: '1h' }
    );


    return res.status(201).json({
      message: isNewTeam 
        ? "User created successfully, new team created" 
        : "User created successfully, joined existing team",
      teamName: board.name,
      boardId: board._id,
      token,
      user: {
        id: newUser._id,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    
    const user = await User.findOne({ email }).populate('board');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
   
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

  
    const teamName = user.board ? user.board.name : null;
    const boardId = user.board ? user.board._id : null;

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        boardId, 
        teamName 
      },
      secretKey,
      { expiresIn: '1h' } 
    );

    res.status(200).json({ 
      message: 'Login successful', 
      teamName,
      boardId,
      token,
      user: {
        id: user._id,
        email: user.email
      } 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/board/:id", async(req, res) => {
  try {
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    
    const board = await Board.findById(user.board).populate('cards');
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.status(200).json(board);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/', async (req, res) => {
  try {
    const { title, column, teamName } = req.body;
    console.log("POST request body:", req.body);
    console.log("Creating card for team:", teamName);

    const board = await Board.findOne({ name: teamName });
    console.log("Found board:", board);
    
    if (!board) {
      console.log("No board found with name:", teamName);
      return res.status(404).json({ message: 'Team not found' });
    }

    
    const card = new Card({
      title,
      column,
      board: board._id  
    });
    console.log("New card created:", card);

    const savedCard = await card.save();
    console.log("Card saved to database:", savedCard);
    
    
    await Board.findByIdAndUpdate(
      board._id,
      { $push: { cards: savedCard._id } }
    );
    console.log("Card added to board's cards array");
    
    res.status(201).json(savedCard);
  } catch (err) {
    console.error("Error in POST /:", err);
    res.status(400).json({ message: err.message });
  }
});



  app.patch('/:id', async (req, res) => {
    const { title, column } = req.body;
    console.log(req.body);
    try {
      const card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
      console.log(card);
      if (!card) return res.status(404).json({ message: 'Card not found' });
      res.json(card);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete('/:id', async (req, res) => {
    try {
      // First find the card to get the board reference
      const card = await Card.findById(req.params.id);
      
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }
      
      console.log("Found card to delete:", card);
      console.log("Card's board ID:", card.board);
      
      // Delete the card from the board's cards array
      if (card.board) {
        const updateResult = await Board.findByIdAndUpdate(
          card.board,
          { $pull: { cards: req.params.id } },
          { new: true } // Return the updated document
        );
        
        console.log("Board after removing card:", updateResult);
        
        if (!updateResult) {
          console.log("Board not found when trying to remove card reference");
        }
      } else {
        console.log("Card has no board reference");
      }
      
      // Delete the card itself
      const deleteResult = await Card.findByIdAndDelete(req.params.id);
      console.log("Card delete result:", deleteResult);
      
      res.json({ message: 'Card deleted successfully' });
    } catch (err) {
      console.error("Error deleting card:", err);
      res.status(500).json({ message: err.message });
    }
  });
  
app.listen(port , ()=>{
    console.log(`Server is running on port ${port}`);
})
