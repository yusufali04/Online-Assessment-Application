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


/////////////// API's ////////////////




app.listen(3000, ()=>{
    console.log(`server started at port 3000`);
})



// {
//     category: "common",
//     questions: [ {ques:"q1", options:['op1','op2','op3','op4'],crctOpIndex:2 }, ...... ]
// }