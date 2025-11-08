# 🔐 React Pattern Authentication Canvas

A modern **pattern-based authentication system** built using **React** and **Material UI**, featuring an intuitive **drawing canvas** that allows users to create their unique authentication pattern — just like drawing a digital signature ✍️.

> Secure • Interactive • Lightweight • Mobile-Ready

---

## 🌟 Overview

**React Pattern Authentication Canvas** lets users draw a custom gesture that can be used for login, verification, or creative authentication.  
It combines **React Hooks**, **HTML5 Canvas**, and **Pointer Events** for a smooth, lag-free experience on both desktop and mobile devices.

---

## 🚀 Features

- 🎨 Draw a **unique pattern or signature** using mouse or touch  
- 🖱️ Works perfectly on both **desktop & mobile**  
- ⚡ Prevents scrolling, resizing, or re-render lag during drawing  
- 🧠 Captures **points, timestamps, and drawing stats**  
- 🔍 View real-time statistics like stroke count, duration, and average speed  
- 🧩 Built with **React**, **Material UI (MUI)**, and the **Canvas API**  
- 💾 Ready to integrate with any authentication backend  

---

## 🧠 Use Case Ideas

- Pattern or gesture-based login system  
- E-signature verification  
- Custom biometric experiments  
- Creative drawing-based user authentication  

---

## 🧩 Component Preview

![Canvas Demo](https://via.placeholder.com/800x400?text=Pattern+Authentication+Demo)



---

## 🧰 Technologies Used

- ⚛️ **React 18+**
- 🎨 **Material UI (MUI)**
- ✏️ **HTML5 Canvas API**
- 💡 **Pointer Events API**
- 🧱 **Modern JavaScript (ES6+)**

---

## 🧩 Component Props

| Prop | Type | Default | Description |
|------|------|----------|-------------|
| `onPatternChange` | `function` | `undefined` | Called when a pattern is completed or cleared |
| `width` | `number` | `400` | Canvas width in pixels |
| `height` | `number` | `300` | Canvas height in pixels |
| `disabled` | `boolean` | `false` | Disables the drawing functionality |
| `showStats` | `boolean` | `false` | Displays drawing statistics below the canvas |

---

## 📊 Example Data Output

When the user finishes drawing, the component provides structured pattern data:

```json
{
  "points": [
    { "x": 123, "y": 240 },
    { "x": 150, "y": 260 },
    { "x": 175, "y": 280 }
  ],
  "timestamps": [
    1731000456500,
    1731000456550,
    1731000456600
  ],
  "stats": {
    "pointCount": 3,
    "totalTime": 100,
    "avgSpeed": 30
  }
}
