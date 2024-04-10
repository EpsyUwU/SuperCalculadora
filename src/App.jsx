import "./App.css";
import { useState, useRef } from "react";
import { graphlib, render } from "dagre-d3";
import * as d3 from "d3";

function App() {
  const svgRef = useRef();

  class Node {
    constructor(value) {
      this.value = value;
      this.left = null;
      this.right = null;
    }
  }

  function generateGraph(tree) {
    const g = new graphlib.Graph()
      .setGraph({})
      .setDefaultEdgeLabel(() => ({}));
  
    let nodeCount = 0;
  
    function addNodes(node) {
      g.setNode(node.value, { label: node.value, style: "fill: #fff" });
      nodeCount++;
  
      if (node.left) {
        g.setEdge(node.value, node.left.value, { style: "stroke: #f00; fill: none" });
        addNodes(node.left);
      }
  
      if (node.right) {
        g.setEdge(node.value, node.right.value, { style: "stroke: #f00; fill: none" });
        addNodes(node.right);
      }
    }
  
    addNodes(tree);
  
    const svg = d3.select(svgRef.current);
    const inner = svg.select("g");
  
    const renderGraph = new render();
    renderGraph(inner, g);
  
    // Ajusta el tamaño del SVG y la vista de la gráfica.
    const initialScale = 0.75;
    svg.attr("width", nodeCount * 100 * initialScale + 40);
    svg.attr("height", nodeCount * 50 * initialScale + 40);
    const zoom = d3.zoom().on("zoom", () => {
      inner.attr("transform", d3.event.transform);
    });
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(20, 20).scale(initialScale)
    );
    svg.call(zoom);
  }

  const [tokens, setTokens] = useState([]);

  const lexicalAnalyzer = (input) => {
    const token = input.match(/(\d+(\.\d+)?|[+*-/()])\s*/g);
    if (!token) {
      return;
    }

    const tok = token.map((token) => {
      let type;
      switch (token.trim()) {
        case "+":
          type = "Operador Suma";
          break;
        case "-":
          type = "Operador Resta";
          break;
        case "*":
          type = "Operador Multi";
          break;
        case "/":
          type = "Operador División";
          break;
        case "(":
          type = "Parentesis Apertura";
          break;
        case ")":
          type = "Parentesis Cierre";
          break;
        case ".":
          type = "Punto";
          break;
        default:
          if (/^\d+$/.test(token)) {
            type = "INT";
          } else if (/^\d+\.\d+$/.test(token)) {
            type = "FLOAT";
          }
          break;
      }
      return { type, value: token };
    });

    setTokens(tok);
  };

  function isOperator(value) {
    return value === "+" || value === "-" || value === "*" || value === "/";
  }

  function precedence(operator) {
    switch (operator) {
      case "+":
      case "-":
        return 1;
      case "*":
      case "/":
        return 2;
      default:
        return 0;
    }
  }

  function infixToPostfix(expression) {
    let stack = [];
    let postfix = "";
    let elements = expression.split(" "); // divide la expresión en elementos basándose en espacios
    for (let element of elements) {
      if (element === "(") {
        stack.push(element);
      } else if (element === ")") {
        while (stack.length && stack[stack.length - 1] !== "(") {
          postfix += " " + stack.pop();
        }
        if (stack.length && stack[stack.length - 1] === "(") {
          stack.pop(); // desapila el paréntesis de apertura pero no lo agrega a la expresión postfija
        }
      } else if (!isOperator(element)) {
        postfix += " " + element;
      } else {
        while (
          stack.length &&
          precedence(element) <= precedence(stack[stack.length - 1]) &&
          stack[stack.length - 1] !== "("
        ) {
          postfix += " " + stack.pop();
        }
        stack.push(element);
      }
    }
    while (stack.length) {
      postfix += " " + stack.pop();
    }
    return postfix.trim();
  }

  function expressionToTree(expression) {
    let stack = [];
    let elements = expression.split(" "); // divide la expresión en elementos basándose en espacios

    elements.forEach((element) => {
      if (!isOperator(element)) {
        stack.push(new Node(element));
      } else {
        let node = new Node(element);
        node.right = stack.pop();
        node.left = stack.pop();
        stack.push(node);
      }
    });

    return stack.pop();
  }

  function evaluate(node) {
    if (!isOperator(node.value)) {
      if (isNaN(node.value)) {
        throw new Error(`Invalid value: ${node.value}`);
      }
      return Number(node.value);
    } else {
      let a = evaluate(node.left);
      let b = evaluate(node.right);
      if (node.value === "+") {
        return a + b;
      } else if (node.value === "-") {
        return a - b;
      } else if (node.value === "*") {
        return a * b;
      } else {
        return a / b;
      }
    }
  }

  const [expression, setExpression] = useState("");

  const handleInput = (value) => {
    let newExpression;
    if (isOperator(value) || value === "(" || value === ")") {
      newExpression = expression + " " + value + " ";
    } else {
      newExpression = expression + value;
    }
    setExpression(newExpression);
    lexicalAnalyzer(newExpression);
  };

  const handleCalculate = () => {
    let trimmedExpression = expression.trim();
    let postfixExpression = infixToPostfix(trimmedExpression);
    let tree = expressionToTree(postfixExpression);
    let result = evaluate(tree);
    setExpression(result.toString());
    lexicalAnalyzer(result.toString());
    generateGraph(tree);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-cover bg-center">
      <div className="flex flex-col rounded-lg overflow-hidden bg-black bg-opacity-50 backdrop-filter backdrop-blur-xl">
        <div className="flex items-center space-x-1 p-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-right text-5xl w-72 bg-transparent text-white px-4 font-light">
          {expression === "" ? "0" : expression}
        </div>
        <div className="grid grid-cols-4">
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("1")}
          >
            1
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("2")}
          >
            2
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("3")}
          >
            3
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("*")}
          >
            *
          </button>

          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("4")}
          >
            4
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("5")}
          >
            5
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("6")}
          >
            6
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("-")}
          >
            -
          </button>

          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("7")}
          >
            7
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("8")}
          >
            8
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("9")}
          >
            9
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("+")}
          >
            +
          </button>

          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("0")}
          >
            0
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => setExpression("")}
          >
            C
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("/")}
          >
            /
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={handleCalculate}
          >
            =
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput("(")}
          >
            (
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput(")")}
          >
            )
          </button>
          <button
            className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"
            onClick={() => handleInput(".")}
          >
            .
          </button>
          <button className="py-5 bg-purple-400 bg-opacity-10 text-white font-bold text-xl focus:outline-none hover:bg-opacity-25 transition-all duration-200"></button>
        </div>
      </div>
      <div>
        {tokens.map((token, index) => (
          <li className="pl-10" key={index}>
            Valor: {token.value}, Tipo: {token.type}
          </li>
        ))}
      </div>
      <div className="pl-10">
        <svg ref={svgRef}>
          <g />
        </svg>
      </div>
    </div>
  );
}

export default App;
