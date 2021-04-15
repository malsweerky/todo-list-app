const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = process.env.PORT || 3000

require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true})
    .then(client => {
        console.log(`Connected to ${dbName} database`)
        db = client.db(dbName)
    })
    .catch(err => {
        console.log(err)
    })

app.set('view engine', 'ejs') //changes the view engine to read ejs files
app.use(express.static('public')) //serves static files in your public folder
app.use(express.urlencoded({extended: true})) // serves data in your static files
app.use(express.json()) // converts data to json format

app.get('/', async (req, res) => {

    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments(
    {completed: false})
    res.render('index.ejs', {item: todoItems, left: itemsLeft})
    // find the todos in the collection "todos" and converts them to a data array
    //counts the documents that has completed marked as false
    //renders ejs file instead of html and assigns data to the item variable
})

app.post('/createTodo', (req, res) => {
    
    //console.log(req.body.todoItem)
    db.collection('todos').insertOne({todo: req.body.todoItem, completed: false}) //takes the data from the todoItem form inside the body of the ejs file
    .then(result => {
        console.log('Todo has been added to the database')
        res.redirect('/') //redirects back to home page after submitting data to database
    })
}) // Whatever the action in the ejs or html form will be the same as the route in the app.post

app.put('/markComplete', (req, res)=> {
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn}, {
        $set: {
            completed: true
        }
    })
    .then(result =>{
        console.log('Marked Complete')
        res.json('Marked Complete')
    })
})

app.put('/undo', (req, res)=> {
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn}, {
        $set: {
            completed: false
        }
    })
    .then(result =>{
        console.log('Marked Complete')
        res.json('Marked Complete')
    })
})

app.delete('/deleteTodo', (req, res) =>{
    db.collection('todos').deleteOne({todo: req.body.rainbowUnicorn})
    .then(result => {
        console.log('Deleted Todo')
        res.json('Deleted It')
    })
    .catch(err => console.log(err))
})

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})