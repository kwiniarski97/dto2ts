let inputArea = document.getElementById("input");
let inputSelect = document.getElementById("inputSelect");
let outputArea = document.getElementById("output");
// enable tabs
inputArea.addEventListener("keydown", function(event) {
  if (event.code === "Tab") {
    let cIndex = this.selectionStart;
    this.value = [
      this.value.slice(0, cIndex),
      "\t",
      this.value.slice(cIndex)
    ].join("");
    event.stopPropagation();
    event.preventDefault();
    this.selectionStart = cIndex + 1;
    this.selectionEnd = cIndex + 1;
  }
});

// attach event
inputArea.addEventListener("input", () => {
  switch (inputSelect.value) {
    case "csharp": {
      validateAndTranslateCsharpClass();
      break;
    }
    case "java": {
      translateJava();
      break;
    }
  }
});

function validateAndTranslateCsharpClass() {
  if (!isSemanticValid()) {
    outputArea.value = "Semantic error 😪";
  } else {
    try {
      const formatted = translateCsharpClass();
      outputArea.value = formatted;
    } catch (ex) {
      outputArea.value = ex || "Input is invalid 😢";
    }
  }
}

function translateCsharpClass() {
  let input = inputArea.value;
  let output = [];
  let lines = input.trim().split(/\s*[\r\n]+\s*/g);
  let className = "";
  for (let i = 0; i < lines.length; i++) {
    let words = lines[i].split(/\s+/g);
    if (words[0] === "using") {
      // ignore usings
      continue;
    }
    if (words[0] === "namespace") {
      //ignore namespaces
      continue;
    }
    if (words[0].startsWith("//", 0)) {
      continue;
    }
    let indexOfClass = words.findIndex(word => word === "class"); // class name
    if (indexOfClass >= 0) {
      className = words[indexOfClass + 1];
      output.push(`export interface ${className} {`);
      continue;
    }

    if (words[1] && words[1].indexOf(className) >= 0) {
      // constructor
      continue;
    }

    if (words.find(p => p === "=")) {
      //assign
      continue;
    }

    if (words.length >= 3) {
      // prop
      if (words[0] !== "public") {
        throw "DTO's properties must be public 😓 ";
      }
      let name = words[2];
      output.push(
        `${name.replace(/\w/, c => c.toLowerCase())}: ${getType(
          "typescript",
          words[1]
        )};`
      );
    }
  }
  if (output.length > 0) {
    output.push("}");
  }

  return output.join("\n");
}

function translateJava() {}

function getType(outputLang, type) {
  switch (outputLang) {
    case "typescript": {
      return getTypescriptType(type);
    }
  }
}

function getTypescriptType(type) {
  switch (type.toLowerCase()) {
    case "byte":
    case "short":
    case "int":
    case "long":
    case "sbyte":
    case "ushort":
    case "uint":
    case "ulong":
    case "float":
    case "double":
    case "decimal":
      return "number";
    case "string":
      return "string";
    case "boolean":
    case "bool":
      return "boolean";
    case "datetime":
      return "Date";
    default: {
      if (type.indexOf("[") >= 0 && type.indexOf("]") > 0) {
        return [];
      } else if (type.startsWith("ienumerable")) {
        return [];
      }
      return "any";
    }
  }
}

function isSemanticValid() {
  let value = inputArea.value;
  let parenthesisValid =
    countInstances(value, "(") === countInstances(value, ")");
  let bracketsValid = countInstances(value, "[") === countInstances(value, "]");
  let bracesValid = countInstances(value, "{") === countInstances(value, "}");
  return parenthesisValid && bracesValid && bracketsValid;
}

function countInstances(value, symbol) {
  return value.split(symbol).length - 1;
}
