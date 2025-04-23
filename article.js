import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import showdown from "https://cdn.jsdelivr.net/npm/showdown@2.1.0/+esm";

// Configs
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

// Firebase
const appImago = initializeApp(configImago, "imago");
const appRTL = initializeApp(configRTL, "rtl");
const dbImago = getFirestore(appImago);
const dbRTL = getFirestore(appRTL);

// URL params
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get("id");
const media = urlParams.get("media");

// Showdown
const converter = new showdown.Converter({
    simplifiedAutoLink: true,
    strikethrough: true,
    tables: true,
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

    // Correction très légère si les paragraphes sont collés
    let fixedMarkdown = article.content;
    if (!fixedMarkdown.includes('\n\n')) {
        fixedMarkdown = fixedMarkdown.replace(/(?<!\n)\n(?!\n)/g, '\n\n');
    }

    const htmlContent = converter.makeHtml(fixedMarkdown);

    document.getElementById("article-content").innerHTML = `
        <h1 class="article-title">${article.title}</h1>
        <p class="article-meta">
            Auteur : ${article.author} – Publié le : ${article.timestamp} – Catégorie : ${article.category || "Non spécifiée"} |
            Source : ${getFullSourceName(media)}
        </p>
        <div class="article-body">${htmlContent}</div>
    `;

    if (article.image) {
        const img = document.createElement("img");
        img.src = article.image;
        img.alt = "Illustration";
        img.classList.add("article-image");
        document.body.appendChild(img);
    }
}

window.onload = loadArticle;