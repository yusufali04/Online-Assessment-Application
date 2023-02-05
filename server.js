const express = require("express")
const app = express()
const mongoose = require("mongoose");
var cors = require('cors');
const { json } = require("express");

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'))

app.use(cors())  // Just an API configuration
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
    category: "",
    questions: []
});

const Quiz = mongoose.model('Quiz', quizSchema);

/******** creating results collection to store results of all students *****/

const resultsSchema = new Schema({
    quizId: String,
    studentName: String,
    correct: Number,
    incorrect: Number,
    totalMarks: Number
})

const Result = mongoose.model('Result', resultsSchema);




                                            /***************** API's ***********************/

                                            /*************** API's For Quizzes ************/



// API for sending all quizzes list

app.get("/api/quizzes", (req, res)=>{

    Quiz.find({}, (err, result)=>{
        res.json(result)
    })

})




// API for sending particular quiz by using quiz Id

app.get("/api/quizzes/:quizId", (req, res)=>{

    Quiz.findById(req.params.quizId, (err, result)=>{
        res.json(result)
    })

})


                                        /*************** API's For Questions ************/




// API for sending questions for specific quiz by using quiz id

app.get("/api/questions/:quizId", (req, res)=>{

    Quiz.findById(req.params.quizId, (err, result)=>{
        res.json(result.questions)
    })

})


                                        /*************** API's For Results ************/





// receiving and storing student results in database in results collection

app.post("/api/result", (req, res)=>{

    const body = req.body
    
    const result = new Result({
        quizId: body.quizId,
        studentName: body.studentName,
        correct: body.correct,
        incorrect: body.incorrect,
        totalMarks: body.totalMarks
    })

    result.save()
    res.send('Results are successfully stored')
})





// sending result of a specific quiz by using quiz id

app.get("/api/results/:quizId", (req, res)=>{

    Result.find({quizId: req.params.quizId}, (err, result)=>{
        res.json(result);
    })

})


                                            /*************** API's For Admin ************/



// receiving data and creating a new quiz

app.post("/api/admin/quiz", (req, res)=>{

    const body = req.body
    const quiz = new Quiz({

        category: body.category,
        questions: body.questionsArray

    })

    quiz.save()
    res.end()
})




// update an entire quiz by using the quiz id

app.put("/api/admin/quizzes/:id", (req, res)=>{

    Quiz.findOneAndReplace({_id: req.params.id}, req.body, {upsert: true}, (err, doc)=>{

        if(err){
            res.send(err)
        }
        else{
            res.send("quiz updated successfully")
        }

    })

})





// deleting a specific quiz by using its id

app.delete("/api/admin/quizzes/:id", (req, res)=>{

    Quiz.findByIdAndRemove(req.params.id, (err, deletedDoc)=>{

        if(err){
            res.send(err)
        }
        else{
            res.send("Deleted successfully")
        }

    })

})



// Adding new question to the questions array in the database

app.post("/api/admin/questions/:quizId", (req, res)=>{

    Quiz.findOneAndUpdate({_id: req.params.quizId },  { $push: { questions: req.body } }, (err)=>{

        if(err){
            res.send(err)
        } else{
            res.send("Successfully added the question")
        }

    })

})




// Updating a specific question by using quizId and question id 

app.put("/api/admin/questions/:quizId/:qid", (req, res)=>{

    Quiz.findOneAndUpdate(
        {_id: req.params.quizId,'questions.qid': parseInt(req.params.qid)}, 
        {$set: {
            'questions.$.ques': 'this question is fucked',
            'questions.$.options': ['fuck1', 'fuck2', 'fuck3', 'fuck4'],
            'questions.$.crctOpIndex': 0
        }} ,
        (err, result)=>{
            
            if(err){
                res.send(err)
            } else{
                res.send('Question updated successfully')
            }
        })

})




// deleting a specific question

app.delete("/api/admin/questions/:quizId/:qid", (req, res)=>{

    Quiz.findOneAndUpdate({_id: req.params.quizId }, { $pull: {'questions': {'qid': parseInt(req.params.qid) } } }, {safe: true, multi:true}, (err, result)=>{

        if(err){
            res.send(err)
        } else{
            res.send('Question deleted successfully')
        }

    } )

})


                                            /*************** API's For Instructor ************/


// sending all the results of all quizzes

app.get("/api/instructor/results", (req, res)=>{

    Result.find({}, (err, result)=>{
        res.json(result)
    })

})






// sending results of specific quiz

app.get("/api/instructor/results/:quizId", (req, res)=>{

    Result.find({ quizId: req.params.quizId }, (err, result)=>{
        if(err){
            res.send(err)
        } else {
            res.json(result)
        }
    })

})

















app.listen(3000, ()=>{
    console.log(`server started at port 3000`);
})


