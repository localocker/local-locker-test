module.exports = {
  mode: 'jit',
  purge: [ 
    './partials/**/*.hbs', 
    './pages/**/*.hbs',
    './templates/**/*.hbs',
    './src/**/*.js',
    './src/**/*.ts',
   ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "ll-blue": "#00173C",
        "ll-red": "#E52222",
      },
    },
  },
  variants: {
    extend: {
      
    },
  },
  plugins: [],
}
