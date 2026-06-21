const releaseNotesGenerator = require('@semantic-release/release-notes-generator');

module.exports = {
  async generateNotes(pluginConfig, context) {
    // Generate default release notes.
    const notes = await releaseNotesGenerator.generateNotes(
      pluginConfig,
      context,
    );

    const { version, gitTag } = context.nextRelease;
    const { owner, repo } = context.options.repositoryUrl.match(
      /github\.com[:/](?<owner>[^/]+)\/(?<repo>.+?)(?:\.git)?$/,
    ).groups;

    const previousTag = context.lastRelease?.gitTag;

    // Remove the default heading:
    // ## [1.2.1](...) (2026-06-21)
    const body = notes.replace(
      /^##\s+\[.*?\]\(.*?\)\s+\(.*?\)\n+/,
      '',
    );

    let markdown = `# 🚀 Release ${gitTag}\n\n`;

    if (previousTag) {
      markdown += `**Full Changelog:** https://github.com/${owner}/${repo}/compare/${previousTag}...${gitTag}\n\n`;
    }

    markdown += body.trim();

    return markdown;
  },
};