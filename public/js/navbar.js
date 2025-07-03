const searchBarContainer = document.getElementById("search-bar-container");
const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");

const searchDropDown = document.getElementById("search-dropdown");
const dropDownLiCon = document.getElementById("search-dropdown-li-container");

const sideNav = document.getElementById("side-nav-menu");
const menuButton = document.getElementsByClassName("menu-container")[0];

const overlay = document.getElementById("overlay");

if (window.innerWidth > 600) {
  sideNav.classList.remove("show");
  menuButton.children[0].classList.remove("change");
  menuButton.children[1].classList.remove("change");
  menuButton.children[2].classList.remove("change");
}

//function for opening the side bar menu for mobile phones
function openMenu(menu) {
  menu.classList.toggle("change");
  sideNav.classList.toggle("show");
  overlay.classList.toggle("active");
}

//handle overlay click
function removeSideBar() {
  sideNav.classList.remove("show");
  //this resets the animation of the menu instead of staying looking like X lol
  menuButton.classList.remove("change");
  overlay.classList.remove("active");
}

//function to check if screen size is more than 600px to remove the side bar and menu icon
window.addEventListener("resize", () => {
  if (window.innerWidth > 600) {
    removeSideBar();
  }
});

//function that send a request to the server using AJAX when search is clicked and the input isn't empty
async function runSearch() {
  dropDownLiCon.innerHTML = "";
  const location = searchBar.value.trim();

  if (location !== "") {
    try {
      //use fetch to request the data from the server
      const response = await fetch(
        `/search?location=${encodeURIComponent(location)}`
      );

      const data = await response.json();

      //check if data is not empty (search is succesful)
      if (data.length === 0) {
        const li = document.createElement("li");
        li.id = "no-match-found";
        li.textContent = "No match found.";

        dropDownLiCon.append(li);
      } else {
        data.forEach((d) => {
          const li = document.createElement("li");
          const a = document.createElement("a");

          a.href = `/search/geocoord?lat=${d.lat}&lon=${d.lon}`;
          a.textContent = `${d.name}, ${d.state}, ${d.country}`;

          li.append(a);
          dropDownLiCon.append(li);
        });
      }

      searchDropDown.style.display = "block";
    } catch (error) {
      console.error("Error fetching:", error);
    }
  }
}

//remove drop down when user clicks outside the search bar
document.addEventListener("click", (event) => {
  if (!searchBarContainer.contains(event.target)) {
    searchDropDown.style.display = "none";
  }
});

//run the search when search button is clicked and input isnt empty
searchButton.addEventListener("click", () => {
  runSearch();
});

//run the search when input isnt empty and enter is pressed down
searchBar.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    //use event.preventdefault() to avoid page refresh when enter is pressed
    event.preventDefault();
    runSearch();
  }
});

overlay.addEventListener("click", removeSideBar);
