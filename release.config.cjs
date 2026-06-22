const writerOpts = require("./scripts/release-notes/templates.cjs");

module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      { preset: "conventionalcommits" },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        // Ubah judul section / urutan / sembunyikan tipe commit di sini
        presetConfig: {
          types: [
            { type: "feat", section: "✨ Features" },
            { type: "fix", section: "🐛 Bug Fixes" },
            { type: "perf", section: "⚡ Performance" },
            { type: "revert", section: "⏪ Reverts" },
            { type: "docs", section: "📝 Documentation", hidden: false },
            { type: "style", section: "💄 Styles", hidden: true },
            { type: "chore", section: "🔧 Chores", hidden: true },
            { type: "refactor", section: "♻️ Refactors", hidden: true },
            { type: "test", section: "✅ Tests", hidden: true },
            { type: "build", section: "📦 Build", hidden: true },
            { type: "ci", section: "👷 CI", hidden: true },
          ],
        },
        // Ubah tampilan markdown-nya di folder scripts/release-notes/*.hbs
        writerOpts,
      },
    ],
    [
      "@semantic-release/changelog",
      { changelogFile: "CHANGELOG.md" },
    ],
    "./scripts/release-notes/resolve-github-authors.cjs",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
