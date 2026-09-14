/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Strict light solid semantic status colors
        status: {
          submitted: {
            bg: "#f4f4f5", // zinc-100
            text: "#18181b",
            border: "#e4e4e7",
          },
          scheduled: {
            bg: "#e0f2fe", // sky-100
            text: "#0369a1",
            border: "#bae6fd",
          },
          inspected: {
            bg: "#fef3c7", // amber-100
            text: "#b45309",
            border: "#fde68a",
          },
          certified: {
            bg: "#dcfce7", // emerald-100
            text: "#15803d",
            border: "#bbf7d0",
          },
          rejected: {
            bg: "#ffe4e6", // rose-100
            text: "#be123c",
            border: "#fecdd3",
          },
          expired: {
            bg: "#f1f5f9", // slate-100
            text: "#64748b",
            border: "#cbd5e1",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

