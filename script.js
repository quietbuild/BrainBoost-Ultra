async function searchTopic(topicOverride = null) {
  const topic = topicOverride || document.getElementById("topicInput").value.trim();
  if (!topic) {
    alert("Please enter a topic.");
    return;
  }

  document.getElementById("results").classList.remove("hidden");

  try {
    // 1️⃣ Get summary
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    );
    const summaryData = await summaryRes.json();

    if (!summaryData.extract) {
      alert("Topic not found.");
      return;
    }

    document.getElementById("overview").innerText = summaryData.extract;

    // 2️⃣ Get related links (simpler method)
    const relatedRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/related/${encodeURIComponent(topic)}`
    );
    const relatedData = await relatedRes.json();

    const relatedDiv = document.getElementById("related");
    relatedDiv.innerHTML = "";

    (relatedData.pages || []).slice(0, 8).forEach(page => {
      const btn = document.createElement("button");
      btn.innerText = page.title;
      btn.onclick = () => searchTopic(page.title);
      relatedDiv.appendChild(btn);
    });

    // 3️⃣ Remove section feature (since it was unstable)
    const sectionsDiv = document.getElementById("sections");
    sectionsDiv.innerHTML = "<p>Use related topics to explore deeper.</p>";

  } catch (error) {
    alert("Error loading topic.");
    console.error(error);
  }
}
