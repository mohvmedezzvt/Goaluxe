export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current', // Transpile code to run in the current Node version
        },
      },
    ],
  ],
};
