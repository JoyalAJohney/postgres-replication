const express = require('express');
const Pool = require('pg').Pool;
const redis = require('redis');


const app = express();
const port = 3000;

const masterPool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'masteruser',
    database: 'masterdb',
    password: 'masterpass',
});

const replicaPool = new Pool({
    host: 'localhost',
    port: 5433,
    user: 'masteruser',
    database: 'masterdb',
    password: 'masterpass',

});

const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379,
});

redisClient.on('error', (err) => {
    console.log('Error ' + err);
});    


app.use(express.json());

app.get('/api/write', async (req, res) => {
    try {
        const result = await masterPool.query('INSERT INTO test (id, name) VALUES ($1, $2)', [1, 'Joyal']);
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});


app.get('/api/read', async (req, res) => {
    try {
        const result = await replicaPool.query('SELECT * FROM test');
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});