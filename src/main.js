import "./style.css";
import { initScanner } from "./scanner.js";
import { renderApp } from "./app.js";
import { uploadGuestsFromCSV } from "./firebase.js";

renderApp();
initScanner();
