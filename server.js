const express = require("express")
const app = express()
const mongoose = require("mongoose");

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'))


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

/******** creating quizzes collection *****/

const Schema = mongoose.Schema;

const quizSchema = new Schema({
    category: "",
    questions: []
});

const quiz = mongoose.model('Quiz', quizSchema);


/***************** API's ***********************/

// API for sending questions

app.get("/api/questions/:quizId", (req, res)=>{

    quiz.findById(req.params.quizId, (err, result)=>{
        res.json(result.questions)
    })

})

// API for sending all quizzes

app.get("/api/quizzes", (req, res)=>{

    quiz.find({}, (err, result)=>{
        res.json(result)
    })

})

// API for sending particular quiz

app.get("/api/quizzes/:quizId", (req, res)=>{

    quiz.findById(req.params.quizId, (err, result)=>{
        res.json(result)
    })

})














app.listen(3000, ()=>{
    console.log(`server started at port 3000`);
})


