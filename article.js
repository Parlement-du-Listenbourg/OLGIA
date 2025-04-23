import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import showdown from "https://cdn.jsdelivr.net/npm/showdown@2.1.0/+esm";

// Configs Firebase
const configImago = {
  apiKey: "AIzaSyCaexv-0SVEmPeRNYt-WviKBiUhH-Ju7XQ",
  authDomain: "imago-veritatis.firebaseapp.com",
  projectId: "imago-veritatis",
  storageBucket: "imago-veritatis.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:exampleid1"
};

const configRTL = {
  apiKey: "AIzaSyBw7PSHW4fe2jptxyf7xHtyINSrYG_TupA",
  authDomain: "rtl-world.firebaseapp.com",
  projectId: "rtl-world",
  storageBucket: "rtl-world.firebasestorage.app",
  messagingSenderId: "1092619392407",
  appId: "1:1092619392407:web:f968b6ef5416d66d6360d2",
  measurementId: "G-4GBT38563H"
};

// Init Firebase
const appImago = initializeApp(configImago, "imago");
const appRTL = initializeApp(configRTL, "rtl");
const dbImago = getFirestore(appImago);
const dbRTL = getFirestore(appRTL);

// Récupération des paramètres d'URL
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get("id");
const media = urlParams.get("media");

// Convertisseur Markdown basique (sans extension custom)
const converter = new showdown.Converter({
  simplifiedAutoLink: true,
  strikethrough: true,
  tables: true
});

function getFullSourceName(sourceKey) {
  if (sourceKey === "rtl") return "RTL World";
  if (sourceKey === "imago") return "Imago Veritatis";
  return "Inconnu";
}

async function loadArticle() {
  if (!articleId || !media) {
    document.getElementById("article-content").innerHTML = "<p>Article introuvable</p>";
    return;
  }

  const db = media === "imago" ? dbImago : dbRTL;
  const articleRef = doc(db, "articles", articleId);
  const articleSnap = await getDoc(articleRef);

  if (!articleSnap.exists()) {
    document.getElementById("article-content").innerHTML = "<p>Article non trouvé</p>";
    return;
  }

  const article = articleSnap.data();
  document.title = `Article – ${article.title}`;

  // 🔧 Correction légère des retours à la ligne
  let fixedMarkdown = article.content;

  // Si aucun paragraphe, on ajoute des \n\n pour aérer
  if (!fixedMarkdown.includes('\n\n')) {
    fixedMarkdown = fixedMarkdown.replace(/(?<!\n)\n(?!\n)/g, '\n\n');
  }

  // 💡 Ajoute un saut après chaque lien Discord collé
  fixedMarkdown = fixedMarkdown.replace(
    /(https:\/\/discord\.com\/channels\/[^\s)]+)\)/g,
    '$1)\n\n'
  );

  // Gère les blocs "petit texte" au format Imago avec -# en début de ligne
  fixedMarkdown = fixedMarkdown.replace(/^-# (.*)$/gm, '<small>$1</small>');


  // 💬 Conversion propre
  const htmlContent = converter.makeHtml(fixedMarkdown);

  // Injection HTML
  document.getElementById("article-content").innerHTML = `
    <h1 class="article-title">${article.title}</h1>
    <p class="article-meta">
      Auteur : ${article.author} – Publié le : ${article.timestamp} – Catégorie : ${article.category || "Non spécifiée"} |
      Source : ${getFullSourceName(media)}
    </p>
    <div class="article-body">${htmlContent}</div>
  `;

  // Illustration
  if (article.image) {
    const img = document.createElement("img");
    img.src = article.image;
    img.alt = "Illustration";
    img.classList.add("article-image");
    document.body.appendChild(img);
  }
}

window.onload = loadArticle;