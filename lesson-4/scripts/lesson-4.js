let daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let monthsOfTheYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let date = new Date(document.lastModified);
let day = date.getDate();
let dayName = daysOfTheWeek[date.getDay()];
let month = monthsOfTheYear[date.getMonth()];
let year = date.getFullYear();

let lastUpdated = dayName + ", " + day + " " + month + " " + year;

let lastUpdatedElement = document.getElementById("last-updated");
lastUpdatedElement.textContent = "Last Updated " + lastUpdated;

function toggleMenu() {
    let menu = document.getElementById("menu");
    menu.classList.toggle("expanded");
}