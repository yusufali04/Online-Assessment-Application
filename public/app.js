

const radios = document.getElementsByClassName("radio")
const submit = document.getElementById("submit-btn")
const selectedQuizInput = document.getElementById("currentQuiz")
// const startBtn = document.getElementById("quiz-btn-home")


submit.addEventListener('click', (e)=>{

    e.preventDefault()

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
    compareAnswers(answers, quiz)
})



function compareAnswers(answers, quiz){

    let crctCount = 0

    for(let i=0; i<answers.length; i++){

        if(answers[i].checkedId === quiz.questions[i].id){

            if(quiz.questions[i].options[quiz.questions[i].crctOpIndex] === answers[i].checkedLabel){

                crctCount++

            }

        }
    }

    console.log(crctCount);

}

