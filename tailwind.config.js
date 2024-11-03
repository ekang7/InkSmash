/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/*.{js,jsx,ts,tsx}", 
    "./public/index.html",
    "./app/room/*.tsx",
    "./app/drawing/*.tsx",
    "./app/attack/*.tsx",
    "./app/waiting/*.tsx",
    "./app/score/*.tsx"],
    theme: {
      extend: {},
    },
    plugins: [],
  }

