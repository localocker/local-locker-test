module.exports = {
  mode: "jit",
  purge: [
    "./partials/**/*.hbs",
    "./pages/**/*.hbs",
    "./templates/**/*.hbs",
    "./src/**/*.js",
    "./src/**/*.ts",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "ll-blue": "#00173C",
        "ll-hover-blue": "#001c48",
        "ll-red": "#E52222",
        "ll-light-blue": "#5c6d88",
        "clutter": "#037f78"
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
