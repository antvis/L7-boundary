import commonjs from '@rollup/plugin-commonjs';
export default {
  esm: 'babel',
  cjs: 'babel',
  umd: {
    name: 'L7.District',
    file: 'l7-district',
    sourcemap: true,
    globals: {
      '@antv/l7': 'L7',
    },
  },
  extraRollupPlugins: [
    commonjs({
      namedExports: {
        eventemitter3: ['EventEmitter'],
      },
    }),
  ],
};
