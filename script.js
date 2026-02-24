async function searchTopic(topicOverride = null) {
  const topic = topicOverride || document.getElementById("topicInput").value.trim();
  if (!topic) {
    alert("Please enter a topic.");
    return;
  }

  document.getElementById("results").classList.remove("hidden");

  try {
    // OFFICIAL MediaWiki API with CORS enabled
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(topic)}`
    );

    const data = await response.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];

    if (!page.extract) {
      alert("Topic not found.");
      return;
    }

    // Overview
    document.getElementById("overview").innerText = page.extract;

    // Related topics (search API)
    const relatedResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(topic)}&srlimit=8`
    );

    const relatedData = await relatedResponse.json();
    const relatedDiv = document.getElementById("related");
    relatedDiv.innerHTML = "";

    relatedData.query.search.forEach(result => {
      const btn = document.createElement("button");
      btn.innerText = result.title;
      btn.onclick = () => searchTopic(result.title);
      relatedDiv.appendChild(btn);
    });

    // Simple message for sections
    document.getElementById("sections").innerHTML =
      "<p>Explore related topics to navigate deeper.</p>";

  } catch (error) {
    alert("Error loading topic.");
    console.error(error);
  }
}
