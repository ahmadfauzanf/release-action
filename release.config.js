/**
 * Semantic Release configuration.
 *
 * By default, semantic-release uses the Angular Conventional Commits preset.
 *
 * Commits that trigger a release:
 * - feat:            → Minor release (1.0.0 → 1.1.0)
 * - fix:             → Patch release (1.0.0 → 1.0.1)
 * - feat! / fix!:    → Major release (1.0.0 → 2.0.0)
 * - BREAKING CHANGE: → Major release
 *
 * Other conventional commit types (docs, chore, ci, refactor, perf, style,
 * test, build, revert, etc.) do NOT trigger a release by default.
 *
 * You can customize which commit types trigger releases by configuring
 * the @semantic-release/commit-analyzer plugin with `releaseRules`.
 */


module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/github',
      // {
      //   successCommentCondition: false,
      //   failCommentCondition: false,
      // },
    ],
  ],
}