import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ayuva: {
          ink: "#1f2a27",
          muted: "#71807a",
          cream: "#f8f4ec",
          card: "#fffdf8",
          green: "#5f8f7b",
          greenDark: "#315d51",
          mint: "#edf5ef",
          amber: "#c99b5f",
          rose: "#ad6f6f",
          plum: "#a99ac7",
          blush: "#f7e7e4",
          sky: "#e8f1f4",
          lemon: "#f6edcf",
          night: "#14201d",
          nightCard: "#1b2925"
        }
      },
      boxShadow: {
        soft: "0 18px 44px rgba(57, 78, 70, 0.08)",
        calm: "0 12px 34px rgba(49, 93, 81, 0.10)"
      },
      borderRadius: {
        calm: "1.375rem"
      }
    }
  },
  plugins: []
};

export default config;
