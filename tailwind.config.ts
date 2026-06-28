import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        cloud: "#f7f9fb",
        line: "#d9e1e8",
        mint: "#14b8a6",
        coral: "#ef6f61",
        gold: "#f4b942",
      },
      boxShadow: {
        tool: "0 18px 60px rgba(23, 32, 38, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
