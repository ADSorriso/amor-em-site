const whatsappNumber = "5566974005474";

const nameInput = document.getElementById("loveName");
const yourNameInput = document.getElementById("yourName");
const messageInput = document.getElementById("loveMessage");
const dateInput = document.getElementById("loveDate");
const photoInput = document.getElementById("lovePhoto");
const form = document.getElementById("builderForm");
const previewName = document.getElementById("previewName");
const previewMessage = document.getElementById("previewMessage");
const previewPhoto = document.getElementById("previewPhoto");
const heroPreview = document.getElementById("heroPreview");
const button = document.getElementById("whatsapp");
const planButtons = document.querySelectorAll("[data-plan]");
let selectedPlan = "";

function updatePreview() {
  const name = nameInput?.value.trim() || "meu amor";
  const message = messageInput?.value.trim() || "Crie uma mensagem especial e veja sua surpresa aparecer aqui.";
  if (previewName) previewName.textContent = name;
  if (previewMessage) previewMessage.textContent = message;
  if (heroPreview) heroPreview.querySelector("h2").innerHTML = `Oi, ${name === "meu amor" ? "meu<br><em>amor.</em>" : `<em>${name}.</em>`}`;
}

[nameInput, yourNameInput, messageInput, dateInput].forEach((el) => {
  if (el) el.addEventListener("input", updatePreview);
});

photoInput?.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const url = event.target.result;
    previewPhoto.style.backgroundImage = `url("${url}")`;
    previewPhoto.classList.add("has-photo");
    previewPhoto.querySelector("span").style.display = "none";
  };
  reader.readAsDataURL(file);
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  updatePreview();
  document.getElementById("lovePreview")?.classList.add("ready");
  document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll("[data-plan]").forEach((link) => {
  link.addEventListener("click", () => {
    selectedPlan = link.dataset.plan || "";
    updateWhatsapp();
  });
});

function updateWhatsapp() {
  const name = nameInput?.value.trim() || "não informado";
  const recipient = nameInput?.value.trim() || "meu amor";
  const message = messageInput?.value.trim() || "não informada";
  const plan = selectedPlan || "Quero saber qual plano escolher";
  const text = `Olá! Testei o Amor em Site e gostei da prévia. ❤️\n\nPessoa especial: ${recipient}\nMensagem: ${message}\nPlano: ${plan}\n\nQuero liberar meu site completo.`;
  if (button) button.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

updatePreview();
updateWhatsapp();


// GERADOR DE LINK DE TESTE
const builderForm = document.getElementById("builderForm");
const lovePhoto = document.getElementById("lovePhoto");
let photoData = "";

if (lovePhoto) {
  lovePhoto.addEventListener("change", () => {
    const file = lovePhoto.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 700;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        photoData = canvas.toDataURL("image/jpeg", 0.68);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

if (builderForm) {
  builderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      loveName: document.getElementById("loveName")?.value.trim() || "meu amor",
      yourName: document.getElementById("yourName")?.value.trim() || "",
      message: document.getElementById("loveMessage")?.value.trim() || "Eu fiz esse cantinho especialmente para você.",
      date: document.getElementById("loveDate")?.value || "",
      photo: photoData || ""
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const link = new URL("site.html", window.location.href);
    link.hash = "data=" + encoded;

    let box = document.getElementById("generatedLinkBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "generatedLinkBox";
      box.className = "generated-link-box";
      builderForm.appendChild(box);
    }
    box.innerHTML = `
      <div class="generated-title">🎉 Sua prévia foi criada!</div>
      <p>Este é o link de teste que você pode abrir e compartilhar:</p>
      <input readonly value="${link.href.replace(/"/g, '&quot;')}" onclick="this.select()">
      <div class="generated-actions">
        <a class="btn" href="${link.href}" target="_blank" rel="noopener">🔗 Abrir meu link</a>
        <button type="button" class="btn secondary" id="copyGenerated">Copiar link</button>
      </div>`;
    document.getElementById("copyGenerated")?.addEventListener("click", async () => {
      await navigator.clipboard.writeText(link.href);
      document.getElementById("copyGenerated").textContent = "✓ Copiado!";
    });
    box.scrollIntoView({behavior:"smooth", block:"center"});
  });
}

planButtons.forEach((a) => {
  a.addEventListener("click", () => {
    const plan = a.dataset.plan || "";
    const box = document.getElementById("generatedLinkBox");
    if (box) box.dataset.plan = plan;
  });
});
