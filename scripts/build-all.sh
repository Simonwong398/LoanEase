#!/bin/bash

# 构建 React Native 应用
echo "Building React Native app..."
react-native build-ios
react-native build-android

# 构建 Electron 应用
echo "Building Electron app..."
npm run electron-pack

# 移动构建文件到统一目录
mkdir -p dist
mv android/app/build/outputs/apk/release/*.apk dist/
mv ios/build/Build/Products/Release-iphoneos/*.ipa dist/
mv dist/electron/* dist/ 