import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const dataPath = path.join(rootDir, "data", "projects.json");
const dashboardUrl = "https://aryansingh.github.io/project-dashboard/";

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

function runInherited(command, args) {
  execFileSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
  });
}

function git(args, options) {
  return run("git", args, options);
}

function ensureAutomationSafe() {
  const branch = git(["branch", "--show-current"]);
  if (branch !== "main") {
    throw new Error(`Automation deploys only from main. Current branch: ${branch || "unknown"}`);
  }

  const remote = git(["remote", "get-url", "origin"]);
  if (!remote) {
    throw new Error("Missing git remote 'origin'.");
  }

  const dirtyEntries = git(["status", "--porcelain"]);
  if (dirtyEntries) {
    throw new Error(
      `Automation requires a clean worktree before syncing.\nCurrent changes:\n${dirtyEntries}`
    );
  }
}

function printSummary(data) {
  console.log("");
  console.log("Dashboard summary");
  console.log(`- Generated at: ${data.generatedAt}`);
  console.log(`- Projects: ${data.summary.totalProjects}`);
  console.log(`- Active: ${data.summary.activeProjects}`);
  console.log(`- Average progress: ${data.summary.averageProgress}%`);
  console.log(`- Needs attention: ${data.summary.needsAttention}`);
  console.log(`- Browser: ${dashboardUrl}`);
  console.log("");

  for (const project of data.projects) {
    const nextUp = project.nextUp[0] || "No next step recorded";
    const blocker = project.blockers[0] || "No blocker recorded";
    const dirtyLabel = project.git.dirtyCount > 0 ? `${project.git.dirtyCount} dirty` : "clean";
    console.log(
      `- ${project.name}: ${project.state}, ${project.progressPercent}% progress, ${dirtyLabel}, next: ${nextUp}, blocker: ${blocker}`
    );
  }
}

function main() {
  ensureAutomationSafe();

  runInherited(process.execPath, [path.join(scriptDir, "sync-status.mjs")]);

  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  printSummary(data);

  git(["add", "--", "data/projects.json"]);

  try {
    git(["diff", "--cached", "--quiet"]);
    console.log("");
    console.log("No dashboard changes detected after sync.");
    return;
  } catch (error) {
    if (error.status !== 1) {
      throw error;
    }
  }

  const commitMessage = `Refresh generated project snapshot (${data.generatedAt.slice(0, 10)})`;
  runInherited("git", ["commit", "-m", commitMessage]);
  runInherited("git", ["push", "origin", "main"]);

  console.log("");
  console.log(`Deployed dashboard update. GitHub Pages will publish from ${dashboardUrl}`);
}

try {
  main();
} catch (error) {
  console.error("");
  console.error("Dashboard automation failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
