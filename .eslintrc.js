module.exports = {
  extends: [
    require.resolve('@umijs/max/eslint'),
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};
