import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const rootDir = path.resolve("/Users/aryansingh/repos/project-dashboard");
const localConfigPath = path.join(rootDir, "sources.local.json");
const exampleConfigPath = path.join(rootDir, "sources.example.json");
const configPath = fs.existsSync(localConfigPath) ? localConfigPath : exampleConfigPath;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { frontmatter: {}, body: markdown };
  }

  const frontmatter = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    frontmatter[key] = value;
  }

  return {
    frontmatter,
    body: markdown.slice(match[0].length),
  };
}

function parseSections(markdownBody) {
  const sections = {};
  const parts = markdownBody.split(/^##\s+/m);
  const leading = parts.shift();
  if (leading && leading.trim()) {
    sections._leading = leading.trim();
  }

  for (const part of parts) {
    const newlineIndex = part.indexOf("\n");
    if (newlineIndex === -1) continue;
    const title = part.slice(0, newlineIndex).trim();
    const content = part.slice(newlineIndex + 1).trim();
    sections[title] = content;
  }

  return sections;
}

function parseBullets(sectionContent) {
  if (!sectionContent) return [];

  const bullets = [];
  for (const line of sectionContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      bullets.push(trimmed.slice(2).trim());
    }
  }
  return bullets;
}

function firstParagraph(sectionContent) {
  if (!sectionContent) return "";
  return sectionContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("- "))
    .join(" ");
}

function safeGit(repoPath, args) {
  try {
    return execFileSync("git", ["-C", repoPath, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function collectProject(projectConfig) {
  const statusPath = path.join(projectConfig.path, "STATUS.md");
  const agentsPath = path.join(projectConfig.path, "AGENTS.md");

  if (!fs.existsSync(statusPath)) {
    throw new Error(`Missing STATUS.md for ${projectConfig.name} at ${statusPath}`);
  }

  const rawStatus = fs.readFileSync(statusPath, "utf8");
  const { frontmatter, body } = parseFrontmatter(rawStatus);
  const sections = parseSections(body);

  const gitRoot = safeGit(projectConfig.path, ["rev-parse", "--show-toplevel"]);
  const branch = safeGit(projectConfig.path, ["branch", "--show-current"]);
  const remote = safeGit(projectConfig.path, ["remote", "get-url", "origin"]);
  const statusOutput = safeGit(projectConfig.path, ["status", "--short", "--", "."]);
  const dirtyFiles = statusOutput ? statusOutput.split("\n").filter(Boolean) : [];

  return {
    name: frontmatter.project || projectConfig.name,
    state: frontmatter.state || "unknown",
    progressPercent: Number.parseInt(frontmatter.progress_percent || "0", 10) || 0,
    progressLabel: frontmatter.progress_label || "",
    lastUpdated: frontmatter.last_updated || "",
    repoPathName: path.basename(projectConfig.path),
    hasAgentsDoc: fs.existsSync(agentsPath),
    git: {
      branch: branch || "n/a",
      gitRootType: gitRoot ? (gitRoot === projectConfig.path ? "dedicated" : "shared") : "none",
      hasRemote: Boolean(remote),
      dirtyCount: dirtyFiles.length,
    },
    currentGoal: parseBullets(sections["Current Goal"]),
    doneRecently: parseBullets(sections["Done Recently"]),
    inProgress: parseBullets(sections["In Progress"]),
    nextUp: parseBullets(sections["Next Up"]),
    blockers: parseBullets(sections["Risks And Blockers"]),
    repoNotes: parseBullets(sections["Repo Notes"]),
    narrative: {
      currentGoal:
        firstParagraph(sections["Current Goal"]) || parseBullets(sections["Current Goal"])[0] || "",
      inProgress:
        firstParagraph(sections["In Progress"]) || parseBullets(sections["In Progress"])[0] || "",
    },
  };
}

function stateRank(state) {
  const order = {
    in_progress: 0,
    prototype: 1,
    planned: 2,
    paused: 3,
    done: 4,
  };
  return order[state] ?? 99;
}

const config = readJson(configPath);
const projects = config.projects.map(collectProject).sort((a, b) => {
  const byState = stateRank(a.state) - stateRank(b.state);
  if (byState !== 0) return byState;
  return b.progressPercent - a.progressPercent;
});

const output = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalProjects: projects.length,
    activeProjects: projects.filter((project) => project.state === "in_progress").length,
    averageProgress:
      projects.length === 0
        ? 0
        : Math.round(
            projects.reduce((total, project) => total + project.progressPercent, 0) / projects.length
          ),
    needsAttention: projects.filter(
      (project) => project.git.dirtyCount > 0 || project.blockers.length > 0 || project.progressPercent < 25
    ).length,
  },
  projects,
};

fs.writeFileSync(path.join(rootDir, "data", "projects.json"), JSON.stringify(output, null, 2) + "\n");

console.log(`Synced ${projects.length} projects into data/projects.json`);
