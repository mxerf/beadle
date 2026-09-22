export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Скоуп не выдумывается на ходу: список закрытый и совпадает с раскладкой.
    'scope-enum': [
      2,
      'always',
      ['server', 'web', 'protocol', 'deps', 'ci', 'docs', 'repo']
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'header-max-length': [2, 'always', 72]
  }
}
