// src/components/LoadingScreen.js
import React, { useEffect, useState } from "react";
import "./loadingscreen.css"; // 스타일 분리

const LoadingScreen = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      <img src="/thefull-Photoroom.png" alt="로고" className="loading-logo" />
      <p className="loading-text">Loading{dots}</p>
    </div>
  );
};

export default LoadingScreen;