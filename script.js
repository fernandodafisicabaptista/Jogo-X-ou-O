const STORAGE_KEY = "bgr-pwa-data-v1";

const seedResumos = [
  {
    id: crypto.randomUUID(),
    title: "Álgebra Linear Essencial",
    category: "Matemática",
    content: "Resumo com vetores, espaços vetoriais, matrizes e transformação linear para provas e exercícios.",
    author: "Augusto Dias",
    date: "2026-04-10",
    favorites: 21,
    downloads: 12,
  },
  {
    id: crypto.randomUUID(),
    title: "Revolução Francesa em 10 tópicos",
    category: "História",
    content: "Contexto, causas, cronologia e impactos sociais da Revolução Francesa de forma direta.",
    author: "Eduardo Sampaio",
    date: "2026-04-13",
    favorites: 16,
    downloads: 9,
  },
];

const state = {
  user: null,
  users: [],
  resumos: [],
  downloads: [],
  notifications: [
    { id: 1, text: "Novo comentário no teu resumo.", read: false },
    { id: 2, text: "Resumo destacado na semana.", read: true },
  ],
  comments: [
    { id: 1, author: "Águsto Dias", text: "Excelente compilação, ajudou muito na revisão!", likes: 121 },
    { id: 2, author: "Torma", text: "Seria ótimo incluir exercícios resolvidos na próxima versão.", likes: 87 },
  ],
  settings: { notifications: true, darkMode: false },
  view: "home",
  query: "",
  category: "Todos",
};

const ui = {
  auth: document.getElementById("screen-auth"),
  main: document.getElementById("screen-main"),
  viewTitle: document.getElementById("view-title"),
  viewContainer: document.getElementById("view-container"),
  loginForm: document.getElementById("login-form"),
  registerForm: document.getElementById("register-form"),
  navItems: [...document.querySelectorAll(".nav-item")],
  fab: document.getElementById("fab-add"),
  editorDialog: document.getElementById("editor-dialog"),
  editorForm: document.getElementById("editor-form"),
  backBtn: document.getElementById("back-btn"),
  installBtn: document.getElementById("install-btn"),
  cardTemplate: document.getElementById("card-template"),
};

let deferredPrompt = null;

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.resumos = seedResumos;
    return;
  }
  const data = JSON.parse(raw);
  Object.assign(state, data);
}

function saveState() {
  const payload = {
    user: state.user,
    users: state.users,
    resumos: state.resumos,
    downloads: state.downloads,
    notifications: state.notifications,
    comments: state.comments,
    settings: state.settings,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function render() {
  if (!state.user) {
    ui.auth.classList.add("active");
    ui.main.classList.remove("active");
    return;
  }

  ui.auth.classList.remove("active");
  ui.main.classList.add("active");

  ui.navItems.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === state.view));
  ui.viewTitle.textContent = {
    home: "Home",
    downloads: "Downloads",
    notifications: "Notificações",
    comments: "Comentários",
    profile: "Perfil",
    settings: "Configurações",
  }[state.view];

  ui.fab.style.display = ["home", "profile"].includes(state.view) ? "block" : "none";

  const views = {
    home: renderHome,
    downloads: renderDownloads,
    notifications: renderNotifications,
    comments: renderComments,
    profile: renderProfile,
    settings: renderSettings,
  };

  views[state.view]();
}

function resumosFiltrados() {
  return state.resumos.filter((r) => {
    const byQuery = `${r.title} ${r.content} ${r.author}`.toLowerCase().includes(state.query.toLowerCase());
    const byCategory = state.category === "Todos" || r.category === state.category;
    return byQuery && byCategory;
  });
}

function createResumoCard(resumo) {
  const node = ui.cardTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector("h4").textContent = resumo.title;
  node.querySelector(".meta").textContent = `${resumo.category} · ${resumo.author}`;
  node.querySelector(".desc").textContent = resumo.content;

  const favBtn = node.querySelector(".favorite");
  const dlBtn = node.querySelector(".download");

  favBtn.textContent = `☆ Favoritar (${resumo.favorites})`;
  dlBtn.textContent = `⇩ Download (${resumo.downloads})`;

  favBtn.addEventListener("click", () => {
    resumo.favorites += 1;
    saveState();
    render();
  });

  dlBtn.addEventListener("click", () => {
    resumo.downloads += 1;
    if (!state.downloads.some((d) => d.id === resumo.id)) state.downloads.push(resumo);
    state.notifications.unshift({ id: Date.now(), text: `Download de \"${resumo.title}\" concluído.`, read: false });
    saveState();
    render();
  });

  return node;
}

function renderHome() {
  const container = document.createElement("div");
  container.innerHTML = `
    <input class="search-bar" id="search-input" placeholder="Pesquisar por título, autor..." value="${state.query}" />
    <div class="tags">
      ${["Todos", "Matemática", "Física", "História", "Programação"]
        .map((c) => `<button class="tag" data-category="${c}">${c}</button>`)
        .join("")}
    </div>
    <div class="section-title"><strong>Destaques</strong><small>${resumosFiltrados().length} resultados</small></div>
    <div id="cards-wrap"></div>
  `;

  const wrap = container.querySelector("#cards-wrap");
  resumosFiltrados().forEach((r) => wrap.appendChild(createResumoCard(r)));

  container.querySelector("#search-input").addEventListener("input", (e) => {
    state.query = e.target.value;
    renderHome();
  });

  [...container.querySelectorAll(".tag")].forEach((tag) => {
    tag.style.background = tag.dataset.category === state.category ? "#dce8ff" : "#fff";
    tag.addEventListener("click", () => {
      state.category = tag.dataset.category;
      renderHome();
    });
  });

  ui.viewContainer.replaceChildren(container);
}

function renderDownloads() {
  const box = document.createElement("div");
  box.innerHTML = `<div class="section-title"><strong>Downloads</strong><small>${state.downloads.length} itens</small></div>`;

  if (!state.downloads.length) {
    box.innerHTML += `<p class="meta">Ainda não tens downloads.</p>`;
  } else {
    state.downloads.forEach((item) => {
      const row = document.createElement("div");
      row.className = "list-item";
      row.innerHTML = `<span>${item.title}</span><small>${item.category}</small>`;
      box.appendChild(row);
    });
  }

  ui.viewContainer.replaceChildren(box);
}

function renderNotifications() {
  const box = document.createElement("div");
  const notifications = state.notifications;

  notifications.forEach((n) => {
    const row = document.createElement("button");
    row.className = "list-item";
    row.style.width = "100%";
    row.style.borderLeft = n.read ? "1px solid var(--border)" : "4px solid var(--primary)";
    row.innerHTML = `<span>${n.text}</span><small>${n.read ? "Lida" : "Nova"}</small>`;
    row.addEventListener("click", () => {
      n.read = true;
      saveState();
      renderNotifications();
    });
    box.appendChild(row);
  });

  ui.viewContainer.replaceChildren(box);
}

function renderComments() {
  const box = document.createElement("div");
  state.comments.forEach((c) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<strong>${c.author}</strong><p class="desc">${c.text}</p><small>❤️ ${c.likes}</small>`;
    box.appendChild(card);
  });
  ui.viewContainer.replaceChildren(box);
}

function renderProfile() {
  const mine = state.resumos.filter((r) => r.author === state.user.name);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <article class="profile-box">
      <h3>${state.user.name}</h3>
      <p>${state.user.email}</p>
      <div class="stats">
        <span>${mine.length} resumos</span>
        <span>${mine.reduce((a, b) => a + b.favorites, 0)} favoritos</span>
        <span>${mine.reduce((a, b) => a + b.downloads, 0)} downloads</span>
      </div>
    </article>
    <div class="section-title"><strong>Meus Resumos</strong></div>
  `;

  mine.forEach((r) => wrapper.appendChild(createResumoCard(r)));
  ui.viewContainer.replaceChildren(wrapper);
}

function renderSettings() {
  const wrapper = document.createElement("div");

  const opts = [
    ["Notificações", "notifications"],
    ["Modo escuro", "darkMode"],
  ];

  opts.forEach(([label, key]) => {
    const row = document.createElement("button");
    row.className = "list-item";
    row.innerHTML = `<span>${label}</span><span class="switch ${state.settings[key] ? "on" : ""}"></span>`;
    row.addEventListener("click", () => {
      state.settings[key] = !state.settings[key];
      if (key === "darkMode") {
        document.body.style.filter = state.settings.darkMode ? "invert(0.96) hue-rotate(180deg)" : "none";
      }
      saveState();
      renderSettings();
    });
    wrapper.appendChild(row);
  });

  const logout = document.createElement("button");
  logout.className = "btn btn-primary";
  logout.style.width = "100%";
  logout.style.marginTop = "12px";
  logout.textContent = "Logout";
  logout.onclick = () => {
    state.user = null;
    saveState();
    render();
  };
  wrapper.appendChild(logout);

  ui.viewContainer.replaceChildren(wrapper);
}

function bindEvents() {
  ui.loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const user = state.users.find((u) => u.email === email && u.password === password);
    if (!user) {
      alert("Credenciais inválidas.");
      return;
    }
    state.user = { name: user.name, email: user.email };
    saveState();
    render();
  });

  ui.registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;

    if (state.users.some((u) => u.email === email)) {
      alert("Este email já foi usado.");
      return;
    }

    state.users.push({ name, email, password });
    state.user = { name, email };
    saveState();
    render();
  });

  ui.navItems.forEach((item) =>
    item.addEventListener("click", () => {
      state.view = item.dataset.view;
      render();
    })
  );

  ui.fab.addEventListener("click", () => {
    ui.editorForm.reset();
    ui.editorDialog.showModal();
  });

  ui.editorForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("resumo-title").value.trim();
    const category = document.getElementById("resumo-category").value;
    const content = document.getElementById("resumo-content").value.trim();
    const file = document.getElementById("resumo-file").files[0];

    state.resumos.unshift({
      id: crypto.randomUUID(),
      title,
      category,
      content: file ? `${content} (PDF: ${file.name})` : content,
      author: state.user.name,
      date: new Date().toISOString().slice(0, 10),
      favorites: 0,
      downloads: 0,
    });

    state.notifications.unshift({ id: Date.now(), text: `Resumo \"${title}\" publicado com sucesso.`, read: false });
    saveState();
    ui.editorDialog.close();
    state.view = "profile";
    render();
  });

  ui.backBtn.addEventListener("click", () => {
    state.view = "home";
    render();
  });

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    ui.installBtn.style.display = "inline-flex";
  });

  ui.installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    ui.installBtn.style.display = "none";
  });
}

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (error) {
      console.error("SW falhou", error);
    }
  }
}

function init() {
  loadState();
  bindEvents();
  render();
  registerServiceWorker();
}

init();
