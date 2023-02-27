const express = require("express")
const app = express()
const mongoose = require("mongoose");
var cors = require('cors');
const { json } = require("express");
const bcrypt = require('bcrypt')
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");
const flash = require('express-flash');
const MongoStore = require('connect-mongo');


app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'))

app.use(cors())  // Just an API configuration


// setting template engine

app.use(expressLayout)
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');




/*************************** Session store in database ********************************/

let sessionStore = MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/quiz',
    collection: 'sessions'
});

// creating cookie for passport

app.use(session({
    secret: 'thisIsSecret',
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    // cookie: {expires: 30000}
}));

app.use(flash());

/************** passport config ******************/


app.use(passport.initialize());
app.use(passport.session());

// global middleware

app.use((req,res,next)=>{

    res.locals.session = req.session;
    res.locals.user = req.user;
    next();

})






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
    unAttempted: Number,
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






// GET Routes

app.get("/register", (req, res)=>{
    res.render("register")
})

app.get("/login", (req, res)=>{
    res.render("login")
})

app.get("/", (req, res)=>{

    Quiz.find({}, (err, result)=>{
        res.render("home", {quizzes: result})
    })
    
})

app.get("/quizzes/:quizId", (req, res)=>{

    if(!req.isAuthenticated()){
        return res.redirect("/login")
    }

    Quiz.findById(req.params.quizId, (err, result)=>{
        res.render("quiz", {quiz: result})
    })

})

//for results page

app.get("/instructor/results/:quizId", (req, res)=>{

    

})



// POST Routes

// creating a user

app.post('/api/user', async (req, res)=>{

    const body = req.body
    const hashedPassword = await bcrypt.hash(body.password, 10)

    User.findOne({email: body.email}, (err, result)=>{

        if(err){

            req.flash('regError', 'Something went wrong.Try again')
            res.redirect('/register')

        }
        if(result){

            req.flash('regError', 'Account already exists')
            res.redirect('/register')

        }
        else{

            const user = new User({
                username: body.username,
                email: body.email,
                password: hashedPassword,
                role: body.role
            })
        
            user.save().then((savedUser)=>{
        
                res.redirect("/login")
        
            }).catch((err)=>{
        
                res.json({err: err})
                
            })

        }

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
        unAttempted: body.unAttempted,
        totalMarks: body.totalMarks
    })

    result.save().then((savedResult)=>{

        if(!savedResult){
            res.send("Something went wrong")
        }
        else{
            res.send("Stored successfully")
        }
    })

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

    quiz.save().then((savedQuiz)=>{
        res.send({ message: 'Quiz created successfully', quizId: quiz._id})
    })

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




// logging in existing user

app.post("/api/", (req, res)=>{

    const body = req.body;

    User.findOne({ email: body.email }, (err, result)=>{

        if(!result){

            res.send({ authenticated: false, err: 'Account does not exists' })

        }

        if(result){

            bcrypt.compare(body.password, result.password).then((match)=>{

                if(match){
                    res.send({authenticated: true, username: result.username, email: result.email, userId: result._id, role: result.role})
                }
                else{
                    res.send({authenticated: false, err: 'Username or password is incorrect'})
                }
    
            })

        }
        

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





// Passport configuration


passport.use(new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {

    const user = await User.findOne({email:email});

    if(!user){

        return done(null, false, {message: 'No user found with this email'});

    } else {
        bcrypt.compare(password, user.password).then(match => {

            if(match){

                done(null, user, {message: 'logged in successfully'});

            } else {

                done(null, false, {message: 'Invalid username or password'});

            }
        }).catch(err => {

            return done(null, false, {message: 'Something went wrong'});

        })
    }

}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    })
})




app.post("/api/users/login", (req, res, next)=>{

    passport.authenticate('local', (err, user, info) => {
        if(err){

            res.flash('error', info.message);
            res.redirect('/login')
            
        }
        if(!user){

            req.flash('error', info.message);
            res.redirect('/login')

        } else {

            req.logIn(user, (err) => {

                if(err){
                    req.flash('error', info.message);
                    return next(err);
                } else {
                    return res.redirect('/')
                }
                
            })
        }


})(req, res, next)

})


app.get("/logout", (req, res)=>{

    req.logout((err)=>{

        if(!err){
            res.redirect("/login")
        }

    })

})













app.listen(3000, ()=>{
    console.log(`server started at port 3000`);
})


