let daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let monthsOfTheYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let date = new Date();
let day = date.getDate();
let dayName = daysOfTheWeek[date.getDay()];
let month = monthsOfTheYear[date.getMonth()];
let year = date.getFullYear();

let todaysDate = dayName + ", " + day + " " + month + " " + year + " MST";

let lastUpdatedElement = document.getElementById("last-updated");
lastUpdatedElement.textContent = todaysDate;

function toggleMenu() {
    let menu = document.getElementById("menu");
    menu.classList.toggle("expanded");
}