// Runs only on archive.html (since that's where the gallery exists)
(function () {
  const galleryEl = document.getElementById("sample-gallery");
  if (!galleryEl) return; // Guard: don't run on index/home

  const layoutEl = document.querySelector(".layout");
  const cardEl = document.getElementById("sample-details");
  const closeBtn = document.getElementById("close-card");

  const titleEl = document.getElementById("sample-title");
  const tagsEl = document.getElementById("sample-tags");
  const recipeEl = document.getElementById("sample-recipe");
  const descEl = document.getElementById("sample-description");

  const microImg = document.getElementById("micro-image");
  const lightboxImg = document.getElementById("lightbox-image");
  const scanImg = document.getElementById("scan-image");

  const filterBtns = Array.from(document.querySelectorAll(".filter-btn"));

  // Build path like: img/micro/01_micro.png
  const imgPath = (id, type) => `img/${type}/${id}_${type}.png`;

  // Load images safely (hide if missing)
  const safeLoad = (imgEl, src) => {
    imgEl.classList.add("hidden");
    imgEl.onload = () => imgEl.classList.remove("hidden");
    imgEl.onerror = () => imgEl.classList.add("hidden");
    imgEl.src = src;
  };

  // Render gallery thumbnails (using scans as thumbs)
  const renderGallery = (data) => {
    galleryEl.innerHTML = "";
    data.forEach(sample => {
      const thumb = document.createElement("img");
      thumb.alt = sample.name || sample.id;
      thumb.loading = "lazy";
      thumb.decoding = "async";
      thumb.src = imgPath(sample.id, "scans");
      thumb.onerror = () => thumb.remove(); // avoid broken icons
      thumb.addEventListener("click", () => openCard(sample));
      galleryEl.appendChild(thumb);
    });
    // reset layout/card state
    layoutEl.classList.remove("card-open");
    cardEl.classList.remove("active");
  };

  const openCard = (sample) => {
    titleEl.textContent = sample.name || sample.id;
    tagsEl.innerHTML = (sample.tags || []).map(t => `<span>${t}</span>`).join("");
    recipeEl.textContent = sample.recipe || "";
    const desc = (sample.description || "").replace(/\\n/g, "\n");
    descEl.textContent = desc;

    const types = new Set(sample.images || []);
    if (types.has("micro"))    safeLoad(microImg,    imgPath(sample.id, "micro"));
    else microImg.classList.add("hidden");

    if (types.has("lightbox")) safeLoad(lightboxImg, imgPath(sample.id, "lightbox"));
    else lightboxImg.classList.add("hidden");

    if (types.has("scans"))    safeLoad(scanImg,     imgPath(sample.id, "scans"));
    else scanImg.classList.add("hidden");

    cardEl.classList.add("active");
    layoutEl.classList.add("card-open");

    cardEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  closeBtn.addEventListener("click", () => {
    cardEl.classList.remove("active");
    layoutEl.classList.remove("card-open");
  });

  // Filtering
  let allData = [];
  const applyFilter = (tag) => {
    const filtered = tag === "all"
      ? allData
      : allData.filter(s => (s.tags || []).includes(tag));
    renderGallery(filtered);
  };

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilter(btn.dataset.tag);
    });
  });

  // Load data
  fetch("samples.json", { cache: "no-store" })
    .then(r => r.json())
    .then(json => {
      allData = json || [];
      renderGallery(allData); // default: all
    })
    .catch(err => {
      console.error("Failed to load samples.json", err);
      allData = [];
      renderGallery(allData);
    });
})();
