import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes.js';


const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

app.use('/api', routes);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
