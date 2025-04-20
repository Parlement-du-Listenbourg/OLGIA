
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import showdown from "https://cdn.jsdelivr.net/npm/showdown@2.1.0/+esm";

// Configuration Firebase - Imago Veritatis
const configImago = {
    apiKey: "AIzaSyCaexv-0SVEmPeRNYt-WviKBiUhH-Ju7XQ",
    authDomain: "imago-veritatis.firebaseapp.com",
    projectId: "imago-veritatis",
    storageBucket: "imago-veritatis.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:exampleid1"
};

// Configuration Firebase - RTL World
const configRTL = {
    apiKey: "AIzaSyBw7PSHW4fe2jptxyf7xHtyINSrYG_TupA",
    authDomain: "rtl-world.firebaseapp.com",
    projectId: "rtl-world",
    storageBucket: "rtl-world.firebasestorage.app",
    messagingSenderId: "1092619392407",
    appId: "1:1092619392407:web:f968b6ef5416d66d6360d2",
    measurementId: "G-4GBT38563H"
};

function getFullSourceName(sourceKey) {
    if (sourceKey === "rtl") return "RTL World";
    if (sourceKey === "imago") return "Imago Veritatis";
    return "Inconnu";
}

const appImago = initializeApp(configImago, "imago");
const appRTL = initializeApp(configRTL, "rtl");

const dbImago = getFirestore(appImago);
const dbRTL = getFirestore(appRTL);

const converter = new showdown.Converter({ simplifiedAutoLink: true, strikethrough: true, tables: true });
const container = document.getElementById("articles-container");

showdown.extension('smallText', function() {
    return [{
        type: 'lang',
        regex: /-# (.*?)(\n|$)/g,
        replace: '<small>$1</small>$2'
    }];
});

let converter = new showdown.Converter({
    simplifiedAutoLink: true,
    strikethrough: true,
    tables: true,
    extensions: ['smallText']
});

async function loadArticles() {
    const [snapImago, snapRTL] = await Promise.all([
        getDocs(collection(dbImago, "articles")),
        getDocs(collection(dbRTL, "articles"))
    ]);

    const allArticles = [];

    snapImago.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        data.source = "imago";
        allArticles.push(data);
    });

    snapRTL.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        data.source = "rtl";
        allArticles.push(data);
    });

function getComparableDate(article) {
    if (article.timestamp?.seconds) {
        return new Date(article.timestamp.seconds * 1000);
    } else if (typeof article.timestamp === "string") {
        // Format supposé : "DD/MM/YYYY"
        const [day, month, year] = article.timestamp.split("/");
        return new Date(`${year}-${month}-${day}`);
    }
    return new Date(0); // Fallback : très ancienne date
}

allArticles.sort((a, b) => getComparableDate(b) - getComparableDate(a));

    allArticles.forEach((article) => {
        const preview = converter.makeHtml(article.content.substring(0, 200));
        const el = document.createElement("div");
        el.classList.add("article-card");
        el.innerHTML = `
            <a href="article.html?id=${article.id}&media=${article.source}" class="article-link">
                <h2>${article.title}</h2>
                <p><em>${article.author} – ${article.timestamp}</em> | Source : <strong>${article.source.toUpperCase()}</strong></p>
                <div>${preview}...</div>
                ${article.meme ? `<img src="${article.meme}" alt="Illustration" class="article-image">` : ""}
            </a>`;
        container.appendChild(el);
    });
}

window.onload = loadArticles;
