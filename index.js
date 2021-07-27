/** Calculating values */
const calculate = (n1, operator, n2) => {
  const firstNum = parseFloat(n1)
  const secondNum = parseFloat(n2)
  if (operator === "add") return firstNum + secondNum
  if (operator === "subtract") return firstNum - secondNum
  if (operator === "multiply") return firstNum * secondNum
  if (operator === "divide") return firstNum / secondNum
}

/** Sorting keys by types */
const getKeyType = (key) => {
  const action = key.dataset.action
  if (!action) return "number"
  if (
    action === "add" ||
    action === "subtract" ||
    action === "multiply" ||
    action === "divide"
  ) {
    return "operator"
  }

  return action
}

/** Creating Result String */
const createResultString = (key, displayedNum, state) => {
  const keyContent = typeof key === "object" ? key.textContent : key
  const keyType = getKeyType(key)
  // Destructuring state of the keys values
  const { firstValue, operator, modValue, previousKeyType } = state

  // Instructions for numbers
  if (keyType === "number") {
    return displayedNum === "0" ||
      previousKeyType === "operator" ||
      previousKeyType === "calculate"
      ? keyContent
      : displayedNum + keyContent
  }

  // Instructions for decimal
  if (keyType === "decimal") {
    if (!displayedNum.includes(".")) return displayedNum + "."
    if (previousKeyType === "operator" || previousKeyType === "calculate")
      return "0."
    return displayedNum
  }

  // Instructions for operators
  if (keyType === "operator") {
    return firstValue &&
      operator &&
      previousKeyType !== "operator" &&
      previousKeyType !== "calculate"
      ? calculate(firstValue, operator, displayedNum)
      : displayedNum
  }

  // Instructions for clearings
  if (keyType === "clear") return 0

  // Instructions for equaling/calculating
  if (keyType === "calculate") {
    return firstValue
      ? previousKeyType === "calculate"
        ? calculate(displayedNum, operator, modValue)
        : calculate(firstValue, operator, displayedNum)
      : displayedNum
  }
}

/** General state updating */
const stateUpdating = (key, calculator, calculatedValue, displayedNum) => {
  /** Updating calculator state  */
  const updateCalculatorState = (
    key,
    calculator,
    calculatedValue,
    displayedNum
  ) => {
    const keyType = getKeyType(key)
    // Destructuring state of the calculator dataset
    const { firstValue, operator, modValue, previousKeyType } =
      calculator.dataset

    calculator.dataset.previousKeyType = keyType

    // Updating by operators
    if (keyType === "operator") {
      calculator.dataset.operator = key.dataset.action
      calculator.dataset.firstValue =
        firstValue &&
        operator &&
        previousKeyType !== "operator" &&
        previousKeyType !== "calculate"
          ? calculatedValue
          : displayedNum
    }

    // Updating by calculating
    if (keyType === "calculate") {
      calculator.dataset.modValue =
        firstValue && previousKeyType === "calculate" ? modValue : displayedNum
    }

    // Updating by clearing
    if (keyType === "clear" && key.textContent === "AC") {
      calculator.dataset.firstValue = ""
      calculator.dataset.modValue = ""
      calculator.dataset.operator = ""
      calculator.dataset.previousKeyType = ""
    }
  }

  /** Updating visual state  */
  const updateVisualState = (key, calculator) => {
    const keyType = getKeyType(key)
    if (key.parentNode.children) {
      Array.from(key.parentNode.children).forEach((k) =>
        k.classList.remove("is-depressed")
      )

      if (keyType === "operator") key.classList.add("is-depressed")
      if (keyType === "clear" && key.textContent !== "AC")
        key.textContent = "AC"
      if (keyType !== "clear") {
        const clearButton = calculator.querySelector("[data-action=clear]")
        clearButton.textContent = "CE"
      }
    } else {
      Array.from(calculator.querySelector(".calculator__keys")).forEach((k) =>
        k.classList.remove("is-depressed")
      )

      if (keyType === "operator") key.classList.add("is-depressed")
      if (keyType === "clear" && key.textContent !== "AC")
        key.textContent = "AC"
      if (keyType !== "clear") {
        const clearButton = calculator.querySelector("[data-action=clear]")
        clearButton.textContent = "CE"
      }
    }
  }

  updateCalculatorState(key, calculator, calculatedValue, displayedNum)
  updateVisualState(key, calculator)
}

const calculator = document.querySelector(".calculator")
const display = calculator.querySelector(".calculator__display")
const keys = calculator.querySelector(".calculator__keys")

/** Listeners and handling keys */
keys.addEventListener("click", (e) => {
  if (!e.target.matches("button")) return
  const key = e.target
  const displayedNum = display.textContent
  const resultString = createResultString(key, displayedNum, calculator.dataset)

  display.textContent = resultString
  stateUpdating(key, calculator, resultString, displayedNum)
})

/** Supporting for keyboard typing */
window.addEventListener("keydown", (e) => {
  // add backspace(and exactly btn in calculator) and enter to calculator \b\e
  let reg = /[-+*\/=.0-9]/

  if (e.key.match(reg)) {
    const key = document.getElementById(e.key)
    const displayedNum = display.textContent
    const resultString = createResultString(
      key,
      displayedNum,
      calculator.dataset
    )

    display.textContent = resultString
    stateUpdating(key, calculator, resultString, displayedNum)
  }
})

/** Theme switcher logic */
const switchButton = document.getElementById("theme-switcher")

switchButton.addEventListener("click", () => {
  const body = document.body
  body.id === "light"
    ? ((body.id = "dark"), (switchButton.textContent = "Switch to light theme"))
    : ((body.id = "light"), (switchButton.textContent = "Switch to dark theme"))
})
