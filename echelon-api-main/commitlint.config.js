export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',
                'hotfix',
                'chore',
                'bugfix',
                'pre-release',
                'release',
                'refactor',
                'test',
            ],
        ],
    },
}
