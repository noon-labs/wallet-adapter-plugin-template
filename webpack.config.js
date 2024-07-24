const path = require('path');
const TerserPlugin = require('terser-webpack-plugin'); // TerserPlugin 추가


module.exports = {
  entry: './src/index.ts', // TypeScript 진입점 파일 경로
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // 번들 파일 출력 경로
    // library: 'MyLibrary', // 전역 변수 이름 설정
    // libraryTarget: 'window', // 전역 변수 할당 대상 설정 (window 객체)
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: false, // minify 비활성화
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: false, // 압축 비활성화
          mangle: false, // 난독화 비활성화
          format: {
            beautify: true, // 코드 포맷팅 활성화
            comments: true, // 주석 유지
          },
        },
      }),
    ],
  },
  devtool: 'source-map', // 소스 맵 생성
};
