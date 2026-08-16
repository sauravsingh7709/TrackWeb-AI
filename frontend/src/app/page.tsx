"use client";

import { useEffect, useState } from "react";



export default function Home() {

  
  const [message, setMessage] = useState("");

  useEffect(() => {
    try{
      fetch("http://localhost:5000/api/test")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
      });
    }
    catch(error){
      console.error("Error fetching data:", error);
    }
  }, []);


  return (
    <div>
      <h1>TrackWeb AI</h1>

      <h2>{message}</h2>
    </div>
  );
}
