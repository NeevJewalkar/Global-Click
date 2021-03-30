const MongoClient  = require("mongodb").MongoClient;
const mongo = require('mongodb');
const express = require("express")
const bodyParser = require('body-parser')

let app = express()
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const url = 'mongodb://localhost:27017/GlobalClick'

const client = new MongoClient(url, { useUnifiedTopology: true } );

app.get('/addUser', (req, res) => {
    res.render('Sign')
})

app.post('/addUser', (req, res) => {
    client.connect((err, db) => {
        const dbo = db.db('GlobalClick');
        insert(dbo, 'UserInfo', {User: req.body.username, Email: req.body.email}, () => {
            console.log('done,', req.body.username)
            let collection = dbo.collection('UserInfo')
            collection.find({User: req.body.username}).toArray((err, docs) => {
                console.log(docs[0]._id)
                res.render('AuthKey', {key: docs[0]._id})
            })
        })
    });
})

app.get('/:auth', (req, res) => {
    client.connect((err, db) => {
        const dbo = db.db('GlobalClick');
        let collection = dbo.collection('UserInfo')
        collection.find({'_id': new mongo.ObjectID(req.params.auth)}).toArray((err, docs) => {
            console.log(docs)
            res.render('AuthInfo', {user: docs[0].User})
        })
    })
})

let insert = (db, collectionName, data, callback) => {
    const collection = db.collection(collectionName);
    collection.insertOne(data, (err, result) => {
        if (err) {throw err;}
        callback();
    });
};

app.listen(4040)