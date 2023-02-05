

let data = {
    quizId: '63de0966a849a7aede220c3f',
    studentName:'Azgar',
    correct:99,
    incorrect:1,
    totalMarks:99
}

// let data = {
//     category: "HTML",
//     questions: [
//       {
//         qid: 1,
//         ques: "This is a updated document quiz",
//         options: [
//           "coding lang",
//           "programming lang",
//           "scripting lang",
//           "Markup lang"
//         ],
//         crctOpIndex: 3
//       },
//       {
//         qid: 2,
//         ques: "What is css",
//         options: [
//           "coding lang",
//           "stylesheet",
//           "scripting lang",
//           "Markup lang"
//         ],
//         crctOpIndex: 1
//       }
//     ]
//   }

// const data = {
//   qid: 3,
//   ques: "This is a new question added by yusuf",
//   options: ["coding lang","programming lang","scripting lang","Markup lang"],
//   crctOpIndex: 3
// }

axios.post('http://localhost:3000/api/result', data)
    .then(res => {
      console.log(res.data)
})