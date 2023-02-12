const express = require("express")
const app = express()
const mongoose = require("mongoose");
var cors = require('cors');
const { json } = require("express");
const bcrypt = require('bcrypt')
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");


app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'))

app.use(cors())  // Just an API configuration


// setting template engine

app.use(expressLayout)
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');



////////// database Connection ////////////////


mongoose.connect('mongodb://localhost:27017/quiz', {useNewUrlParser: true });

const connection=mongoose.connection;

connection.once('open',(err) => {

    if(!err){
    console.log('Database connected');
    }
    else{
        console.log('Database connection failed');
    }

});

const Schema = mongoose.Schema;

/******** creating quizzes collection *****/

const quizSchema = new Schema({
    title: String,
    description: String,
    toughness: String,
    questions: []
});

const Quiz = mongoose.model('Quiz', quizSchema);

/******** creating results collection to store results of all students *****/

const resultsSchema = new Schema({
    quizId: String,
    userId: String,
    studentName: String,
    correct: Number,
    incorrect: Number,
    totalMarks: Number
})

const Result = mongoose.model('Result', resultsSchema);


/******** creating users collection to store registered users *****/

const usersSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String, default: "student"}
})

const User = mongoose.model('user', usersSchema);






// Routes

app.get("/", (req, res)=>{

    Quiz.find({}, (err, result)=>{
        res.render("home", {quizzes: result})
    })
    
})

app.get("/quizzes/:quizId", (req, res)=>{

    Quiz.findById(req.params.quizId, (err, result)=>{
        res.render("quiz", {questions: result.questions})
    })

})








app.listen(3000, ()=>{
    console.log(`server started at port 3000`);
})


