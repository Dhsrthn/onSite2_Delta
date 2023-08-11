typeBackground = document.getElementById('backgroundText')
const savebutton = document.getElementById('save')
const startbutton = document.getElementById('start')
const timeH = document.getElementById("time")
document.body.onkeydown = function (e) {
  if (e.key == ' ') {
    e.preventDefault()
  }
}

let savedArray = []
let divArray = []
let curr = 0
let paragraph
let object = {}
let wordCount = 0
let correct = 0, incorrect = 0, uncorrected = 0;
let positions = []

function display(paragraph) {
  console.log(object)
  typeBackground.innerHTML = ''
  for (let i = 0; i < paragraph.length; i++) {
    divArray.push([])
    divArray[i] = document.createElement('span')
    divArray[i].textContent = paragraph[i]
    typeBackground.appendChild(divArray[i])
  }
  const prev = document.getElementById('prevbest')
  if (object.wpm == 0) {
    prev.innerText = 'Previous: This is the first time you are taking this'
  } else {
    prev.innerText = `Previous:  ${(object.wpm).toFixed(2)}`
  }
}

let c = 1

async function runNew() {
  if (c != 1) {
    stoptime()
  }
  timeH.innerHTML = 'Time: 01:00'
  window.removeEventListener('keydown', handleKeyfunction)
  getData()
  curr = 0
  object = {}
  wordCount = 0
  correct = 0
  incorrect = 0
  uncorrected = 0
  positions = []
  startbutton.onclick = startfunction
}

async function getData() {
  const words = await axios.get('https://random-word-api.vercel.app/api?words=150')
  console.log(words.data)
  object.wpm = 0
  object.positions = []
  paragraph = words.data.join(' ')
  object.paragraph = words.data.join(' ')
  display(object.paragraph)
}
runNew()

let start = false
function startfunction() {
  c++
  start = true
  window.addEventListener('keydown', handleKeyfunction)
  startbutton.onclick = null
  savebutton.onclick = null

}




function handleKeyfunction(e) {
  const validKeys = /^[a-zA-Z\s]$/.test(e.key) || e.key === "Backspace";
  if (validKeys) {
    if (start) {
      timer(60)
      start = false
      setTimeout(() => {
        window.removeEventListener('keydown', handleKeyfunction)
        stoptime()
        savebutton.onclick = saveState
        startbutton.onclick = startfunction
        object.wpm = ((((curr + 1) / 5) - uncorrected))
      }, 60000)

    }
    if (e.key == "Backspace") {
      if (curr > 0) {
        console.log(divArray[curr - 1].classList.contains('correct'))
        if (!divArray[curr - 1].classList.contains('correct')) {
          divArray[curr - 1].classList.remove('correct')
          divArray[curr - 1].classList.remove('incorrect')
          divArray[curr - 1].classList.remove('active')
          divArray[curr - 2].classList.add('active')
          curr--
          uncorrected--
        }
      }
    }
    else if (object.paragraph[curr] == e.key) {
      divArray[curr].classList.add('correct')
      if (curr - 1 > -1) {
        divArray[curr - 1].classList.remove('active')
      }
      divArray[curr].classList.add('active');
      curr++
      correct++
    }
    else {
      divArray[curr].classList.add('active');
      if (curr - 1 > -1) {
        divArray[curr - 1].classList.remove('active');
      }
      divArray[curr].classList.add('incorrect')
      curr++
      incorrect++
      uncorrected++
    }
    if (object.paragraph[curr] == ' ') {
      wordCount++
      console.log(wordCount)
    }
  }
  const accur = document.getElementById("accuracy")
  accur.innerText = `Accuracy: ${((correct / (correct + incorrect)) * 100).toFixed(2)}`
}

function timer(t) {
  const wpmH = document.getElementById("currentWPM")

  displayTime(t)

  countDown = setInterval(() => {
    t--
    positions.push(curr)
    displayTime(t)
    if (object.positions.length > 0) {
      const ghost = document.getElementsByClassName('ghost')
      divArray.forEach(element => {
        element.classList.remove('ghost');
      });
      divArray[object.positions[60 - t]].classList.add('ghost')

    }
  }, 1000)

  function displayTime(t) {
    let wpm = 0
    if (t != 60) {
      wpm = ((((curr + 1) / 5) - uncorrected) / (60 - t)) * 60
    } else {
      wpm = ((((curr + 1) / 5) - uncorrected))
    }
    if (wpm < 0) {
      wpm = 0
    }
    let sec = Math.floor(t % 60)
    let min = Math.floor(t / 60)
    timeH.innerHTML = `Time: ${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`
    wpmH.innerHTML = `WPM: ${(wpm).toFixed(2)}`
  }
}

function stoptime() {
  clearInterval(countDown)
}


//sidenav functions

function openNav() {
  document.getElementById('sidenav').style.width = '70vmin'
  document.getElementById('sidenav').innerHTML = ''
  const linkelement = document.createElement('a')
  linkelement.href = "javascript:void(0)"
  const timesSymbol = document.createTextNode('\u00D7');
  linkelement.appendChild(timesSymbol);
  linkelement.onclick = function () {
    closeNav()
  }
  linkelement.classList.add('closebtn')
  document.getElementById('sidenav').appendChild(linkelement)
  displaySaved()
}

function closeNav() {
  document.getElementById("sidenav").innerHTML = ''
  sidenav.style.width = "0";
}

function getSavedArray() {
  let val1 = localStorage.getItem('hai')
  if (val1 == null) {
    savedArray = []
  }
  else {
    savedArray = JSON.parse(val1)
  }
}

function saveState() {
  object.positions = positions
  savedArray.push(object)
  localStorage.setItem('hai', JSON.stringify(savedArray))
  alert('Saved in history')
}

function displaySaved() {
  getSavedArray()
  if (savedArray.length == 0) {
    const text = document.createElement('div')
    text.innerHTML = 'Your saves appear here'
    text.classList.add('navitems')
    document.getElementById('sidenav').appendChild(text)
  }
  else {
    for (let i = 0; i < savedArray.length; i++) {
      const saved = document.createElement('div')
      saved.classList.add('navitems')
      saved.style.border = '0.1vmin solid black'
      saved.style.borderRadius = '0.5vmin'
      for (let j = 0; j < 15; j++) {
        saved.innerHTML += `${savedArray[0].paragraph[j]}`
      }
      document.getElementById('sidenav').appendChild(saved)
      saved.addEventListener('click', function () {
        window.removeEventListener('keydown', handleKeyfunction)
        object = savedArray[i]
        divArray = []
        curr = 0
        wordCount = 0
        correct = 0
        incorrect = 0
        positions = []
        uncorrected = 0
        timeH.innerHTML = 'Time: 01:00'
        startbutton.onclick = startfunction
        if (c != 1) {

          stoptime()
        }
        display(object.paragraph)

      })
    }
  }

}

