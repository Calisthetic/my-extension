(() => {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value } = obj;
    if (type === 'POST' && value === 'once') {
      solveOnce()
    } else if (type === 'POST' && value === 'full') {
      solveFull()
    }
    response("Okay")
  });
})();

const dynamicImport = async (path) => {
  return await import(chrome.runtime.getURL(path));
}

const printWord = (word) => {
  if (!word) return
  for (let i = 0; i < word.length; i++) {
    clickElement(word[i])
  }
}

const clickElement = (word) => {
  setTimeout(() => {
    const button = getButtonByLetter(word)
    button.click()
  }, 10);
}

const getButtonByLetter = (letter) => {
  if (letter.length === 0) {
    return document.getElementsByClassName("Game-keyboard-button-wide")[0]
  }
  letter = letter.toLowerCase()
  const elems = document.getElementsByClassName("Game-keyboard-button")
  for (let i = 0; i < elems.length; i++) {
    if (elems[i].innerText.toLowerCase().includes(letter)) {
      return elems[i]
    }
  }
}

const letterNames = {
  absent: "letter-absent",
  correct: "letter-correct",
  elsewhere: "letter-elsewhere"
}

const solveOnce = async () => {
  const lettersCount = document.getElementsByClassName("Row-letter").length
  const absent = []
  const correct = []
  const elsewhere = []
  Array(lettersCount / 6).fill(0).forEach(() => clickElement(""))

  // refresh letters data
  const letters = document.getElementsByClassName("Row-letter")

  for (let i = 0; i < letters.length; i++) {
    const currentLetter = letters[i].innerText.toLowerCase()
    if (letters[i].classList.contains(letterNames.elsewhere)) {
      const elems = elsewhere.filter(x => x.letter === currentLetter)
      const currentPosition = i % (lettersCount / 6)
      if (elems.length === 0) {
        elsewhere.push({
          letter: currentLetter,
          wrong: [currentPosition]
        })
      } else {
        if (!elems[0].wrong.includes(currentPosition)) {
          elems[0].wrong.push(currentPosition)
        }
      }
      if (absent.includes(currentLetter)) {
        absent.splice(absent.indexOf(currentLetter), 1)
      }
    } else if (letters[i].classList.contains(letterNames.correct)) {
      if (correct.filter(x => x.letter === currentLetter).length === 0) {
        correct.push({
          position: i % (lettersCount / 6),
          letter: currentLetter
        })
      }
      if (absent.includes(currentLetter)) {
        absent.splice(absent.indexOf(currentLetter), 1)
      }
    } else if (letters[i].classList.contains(letterNames.absent)) {
      if (!absent.includes(currentLetter) && correct.filter(x => x.letter === currentLetter).length === 0 && 
      elsewhere.filter(x => x.letter === currentLetter).length === 0)
        absent.push(currentLetter)
    }
  }

  const word = await getWord(lettersCount / 6, {
    correct: correct,
    elsewhere: elsewhere,
    absent: absent
  })
  printWord(word)
  clickElement("enter")
  
  setTimeout(() => {
    if(document.getElementsByClassName("selected").length !== 0) {
      solveOnce()
    }
  }, 200);
}

const solveFull = async (count) => {
  const lettersCount = document.getElementsByClassName("Row-letter").length
  const absent = []
  const correct = []
  const elsewhere = []
  Array(lettersCount / 6).fill(0).forEach(() => clickElement(""))

  // refresh letters data
  const letters = document.getElementsByClassName("Row-letter")

  for (let i = 0; i < letters.length; i++) {
    const currentLetter = letters[i].innerText.toLowerCase()
    if (letters[i].classList.contains(letterNames.elsewhere)) {
      const elems = elsewhere.filter(x => x.letter === currentLetter)
      const currentPosition = i % (lettersCount / 6)
      if (elems.length === 0) {
        elsewhere.push({
          letter: currentLetter,
          wrong: [currentPosition]
        })
      } else {
        if (!elems[0].wrong.includes(currentPosition)) {
          elems[0].wrong.push(currentPosition)
        }
      }
      if (absent.includes(currentLetter)) {
        absent.splice(absent.indexOf(currentLetter), 1)
      }
    } else if (letters[i].classList.contains(letterNames.correct)) {
      if (correct.filter(x => x.letter === currentLetter).length === 0) {
        correct.push({
          position: i % (lettersCount / 6),
          letter: currentLetter
        })
      }
      if (absent.includes(currentLetter)) {
        absent.splice(absent.indexOf(currentLetter), 1)
      }
    } else if (letters[i].classList.contains(letterNames.absent)) {
      if (!absent.includes(currentLetter) && correct.filter(x => x.letter === currentLetter).length === 0 && 
      elsewhere.filter(x => x.letter === currentLetter).length === 0)
        absent.push(currentLetter)
    }
  }

  const word = await getWord(lettersCount / 6, {
    correct: correct,
    elsewhere: elsewhere,
    absent: absent
  })
  printWord(word)
  clickElement("enter")
  
  setTimeout(() => {
    if(document.getElementsByClassName("selected").length !== 0) {
      solveOnce()
    }
    const items = document.getElementsByClassName("Row-letter")
    let strike = 0;
    let emptyExists = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].classList.length === 1) {
        emptyExists = true
      } else if (items[i].classList.contains(letterNames.correct)) {
        strike++
        if (strike >= lettersCount / 6 && (i + 1) % (lettersCount / 6) === 0) {
          return
        }
      } else {
        strike = 0;
      }
    }
    if (emptyExists) {
      solveFull()
    }
  }, 200);
}

const getWord = async (length, options) => {
  let words = await getWordsByLength(length)
  for (let i = 0; i < options.correct.length; i++) {
    words = words.filter(x => x[options.correct[i].position] === options.correct[i].letter)
  }
  for (let i = 0; i < options.absent.length; i++) {
    words = words.filter(x => !x.includes(options.absent[i]))
  }
  for (let i = 0; i < options.elsewhere.length; i++) {
    if (!options.elsewhere[i].wrong) {
      continue
    }
    for (let j = 0; j < options.elsewhere[i].wrong.length; j++) {
      words = words.filter(x => x[options.elsewhere[i].wrong[j]] !== options.elsewhere[i].letter)
    }
    words = words.filter(x => x.includes(options.elsewhere[i].letter))
  }
  return words[getRandomNumber(0, words.length)]
}

const getWordsByLength = async (length) => {
  if (length < 4 || length > 11) return null

  const module = await dynamicImport("words/words" + length + ".js");
  switch (length) {
    case 4:
      return module.words4;
    case 5:
      return module.words5;
    case 6:
      return module.words6;
    case 7:
      return module.words7;
    case 8:
      return module.words8;
    case 9:
      return module.words9;
    case 10:
      return module.words10;
    case 11:
      return module.words11;
    default:
      return [];
  }
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}