import rollupVue from 'rollup-plugin-vue'
// import rollupCss from 'rollup-plugin-css-only'
// import rollupBabel from '@rollup/plugin-babel'
// import rollupResolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/el-form-builder.esm.js',
    format: 'esm'
  },
  plugins: [
    // rollupCss(),
    rollupVue(),
    // rollupResolve({ extensions: ['.js', '.vue'] }),
    // rollupBabel({ babelHelpers: 'runtime' })
  ]
}
