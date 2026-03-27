import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  { ignores: ['plan/snippets/**'] },
  ...nextCoreWebVitals,
]

export default config
