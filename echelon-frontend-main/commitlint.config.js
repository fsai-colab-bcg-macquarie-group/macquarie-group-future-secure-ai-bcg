export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
      'type-enum': [
          2,
          'always',
          ['feat', 'fix', 'hotfix', 'chore', 'bugfix', 'pre-release', 'release'],
      ],
  },
}
