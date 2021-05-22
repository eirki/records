import { readdir } from 'fs/promises'

import commonjs from '@rollup/plugin-commonjs'
import VuePlugin from 'rollup-plugin-vue'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import alias from '@rollup/plugin-alias'
import scss from 'rollup-plugin-scss'
import esbuild from 'rollup-plugin-esbuild'
import svg from 'rollup-plugin-vue-inline-svg'

function makeConfig(page, dev) {
  const res = {
    input: `frontend/src/${page}.vue`,
    output: [
      {
        file: `frontend/dist/${page}.js`,
        format: 'esm'
        // sourcemap: true
      }
    ],
    watch: {
      skipWrite: false,
      clearScreen: false
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': dev ? '"development"' : '"production"',
        preventAssignment: true
      }),
      svg(),
      VuePlugin({ css: false }),
      commonjs(),
      alias(
        {
          entries: [
            { find: 'vue', replacement: require.resolve('vue/dist/vue.esm.browser.js') }
          ]
        }),
      nodeResolve({ browser: true }),
      dev ? scss() : scss({ outputStyle: 'compressed' })
    ]
  }
  if (!dev) {
    res.plugins.push(esbuild({
      minify: true,
      target: 'es2015'
    }))
  }
  return res
}

export default async commandLineArgs => {
  if (commandLineArgs.configComp) {
    const components = await readdir('frontend/src/components')
    return components.map((page, index) => makeConfig(`components/${page.replace('.vue', '')}`, true))
  }
  const dev = commandLineArgs.configDev
  return makeConfig('app', dev)
}
