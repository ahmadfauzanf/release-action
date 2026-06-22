// Plugin custom untuk semantic-release.
// Jalan SETELAH @semantic-release/release-notes-generator.
// Tugasnya: cari setiap baris "by @<nama-git> in ([123#](.../pull/123))",
// lalu panggil GitHub API untuk dapat username GitHub asli dari penulis PR,
// dan ganti placeholder nama git tersebut dengan username yang benar.

const PR_LINE_REGEX = /by @(.+?) in \(\[(\d+)#\]\(([^)]+)\)\)/g;

function getOwnerRepo(context) {
  // Di GitHub Actions, env ini selalu tersedia otomatis: "owner/repo"
  if (process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    return { owner, repo };
  }
  // Fallback: parse dari repositoryUrl di release.config.cjs
  const url = context?.options?.repositoryUrl || "";
  const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (match) return { owner: match[1], repo: match[2] };
  return null;
}

async function fetchPrAuthor(owner, repo, prNumber) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    }
  );
  if (!res.ok) {
    throw new Error(`GitHub API merespons ${res.status} untuk PR #${prNumber}`);
  }
  const data = await res.json();
  return data.user?.login;
}

module.exports = {
  async generateNotes(pluginConfig, context) {
    const { logger } = context;
    const notes = context.nextRelease?.notes || "";
    const ownerRepo = getOwnerRepo(context);

    if (!ownerRepo) {
      logger?.warn(
        "[resolve-github-authors] Tidak bisa menentukan owner/repo, lewati."
      );
      return "";
    }

    const matches = [...notes.matchAll(PR_LINE_REGEX)];
    if (matches.length === 0) return "";

    // Ambil semua nomor PR unik, lalu fetch author-nya secara paralel
    const prNumbers = [...new Set(matches.map((m) => m[2]))];
    const authorByPr = new Map();

    await Promise.all(
      prNumbers.map(async (prNumber) => {
        try {
          const login = await fetchPrAuthor(
            ownerRepo.owner,
            ownerRepo.repo,
            prNumber
          );
          if (login) authorByPr.set(prNumber, login);
        } catch (error) {
          logger?.warn(
            `[resolve-github-authors] Gagal ambil author PR #${prNumber}: ${error.message}`
          );
        }
      })
    );

    // Ganti placeholder nama git dengan username GitHub asli
    let updatedNotes = notes;
    for (const match of matches) {
      const [fullMatch, , prNumber, url] = match;
      const login = authorByPr.get(prNumber);
      if (!login) continue; // gagal fetch, biarkan nama aslinya
      const replacement = `by @${login} in ([${prNumber}#](${url}))`;
      updatedNotes = updatedNotes.replace(fullMatch, replacement);
    }

    context.nextRelease.notes = updatedNotes;
    // Return string kosong supaya semantic-release tidak menggandakan notes
    return "";
  },
};
