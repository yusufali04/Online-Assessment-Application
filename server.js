const express = require("express")
const app = express()
const mongoose = require("mongoose");
var cors = require('cors');
const { json } = require("express");
const bcrypt = require('bcrypt')

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
        userId: body.userId,
        studentName: body.studentName,
        correct: body.correct,
        incorrect: body.incorrect,
        totalMarks: body.totalMarks
    })

    result.save()
    res.json({message: 'Results are successfully stored'})
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
    res.send({message: 'success'})
})




// update an entire quiz by using the quiz id

app.put("/api/admin/quizzes/:id", (req, res)=>{

    Quiz.findOneAndReplace({_id: req.params.id}, req.body, {upsert: true}, (err, doc)=>{

        if(err){
            res.send({err: err})
        }
        else{
            res.send({message: "quiz updated successfully"})
        }

    })

})





// deleting a specific quiz by using its id

app.delete("/api/admin/quizzes/:id", (req, res)=>{

    Quiz.findByIdAndRemove(req.params.id, (err, deletedDoc)=>{

        if(err){
            res.send({err: err})
        }
        else{
            res.send({message: "Deleted successfully"})
        }

    })

})



// Adding new question to the questions array in the database

app.post("/api/admin/questions/:quizId", (req, res)=>{

    Quiz.findOneAndUpdate({_id: req.params.quizId },  { $push: { questions: req.body } }, (err)=>{

        if(err){
            res.send({err: err})
        } else{
            res.send({message: "Successfully added the question"})
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
                res.send({err: err})
            } else{
                res.send({message: 'Question updated successfully'})
            }
        })

})




// deleting a specific question

app.delete("/api/admin/questions/:quizId/:qid", (req, res)=>{

    Quiz.findOneAndUpdate({_id: req.params.quizId }, { $pull: {'questions': {'qid': parseInt(req.params.qid) } } }, {safe: true, multi:true}, (err, result)=>{

        if(err){
            res.send({err: err})
        } else{
            res.send({message: 'Question deleted successfully'})
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
            res.send({err: err})
        } else {
            res.json(result)
        }
    })

})




                                        /*************** API's For Login And Registration ************/


// creating a user

app.post('/api/user', async (req, res)=>{

    const body = req.body
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    User.findOne({email: body.email}, (err, result)=>{

        if(err){
            res.json({err: 'something went wrong, Please try again...'})
        }
        if(result){
            res.json({err: 'Account with the given email already exists'})
        }
        else{

            const user = new User({
                username: body.username,
                email: body.email,
                password: hashedPassword,
                role: body.role
            })
        
            user.save().then((savedUser)=>{
        
                res.json({message: 'Registered Successfully', userId: savedUser._id})
        
            }).catch((err)=>{
        
                res.json({err: 'Account with the given email already exists'})
                
            })

        }

    })

    

})

// logging in existing user

app.post("/api/users/login", (req, res)=>{

    const body = req.body;

    User.findOne({ email: body.email }, (err, result)=>{

        if(!result){

            res.send({ authenticated: false, err: 'Account does not exists' })

        }

        bcrypt.compare(body.password, result.password).then((match)=>{

            if(match){
                res.send({authenticated: true, user: result.username, email: result.email, userId: result._id})
            }
            else{
                res.send({authenticated: null, err: 'Username or password is incorrect'})
            }

        })

    })

})


// Delete a specific user by user id

app.delete('/api/users/:userId', (req, res)=>{

    body = req.body;
    
    User.findOneAndDelete({_id: req.params.userId}, (err, result)=>{

        if(result){
            res.json({message: 'Deleted successfully'})
        } 
        else {
            res.json({err: 'User does not exist'})
        }
        if(err){
            res.json({err: err})
        }

    })

})









app.listen(3000, ()=>{
    console.log(`server started at port 3000`);
})


