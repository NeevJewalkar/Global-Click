const MongoClient  = require("mongodb").MongoClient;
const express = require("express")
const bodyParser = require('body-parser')

let app = express()
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const url = 'mongodb://localhost:27017'

const client = new MongoClient(url);

app.get('/addUser', (req, res) => {
    res.render('Sign')
})
client.connect(err => {
    const db = client.db('GlobalClick');
});

let insert = (db, collectionName, data, callback) => {
    const collection = db.collection(collectionName);
    collection.insertMany(data, (err, result) => {
        callback(result);
    });
};

let getData = (db, collectionName, fetchName, callback) => {
    const collection = db.collection(collectionName);
    collection.find(fetchName, (err, docs) => {
        callback(docs)
    })
};