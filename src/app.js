import express from 'express';
import mongoose from 'mongoose';
import passport from './config/passport.js';
import userRouter from './routes/userRouter.js';
import sessionsRouter from './routes/sessions.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (para later crear public/)
app.use(express.static(path.join(process.cwd(), 'public')));

// Inicializar passport
app.use(passport.initialize());

// Rutas
app.use('/api/users', userRouter);
app.use('/api/sessions', sessionsRouter);

// Root simple
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Conexión a Mongo
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hands_on_labs';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB connected'))
  .catch(err => console.log('DB error', err));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
