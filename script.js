async function searchTopic(topicOverride = null) {
  const topic = topicOverride || document.getElementById("topicInput").value.trim();
  if (!topic) {
    alert("Please enter a topic.");
    return;
  }

  document.getElementById("results").classList.remove("hidden");

  try {
    // Wikipedia summary API
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    );
    const summaryData = await summaryRes.json();

    if (!summaryData.extract) {
      alert("Topic not found.");
      return;
    }

    // Title
    document.getElementById("title").innerText = summaryData.title;

    // Overview
    document.getElementById("overview").innerText =
      summaryData.extract.split(". ").slice(0, 4).join(". ") + ".";

    // Image
    const imageContainer = document.getElementById("image");
    imageContainer.innerHTML = "";
    if (summaryData.thumbnail) {
      imageContainer.innerHTML =
        `<img src="${summaryData.thumbnail.source}" alt="${summaryData.title}">`;
    }

    // Related topics (CORS-safe endpoint)
    const relatedRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(topic)}&srlimit=8`
    );
    const relatedData = await relatedRes.json();

    const relatedDiv = document.getElementById("related");
    relatedDiv.innerHTML = "";

    relatedData.query.search.forEach(result => {
      const btn = document.createElement("button");
      btn.innerText = result.title;
      btn.onclick = () => searchTopic(result.title);
      relatedDiv.appendChild(btn);
    });

  } catch (error) {
    alert("Error loading topic.");
    console.error(error);
  }
}
