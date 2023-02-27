
const radios = document.getElementsByClassName("radio")
const submit = document.getElementById("submit-btn")
const selectedQuizInput = document.getElementById("currentQuiz")
// submited page
const expirePage = document.getElementById('timeOutWarningOverlay')
const quizWrapper = document.getElementById("quiz-wrapper")


submit.addEventListener('click', submitQuiz)

function submitQuiz(e){


    if(e){
        e.preventDefault()
    }

    let answers = []
    let quiz = JSON.parse(selectedQuizInput.value)

    for(let i=0; i<radios.length; i++){

        if(radios[i].checked){

            const checkedLabel = radios[i].labels[0].innerHTML
            const checkedId = radios[i].name
            answers.push({checkedLabel, checkedId})
            
        }
        
    }
    

    // console.log(answers);
    clearInterval(intervalId);
    compareAnswers(answers, quiz)
    expirePage.style.visibility="visible"
    quizWrapper.style.visibility="hidden"

}



function compareAnswers(answers, quiz){

    console.log(answers);
    let crctCount = 0
    let incorrectCount = 0


    for(let i=0; i< quiz.questions.length; i++){

        for(let j=0; j< answers.length; j++){

            if(answers[j].checkedId == quiz.questions[i].qid){
    
                if(quiz.questions[i].options[quiz.questions[i].crctOpIndex] == answers[j].checkedLabel){
    
                    crctCount++
    
                }
                else{
                    incorrectCount++
                }
    
            }

        }

        
    }

    const userId = document.getElementById("userId")
    const quizId = document.getElementById("quizId")
    const studentName = document.getElementById("studentName")
    const correct = crctCount
    const incorrect = incorrectCount
    const unAttempted = quiz.questions.length - (crctCount + incorrectCount)
    const totalMarks = crctCount

    const resultData = {
        userId: userId.value,
        quizId: quizId.value,
        studentName: studentName.value,
        correct,
        incorrect,
        unAttempted,
        totalMarks
    }

    axios.post("/api/result", resultData).then((res)=>{
        console.log(res);
    })

}

// if (window.location.href.indexOf("http://localhost:3000/quizzes/") === 0) {
//   // your JavaScript code here
//   console.log("This code will only execute on quiz pages.");
// }

const counterElement = document.getElementById("counter");

const durationInSeconds = 60;
let remainingSeconds = durationInSeconds;

let intervalId = setInterval(callback, 1000);


function callback(){

    const timeformat = time_convert(remainingSeconds)
    counterElement.innerHTML = timeformat
    
    remainingSeconds--;

    if(remainingSeconds < 30){
        counterElement.style.color='red'
    }

    if (remainingSeconds < 0) {

        clearInterval(intervalId);
        submitQuiz()

    }

}

function time_convert(num)
 { 

  let minutes = Math.floor(num / 60);  
  let seconds = num % 60;

  if(minutes.toString().length==1){
    minutes = '0'+minutes
  }
  if(seconds.toString().length==1){
    seconds = '0'+seconds
  }

  return minutes + ":" + seconds;         
}


