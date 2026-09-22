/**
 * Про язык заголовка правило было только в тексте `CLAUDE.md` — и умерло
 * в день появления: семь коммитов подряд его нарушили, включая тот, которым
 * оно заведено. Проверяемое машиной обязано проверяться машиной.
 */
const printableAscii = /^[ -~]*$/

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'subject-ascii': ({ subject }) => [
          printableAscii.test(subject ?? ''),
          'заголовок пишется латиницей: он уходит в changelog и в git log'
        ]
      }
    }
  ],
  rules: {
    // Заголовок — латиницей; тело остаётся русским и правилом не тронуто.
    'subject-ascii': [2, 'always'],
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
