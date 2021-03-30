const Mongoose = require('mongoose')

// Connect
Mongoose.connect('mongodb://localhost:27017/GlobalClick', {useBewUrlParser: true})
Mongoose.connection.once('open', () => {
    console.log('connection made')
}).on('error', (error) => {
    console.log(error)
})