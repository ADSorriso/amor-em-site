const reasons = [
  "Seu sorriso.",
  "Seu jeito de me olhar.",
  "Seu abraço.",
  "Sua companhia.",
  "A forma como você me faz rir.",
  "Porque você deixa meus dias melhores.",
  "Seu carinho.",
  "Sua sinceridade.",
  "Seu coração.",
  "Porque ao seu lado eu me sinto em casa.",
  "Cada conversa que temos.",
  "Cada momento que vivemos.",
  "Sua presença.",
  "Seu jeito único.",
  "Porque você acredita em mim.",
  "Porque você me faz querer ser melhor.",
  "Seu beijo.",
  "Seu carinho nos pequenos detalhes.",
  "Porque você está comigo nos momentos difíceis.",
  "Porque você comemora minhas conquistas."
];

const reasonText = document.getElementById("reasonText");
const reasonNumber = document.getElementById("reasonNumber");
const reasonCounter = document.getElementById("reasonCounter");
let reasonIndex = 0;

document.getElementById("nextReason").addEventListener("click", () => {
  reasonIndex = (reasonIndex + 1) % reasons.length;
  reasonText.animate([
    { opacity: 0, transform: "translateY(10px)" },
    { opacity: 1, transform: "translateY(0)" }
  ], { duration: 350, easing: "ease-out" });
  reasonText.textContent = reasons[reasonIndex];
  reasonNumber.textContent = String(reasonIndex + 1).padStart(2, "0");
  reasonCounter.textContent = `Motivo ${reasonIndex + 1} de 100`;
});

const envelope = document.getElementById("envelope");
const paper = document.getElementById("letterPaper");
envelope.addEventListener("click", () => {
  envelope.classList.toggle("opened");
  paper.classList.toggle("open");
  paper.setAttribute("aria-hidden", String(!paper.classList.contains("open")));
  if (paper.classList.contains("open")) {
    paper.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

const modal = document.getElementById("photoModal");
const modalImage = document.getElementById("modalImage");
const photoSources = [...document.querySelectorAll(".photo-open")];
photoSources.forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  });
});
function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
document.getElementById("closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if(e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if(e.key === "Escape") closeModal(); });

document.getElementById("surpriseButton").addEventListener("click", () => {
  document.getElementById("surpriseBefore").style.display = "none";
  document.getElementById("surpriseAfter").classList.remove("hidden");
  burstHearts(28);
});

function burstHearts(amount){
  for(let i=0;i<amount;i++){
    const heart = document.createElement("span");
    heart.textContent = "♥";
    heart.className = "floating-heart";
    heart.style.left = `${Math.random()*100}%`;
    heart.style.fontSize = `${12 + Math.random()*22}px`;
    heart.style.animationDuration = `${3 + Math.random()*5}s`;
    document.getElementById("hearts").appendChild(heart);
    setTimeout(() => heart.remove(), 9000);
  }
}
setInterval(() => burstHearts(1), 1800);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if(entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const toast = document.getElementById("toast");
document.getElementById("lovePill").addEventListener("click", () => {
  toast.classList.add("show");
  burstHearts(10);
  setTimeout(() => toast.classList.remove("show"), 1800);
});

/* Música: deixe o src abaixo vazio ou coloque seu próprio arquivo.
   Exemplo para GitHub Pages: music.src = "musica.mp3"; */
const music = document.getElementById("music");
const musicButton = document.getElementById("musicButton");
let musicReady = false;
function setMusicSource(){
  if(!music.src) return;
  musicReady = true;
}
musicButton.addEventListener("click", async () => {
  if(!musicReady){
    toast.classList.add("show");
    toast.textContent = "Adicione sua música no script.js 🎵";
    setTimeout(() => toast.classList.remove("show"), 2200);
    return;
  }
  if(music.paused){ await music.play(); musicButton.textContent = "❚❚"; }
  else { music.pause(); musicButton.textContent = "♫"; }
});
setMusicSource();
