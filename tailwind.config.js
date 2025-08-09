/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand Color Tokens
        bg: "#F5F5F5",
        ink: {
          DEFAULT: "#0D1A26",
          muted: "#253A48",
        },
        primary: {
          DEFAULT: "#0E7373",
          600: "#1FA698",
          400: "#60A497",
        },
        accent: "#40D3C8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        glass: "16px",
        "glass-lg": "20px",
      },
      spacing: {
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        24: "24px",
        32: "32px",
        48: "48px",
      },
      backdropBlur: {
        glass: "20px",
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(13, 26, 38, 0.1), 0 4px 16px rgba(13, 26, 38, 0.05)",
        "glass-lg":
          "0 20px 64px rgba(13, 26, 38, 0.15), 0 8px 32px rgba(13, 26, 38, 0.1)",
        "elevation-1": "0 2px 8px rgba(13, 26, 38, 0.08)",
        "elevation-2": "0 4px 16px rgba(13, 26, 38, 0.12)",
        "elevation-3": "0 8px 24px rgba(13, 26, 38, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-in": "slideIn 250ms ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(64, 211, 200, 0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(64, 211, 200, 0.6)" },
        },
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #0E7373 0%, #1FA698 50%, #60A497 100%)",
        "gradient-soft":
          "linear-gradient(135deg, #F5F5F5 0%, rgba(64, 211, 200, 0.05) 100%)",
      },
    },
  },
  plugins: [],
};
