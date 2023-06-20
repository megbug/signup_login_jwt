import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState();

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch((error) => {
        console.error(error);
        setStatus("error");
      });
  }, []);

  return (
    <>
      <p>API Status: {status}</p>

    </>
  )
}

export default App;
