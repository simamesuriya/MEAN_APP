const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(`mongodb+srv://seemamesuriya:${process.env.MONGOOSE_PASSWORD}@cluster0.bqwuhtw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => app.listen(5000, () => console.log('connected to database and server is running')))
    .catch((err) => console.log(err));

// Define Routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api', taskRoutes);

app.get('/', (req, res) => {
    res.send('API is running');
});
