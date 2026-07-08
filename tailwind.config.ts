import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101832",
        mist: "#f7fafc",
        line: "#e8edf1",
        qpet: "#73a8b6",
        "qpet-dark": "#4f8798",
        "qpet-soft": "#e8f3f6",
        moss: "#536b4f",
        clay: "#b45f43",
        oat: "#ffffff",
        sea: "#73a8b6"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(16, 24, 50, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
