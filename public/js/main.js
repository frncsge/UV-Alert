const UVindex = document.getElementById("index-level");
const spfIndicator = document.getElementById("spf-indicator");

function checkUVindexLevel() {
  return parseFloat(UVindex.textContent);
}

function changeUVindexColor() {
  const level = checkUVindexLevel();

  if (level >= 0 && level < 3) {
    UVindex.style.color = "var(--text-uv-low)";
  } else if (level >= 3 && level < 6) {
    UVindex.style.color = "var(--text-uv-moderate)";
  } else if (level >= 6 && level < 8) {
    UVindex.style.color = "var(--text-uv-high)";
  } else if (level >= 8 && level < 11) {
    UVindex.style.color = "var(--text-uv-very-high)";
  } else {
    UVindex.style.color = "var(--text-uv-extreme)";
  }
}

document.addEventListener("DOMContentLoaded", changeUVindexColor);
