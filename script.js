async function searchWord() {
  const word = document.getElementById("wordInput").value.trim();
  if (!word) return alert("Enter a word.");

  document.getElementById("results").classList.remove("hidden");

  try {
    // Dictionary API
    const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const dictData = await dictRes.json();

    if (Array.isArray(dictData)) {
      const meaning = dictData[0].meanings[0].definitions[0].definition;
      const synonyms = dictData[0].meanings[0].synonyms || [];
      const antonyms = dictData[0].meanings[0].antonyms || [];

      document.getElementById("meaning").innerText = meaning;

      const synList = document.getElementById("synonyms");
      synList.innerHTML = "";
      synonyms.slice(0,8).forEach(s => {
        synList.innerHTML += `<li>${s}</li>`;
      });

      const antList = document.getElementById("antonyms");
      antList.innerHTML = "";
      antonyms.slice(0,8).forEach(a => {
        antList.innerHTML += `<li>${a}</li>`;
      });
    } else {
      document.getElementById("meaning").innerText = "No dictionary result found.";
    }

    // Wikipedia Explanation
    const wikiRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`
    );
    const wikiData = await wikiRes.json();

    document.getElementById("wiki").innerText = wikiData.extract || "No detailed explanation found.";

    document.getElementById("source").innerHTML =
      `Sources: DictionaryAPI.dev & <a href="${wikiData.content_urls?.desktop?.page || '#'}" target="_blank">Wikipedia</a>`;

  } catch (error) {
    alert("Error fetching data.");
    console.error(error);
  }
}
