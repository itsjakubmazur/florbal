import { colors } from './src/ui/tokens.js';
export default {
  content: ['./index.html', './src/**/*.js'],
  theme: {
    extend: {
      colors,
      fontFamily: { display: ['Archivo Variable', 'system-ui', 'sans-serif'], body: ['Archivo Variable', 'system-ui', 'sans-serif'] },
    },
  },
};
