import logo from './logo.svg';
import axios from 'axios'
import { useState, useEffect } from 'react'
import './App.css';

function App() {
  const [flag, setFlag] = useState(false)

  const onMessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
  };

  return (
    <div className="App">
      <div className="app_buttons">
        <button onClick={() => {
          let eventSource = new EventSource("http://localhost:4000/stream",(e)=>{
            onmessage(e)
          });
          eventSource.onopen = () => {
            console.log("opened");
          };
          eventSource.onmessage = onMessage;
        }}>
          Get logs
        </button>
      </div>
    </div>
  );
}

export default App;
