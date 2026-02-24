async function generateContent() {
  const topic = document.getElementById("topicInput").value.trim();
  if (!topic) return alert("Enter a topic.");

  const response = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(topic)}`
  );

  const data = await response.json();

  if (!data.lead || !data.lead.sections) {
    alert("Topic not found.");
    return;
  }

  document.getElementById("results").classList.remove("hidden");

  // ===== INTRO SUMMARY =====
  let introText = "";
  data.lead.sections.forEach(section => {
    introText += section.text + " ";
  });

  introText = cleanText(introText);
  document.getElementById("summary").innerText =
    introText.split(". ").slice(0,4).join(". ") + ".";

  // ===== SECTION HEADINGS =====
  generateSections(data.remaining?.sections || []);

  // ===== FLASHCARDS =====
  generateFlashcards(introText, topic);

  document.getElementById("source").innerHTML =
    `Source: <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}" target="_blank">Wikipedia</a>`;
}

function cleanText(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function generateSections(sections) {
  const list = document.getElementById("keyPoints");
  list.innerHTML = "";

  sections.slice(0,8).forEach(section => {
    if (section.line) {
      const li = document.createElement("li");
      li.textContent = section.line;
      list.appendChild(li);
    }
  });
}

let flashcards = [];
let currentCard = 0;

function generateFlashcards(text, topic) {
  const sentences = text
    .split(". ")
    .filter(s => s.length > 50)
    .slice(0,6);

  flashcards = sentences.map(sentence => ({
    question: `Key fact about ${topic}`,
    answer: sentence.trim()
  }));

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
    <p><strong>${flashcards[currentCard].question}</strong></p>
    <button onclick="revealAnswer()">Reveal Answer</button>
    <div id="answer" style="margin-top:10px; display:none;">
      ${flashcards[currentCard].answer}
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
