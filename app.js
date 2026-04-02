function stateLabel(state) {
  return state.replace(/_/g, " ");
}

function formatTimestamp(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function summaryCard(label, value) {
  return `
    <article class="summary-card">
      <div class="summary-label">${label}</div>
      <div class="summary-value">${value}</div>
    </article>
  `;
}

function createList(items, fallback) {
  const listItems = (items && items.length ? items : [fallback])
    .map((item) => `<li>${item}</li>`)
    .join("");
  return listItems;
}

function renderProjectCard(project, template) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.querySelector(".project-path").textContent = project.repoPathName;
  node.querySelector(".project-name").textContent = project.name;
  node.querySelector(".state-pill").textContent = stateLabel(project.state);
  node.querySelector(".progress-label").textContent = project.progressLabel || "No progress note";
  node.querySelector(".progress-percent").textContent = `${project.progressPercent}%`;
  node.querySelector(".goal-copy").textContent =
    project.narrative.currentGoal ||
    (project.currentGoal && project.currentGoal[0]) ||
    "No current goal recorded yet.";
  node.querySelector(".meter-fill").style.width = `${Math.max(4, project.progressPercent)}%`;
  node.querySelector(".next-up-list").innerHTML = createList(project.nextUp, "Add a Next Up item in STATUS.md.");
  node.querySelector(".blockers-list").innerHTML = createList(
    project.blockers,
    "No blocker recorded."
  );

  const gitChip = node.querySelector(".git-chip");
  gitChip.textContent =
    project.git.gitRootType === "shared"
      ? `Shared git root • ${project.git.branch}`
      : `Repo branch • ${project.git.branch}`;
  if (project.git.dirtyCount > 0) {
    gitChip.classList.add("attention");
    gitChip.textContent += ` • ${project.git.dirtyCount} dirty`;
  }

  const agentChip = node.querySelector(".agent-chip");
  agentChip.textContent = project.hasAgentsDoc ? "AGENTS.md ready" : "Missing AGENTS.md";
  agentChip.classList.add(project.hasAgentsDoc ? "good" : "attention");

  const updateChip = node.querySelector(".update-chip");
  updateChip.textContent = `Updated ${project.lastUpdated || "unknown"}`;

  return node;
}

async function init() {
  const response = await fetch("./data/projects.json", { cache: "no-store" });
  const data = await response.json();

  document.getElementById("generated-at").textContent = formatTimestamp(data.generatedAt);

  document.getElementById("summary-grid").innerHTML = [
    summaryCard("Projects", data.summary.totalProjects),
    summaryCard("Active", data.summary.activeProjects),
    summaryCard("Average Progress", `${data.summary.averageProgress}%`),
    summaryCard("Needs Attention", data.summary.needsAttention),
  ].join("");

  const template = document.getElementById("project-card-template");
  const projectGrid = document.getElementById("project-grid");
  data.projects.forEach((project) => {
    projectGrid.appendChild(renderProjectCard(project, template));
  });
}

init().catch((error) => {
  document.getElementById("generated-at").textContent = "Failed to load";
  console.error(error);
});
