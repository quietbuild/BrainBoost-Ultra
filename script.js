async function generateContent() {
  const topic = document.getElementById("topicInput").value.trim();
  if (!topic) return alert("Enter a topic.");

  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
  const data = await response.json();

  if (!data.extract) {
    alert("Topic not found.");
    return;
  }

  document.getElementById("results").classList.remove("hidden");

  const cleanText = data.extract.replace(/\[[^\]]*\]/g, "");
  generateSummary(cleanText);
  generateKeyPoints(cleanText);
  generateFlashcards(cleanText, topic);

  document.getElementById("source").innerHTML =
    `Source: <a href="${data.content_urls.desktop.page}" target="_blank">Wikipedia</a>`;
}

/* ========================
   SMART SUMMARY
======================== */
function generateSummary(text) {
  const sentences = text.split(". ");
  const stopwords = ["the","this","that","with","from","have","were","been","into","about","which","their","there","almost","most","also","only"];
  
  const wordFreq = {};
  text.toLowerCase().split(/\W+/).forEach(word => {
    if (word.length > 4 && !stopwords.includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const scored = sentences.map(sentence => {
    let score = 0;
    sentence.toLowerCase().split(/\W+/).forEach(word => {
      if (wordFreq[word]) score += wordFreq[word];
    });
    return { sentence, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored.slice(0, 3).map(s => s.sentence.trim()).join(". ");

  document.getElementById("summary").innerText = best + ".";
}

/* ========================
   SMART KEY CONCEPTS
======================== */
function generateKeyPoints(text) {
  const stopwords = ["the","this","that","with","from","have","were","been","into","about","which","their","there","almost","most","also","only"];
  
  const words = text.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
  const freq = {};

  words.forEach(word => {
    if (!stopwords.includes(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  });

  const sorted = Object.entries(freq)
    .sort((a,b) => b[1] - a[1])
    .slice(0,8)
    .map(entry => entry[0]);

  const list = document.getElementById("keyPoints");
  list.innerHTML = "";

  sorted.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word.charAt(0).toUpperCase() + word.slice(1);
    list.appendChild(li);
  });
}

/* ========================
   QUIZ MODE FLASHCARDS
======================== */
let flashcards = [];
let currentCard = 0;

function generateFlashcards(text, topic) {
  const sentences = text.split(". ").slice(0,6);

  flashcards = sentences.map(sentence => {
    sentence = sentence.trim();

    if (sentence.includes(" is ")) {
      const subject = sentence.split(" is ")[0];
      return {
        question: `What is ${subject}?`,
        answer: sentence
      };
    }

    if (sentence.includes(" was ")) {
      const subject = sentence.split(" was ")[0];
      return {
        question: `What happened to ${subject}?`,
        answer: sentence
      };
    }

    return {
      question: `Explain this about ${topic}:`,
      answer: sentence
    };
  });

  currentCard = 0;
  showFlashcard();
}

function showFlashcard() {
  const container = document.getElementById("flashcards");
  container.innerHTML = "";

  if (!flashcards.length) return;

  const card = document.createElement("div");
  card.className = "flashcard";

  card.innerHTML = `
    <p><strong>Question:</strong> ${flashcards[currentCard].question}</p>
    <button onclick="revealAnswer()">Reveal Answer</button>
    <div id="answer" style="margin-top:10px; display:none;">
      <strong>Answer:</strong> ${flashcards[currentCard].answer}
    </div>
    <div style="margin-top:15px;">
      <button onclick="nextCard()">Next</button>
    </div>
  `;

  container.appendChild(card);
}

function revealAnswer() {
  document.getElementById("answer").style.display = "block";
}

function nextCard() {
  currentCard = (currentCard + 1) % flashcards.length;
  showFlashcard();
}
