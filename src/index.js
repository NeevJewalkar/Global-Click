const MongoClient  = require("mongodb").MongoClient;
const mongo = require('mongodb');
const express = require("express")
const bodyParser = require('body-parser')
const validator = require('validator');

let app = express()
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const url = 'mongodb://localhost:27017/GlobalClick'
const len = 10

const client = new MongoClient(url, { useUnifiedTopology: true } );

app.get('/addUser', (req, res) => {
    res.render('Sign')
})

app.post('/addUser', (req, res) => {
    client.connect((err, db) => {
        let sorted = []
        const dbo = db.db('GlobalClick');
        let collection = dbo.collection('UserInfo')
        collection.find({User: req.body.username}).toArray((err, docs) => {
            console.log(req.body.username === '' || req.body.email === '')
            if (req.body.username === '' || req.body.email === '' == false) {
                if (docs[0] === undefined) {
                    if (validator.isEmail(req.body.email)) {
                        let format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
                        if (format.test(req.body.username.contains) == false) {
                            insert(dbo, 'UserInfo', {'_id': makeid(len), User: req.body.username, Email: req.body.email, Clicks: 0, Rank: 65}, () => {
                                collection.find({}).toArray((err, docs) => {
                                    sort(docs).forEach(doc => {
                                        sorted.push({User: doc.User, Clicks: doc.Clicks})
                                    })
                                    let rank = sort(sorted).findIndex(usr=> usr.User===req.body.username)
                                    console.log(rank)
                                    collection.updateMany({User: req.body.username, Email: req.body.email}, {$set: {User: req.body.username, Email: req.body.email, Rank: rank}})
                                })
                                console.log('done,', req.body.username)
                                
                                collection.find({User: req.body.username}).toArray((err, docs) => {
                                    console.log(docs[0]._id)
                                    res.render('AuthKey', {key: docs[0]._id})
                                })
                            })
                        } else {
                            res.json('username contains special chars')
                        }
                    } else {
                        res.json('wrong email')
                    }
                } else {
                    res.json("User Taken")
                }
            } else {
                res.json('name or pass fields cannot be empty')
            }
        })
    });
})

app.get('/key/:auth', (req, res) => {
    client.connect((err, db) => {
        const dbo = db.db('GlobalClick');
        let collection = dbo.collection('UserInfo')
        collection.find({'_id': req.params.auth}).toArray((err, docs) => {
            console.log(docs)
            res.render('AuthInfo', {user: docs[0].User})
        })
    })
})

app.get('/:auth/click', (req, res) => {
    client.connect((err, db) => {
        const dbo = db.db('GlobalClick');
        let collection = dbo.collection('UserInfo')
        let sorted=[]
        collection.find({'_id': req.params.auth}).toArray((err, docs) => {
            collection.updateOne({'_id': req.params.auth}, {$set: {Clicks: docs[0].Clicks + 1}})
            .then((obj) => {
                collection.find({}).toArray((err, docs) => {
                    sort(docs).forEach(doc => {
                        sorted.push({User: doc.User, Clicks: doc.Clicks})
                    })
                    let rank = sorted.reverse().findIndex(usr=> {
                        usr.User === req.body.username
                    })
                    console.log(rank, sorted)
                    collection.updateMany({User: req.body.username, Email: req.body.email}, {$set: {User: req.body.username, Email: req.body.email, Rank: rank}})
                })
                res.json('clicked!')
            })
        })
    })
})

app.get('/:auth/info', (req, res) => {
    client.connect((err, db) => {
        const dbo = db.db('GlobalClick');
        let collection = dbo.collection('UserInfo')
        collection.find({'_id': req.params.auth}).toArray((err, docs) => {
            if (docs != []) {
                res.json({User: docs[0].User, Clicks: docs[0].Clicks})
            } else {
                res.json('not found')
            }
        })
    })
})

app.get('/Users/:Usern/info', (req, res) => {
    client.connect((err, db) => {
        const dbo = db.db('GlobalClick');
        let collection = dbo.collection('UserInfo')
        collection.find({'User': req.params.Usern}).toArray((err, docs) => {
            if (docs != []) {
                res.json({User: docs[0].User, Clicks: docs[0].Clicks})
            } else {
                res.json('not found')
            }
        })
    })
})

app.get('/rank', (req, res) => {
    client.connect((err, db) => {
        let sorted = []
        const dbo = db.db('GlobalClick');
        let collection = dbo.collection('UserInfo')
        collection.find({}).toArray((err, docs) => {
            sort(docs).forEach(doc => {
                sorted.push({User: doc.User, Clicks: doc.Clicks})
            })
            res.json(sort(sorted).reverse())
        })
    })
})

app.get('/main', (req, res) => {
    client.connect((err, db) => {
        let total = 0
        let ClicksArr = []
        let UserArr = []
        const dbo = db.db('GlobalClick');
        let collection = dbo.collection('UserInfo')
        collection.find({}).toArray((err, docs) => {
            docs.forEach((doc) => {
                total += doc.Clicks
                ClicksArr.push(doc.Clicks)
                UserArr.push(doc.User)
            })
            res.json({"Global Clicks": total, "Top_User": {"Clicks": Math.max(...ClicksArr), "User": UserArr[ClicksArr.indexOf(Math.max(...ClicksArr))]}})
        })
    })
})

let makeid = length => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

let insert = (db, collectionName, data, callback) => {
    const collection = db.collection(collectionName);
    collection.insertOne(data, (err, result) => {
        if (err) {throw err;}
        callback();
    });
};

let sort = array => {
    const arr = Array.from(array);
    for (let i = 1; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i; j++) {
        if (arr[j].Clicks > arr[j + 1].Clicks) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    return arr;
};

let getPass = (id, collection) => {
    collection.find({Key: id}).toArray((err, docs) => {
        return docs[0].Pass
    })
}

let getKey = (collection) => {
    collection.find({}).toArray((err, docs) => {
        return docs[0].Key
    })
}

app.listen(4040)