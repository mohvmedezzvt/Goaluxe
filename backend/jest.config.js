export default {
  transform: {
    '^.+\\.js$': 'babel-jest', // Use babel-jest to transform ES module syntax
  },
  testEnvironment: 'node', // Use the Node test environment
};
