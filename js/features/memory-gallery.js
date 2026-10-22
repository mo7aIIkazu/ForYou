import { memories } from "../data/memories.js";
import { formatDate } from "../utils/date-utils.js";

/** Data-driven memory cards. No image is required; image paths can be added later. */
export function initMemoryGallery() {
  const grid = document.getElementById("memoryGalleryGrid");
  const empty = document.getElementById("memoryGalleryEmpty");
  if (!grid || !empty) return () => {};

  const validMemories = Array.isArray(memories) ? memories.filter((memory) => memory?.id && memory?.title) : [];
  grid.replaceChildren();
  empty.hidden = validMemories.length > 0;

  validMemories.forEach((memory) => {
    const card = document.createElement("article");
    card.className = "memory-card";
    if (memory.featured) card.classList.add("memory-card-featured");

    if (memory.image) {
      const image = document.createElement("img");
      image.src = memory.image;
      image.alt = memory.alt || memory.title;
      image.loading = "lazy";
      image.className = "memory-image";
      image.addEventListener("error", () => image.remove(), { once: true });
      card.appendChild(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "memory-placeholder";
      placeholder.setAttribute("aria-hidden", "true");
      placeholder.textContent = "✧";
      card.appendChild(placeholder);
    }

    const content = document.createElement("div");
    content.className = "memory-card-content";
    const date = document.createElement("p");
    date.className = "memory-date";
    date.textContent = formatDate(memory.date) || "a little moment";
    const title = document.createElement("h3");
    title.textContent = memory.title;
    const caption = document.createElement("p");
    caption.className = "memory-caption";
    caption.textContent = memory.caption || "A moment worth keeping.";
    content.append(date, title, caption);
    if (Array.isArray(memory.tags) && memory.tags.length) {
      const tags = document.createElement("p");
      tags.className = "memory-tags";
      tags.textContent = memory.tags.join(" · ");
      content.appendChild(tags);
    }
    card.appendChild(content);
    grid.appendChild(card);
  });
  return () => grid.replaceChildren();
}
