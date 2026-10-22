import { dateIdeas } from "../data/date-ideas.js";
import { readStorage, writeStorage } from "../utils/storage.js";

/** Lightweight shared-looking checklist; progress is stored per browser/device. */
export function initDateQuest() {
  const list = document.getElementById("dateQuestList");
  const empty = document.getElementById("dateQuestEmpty");
  const progressBar = document.getElementById("questProgressBar");
  const progressText = document.getElementById("questProgressText");
  if (!list || !empty || !progressBar || !progressText) return () => {};

  const ideas = Array.isArray(dateIdeas) ? dateIdeas.filter((idea) => idea?.id && idea?.title) : [];
  const saved = readStorage("date-quest-completed", []);
  const completed = new Set(Array.isArray(saved) ? saved : []);
  list.replaceChildren();
  empty.hidden = ideas.length > 0;

  function renderProgress() {
    const count = ideas.filter((idea) => completed.has(idea.id)).length;
    const percentage = ideas.length ? (count / ideas.length) * 100 : 0;
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = ideas.length ? `${count} of ${ideas.length} little plans done` : "Add a few little plans when you're ready.";
    progressBar.parentElement?.setAttribute("aria-valuenow", String(count));
    progressBar.parentElement?.setAttribute("aria-valuemax", String(ideas.length));
  }

  ideas.forEach((idea) => {
    const item = document.createElement("li");
    item.className = "quest-item";
    const label = document.createElement("label");
    label.className = "quest-label";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed.has(idea.id);
    checkbox.setAttribute("aria-label", `Mark ${idea.title} ${checkbox.checked ? 'not done' : 'done'}`);
    const copy = document.createElement("span");
    copy.className = "quest-copy";
    const title = document.createElement("strong");
    title.textContent = idea.title;
    const description = document.createElement("small");
    description.textContent = idea.description || "A little thing to look forward to.";
    copy.append(title, description);
    label.append(checkbox, copy);
    if (idea.category) {
      const category = document.createElement("span");
      category.className = "quest-category";
      category.textContent = idea.category;
      item.append(label, category);
    } else item.appendChild(label);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) completed.add(idea.id);
      else completed.delete(idea.id);
      checkbox.setAttribute("aria-label", `Mark ${idea.title} ${checkbox.checked ? 'not done' : 'done'}`);
      writeStorage("date-quest-completed", [...completed]);
      renderProgress();
    });
    list.appendChild(item);
  });
  renderProgress();
  return () => list.replaceChildren();
}
