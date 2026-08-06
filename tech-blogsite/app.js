const posts = [
  {
    id: 1,
    title: "Next-Gen AI Refrigerators & Smart Cooking Tech",
    category: "Kitchen Tech",
    date: "August 6, 2026",
    excerpt: "How modern induction cooktops and AI-assisted ovens optimize power and food freshness.",
    content: "Upgraded kitchen appliances are changing home culinary workflows. Modern smart fridges now include internal vision sensors to track inventory, reduce food waste, and automatically suggest recipes based on available ingredients. Coupled with precision induction cooktops, kitchen power efficiency has reached unprecedented benchmarks."
  },
  {
    id: 2,
    title: "Top Ultra-Efficient Home Automation Systems for 2026",
    category: "Home Automation",
    date: "August 4, 2026",
    excerpt: "Integrating Matter protocol, smart thermostats, and energy-efficient climate control.",
    content: "Modern home appliances are no longer standalone devices. With unified smart home standards like Matter, your HVAC, automated blinds, and washing machines operate synchronously to minimize peak-hour electricity consumption while keeping overall energy usage optimized."
  },
  {
    id: 3,
    title: "High-Performance Electronics: OLED displays & Ambient Audio",
    category: "Electronics",
    date: "August 1, 2026",
    excerpt: "A deep dive into low-latency wireless acoustics and next-gen display panels.",
    content: "Consumer electronics continue to shift toward seamless device connectivity. From high-refresh-rate ultra-thin displays to spatial audio receivers, high-end entertainment hubs are faster and more power-efficient than ever before."
  },
  {
    id: 4,
    title: "Defensive Security for Connected Smart Home Devices",
    category: "Security",
    date: "July 28, 2026",
    excerpt: "Best practices to secure IoT appliances, smart locks, and local network routers.",
    content: "As home appliances become interconnected smart devices, network segmentation and strong firmware authentication are vital to prevent unauthorized access to local home networks. Implementing dedicated VLANs for smart devices isolates potential entry points."
  }
];

let activeCategory = "all";
let searchQuery = "";

// Helper function to compute dynamic read time
function calculateReadTime(text) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

document.addEventListener("DOMContentLoaded", () => {
  const postsGrid = document.getElementById("posts");
  const searchInput = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".tag-btn");

  function renderPosts() {
    const filteredPosts = posts.filter(post => {
      const matchesCategory = activeCategory === "all" || post.category === activeCategory;
      const query = searchQuery.toLowerCase();
      const matchesSearch = post.title.toLowerCase().includes(query) ||
                            post.excerpt.toLowerCase().includes(query) ||
                            post.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    if (filteredPosts.length === 0) {
      postsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          No articles or product reviews found matching your search criteria.
        </div>
      `;
      return;
    }

    postsGrid.innerHTML = filteredPosts.map(post => `
      <article class="card" onclick="openPost(${post.id})">
        <div class="card-header">
          <span class="card-date">${post.date} • ${calculateReadTime(post.content)}</span>
          <span class="category-badge">${post.category}</span>
        </div>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
      </article>
    `).join("");
  }

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderPosts();
  });

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      activeCategory = button.getAttribute("data-category");
      renderPosts();
    });
  });

  renderPosts();
});

// Modal Handler
function openPost(id) {
  const modal = document.getElementById("article-modal");
  const fullArticle = document.getElementById("full-article");
  const post = posts.find(p => p.id === id);
  if (!post) return;

  fullArticle.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.8rem;">
      <span style="color: var(--accent); font-size: 0.85rem;">${post.date} • ${calculateReadTime(post.content)}</span>
      <span class="category-badge">${post.category}</span>
    </div>
    <h2 style="margin-bottom: 1rem; color: var(--text-main);">${post.title}</h2>
    <div style="color: var(--text-muted); line-height: 1.7;">${post.content}</div>
  `;
  modal.style.display = "flex";
}

document.querySelector(".close-btn").onclick = () => {
  document.getElementById("article-modal").style.display = "none";
};

window.onclick = (e) => {
  const modal = document.getElementById("article-modal");
  if (e.target === modal) modal.style.display = "none";
}; 

