import React from "react";

export default function Spinner() {
  const spinnerStyle = {
    width: "40px",
    height: "40px",
    border: "4px solid #ccc",
    borderTop: "4px solid #333",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  const wrapperStyle = {
    display: "inline-block",
    animationName: "spin",
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  };

  return (
    <div style={wrapperStyle}>
      <div style={spinnerStyle}></div>
    </div>
  );
}
