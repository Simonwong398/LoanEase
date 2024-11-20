module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@utils': './src/utils',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@types': './src/types',
          '@theme': './src/theme',
          '@i18n': './src/i18n',
          '@config': './src/config'
        }
      }
    ]
  ]
}; 