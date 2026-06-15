import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        acid: "rgb(var(--acid) / <alpha-value>)",
        electric: "rgb(var(--electric) / <alpha-value>)",
        magenta: "rgb(var(--magenta) / <alpha-value>)",
        cyber: "rgb(var(--cyber) / <alpha-value>)",
        destructive: "rgb(var(--destructive) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  safelist: [
    "bg-acid",
    "bg-magenta",
    "bg-cyber",
    "bg-electric",
    "text-acid",
    "text-magenta",
    "text-cyber",
    "text-electric",
    "border-acid",
    "border-magenta",
    "border-cyber",
    "border-electric",
  ],
  plugins: [],
};

export default config;
