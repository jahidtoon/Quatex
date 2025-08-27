"use client";
import React, { useEffect, useRef, useState } from "react";

// Minimalist line chart for live price
function LineChart({ data, width = 400, height = 120 }) {
  if (!data.length) return <svg width={width} height={height}></svg>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 10) + 5;
    const y = height - 5 - ((v - min) / range) * (height - 10);
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} style={{ background: '#181c2f', borderRadius: 8 }}>
      <polyline
        fill="none"
        stroke="#4fd1c5"
        strokeWidth="2"
        points={points.join(' ')}
      />
      <text x="10" y="20" fill="#fff" fontSize="14">{data[data.length-1]}</text>
    </svg>
  );
}

// LiveChart component removed as per request.
