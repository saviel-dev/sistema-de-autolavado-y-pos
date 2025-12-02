import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { waveform } from 'ldrs';

waveform.register();

createRoot(document.getElementById("root")!).render(<App />);
