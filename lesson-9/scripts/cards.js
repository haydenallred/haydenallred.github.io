
const requestURL = "https://byui-cit230.github.io/weather/data/towndata.json";

fetch(requestURL) .then(function (response){
    return response.json();
}) .then(function (jsonObject){
    //console.table(jsonObject);

    let towns = jsonObject["towns"];
    console.log(towns);

    for(let i = 0; i < towns.length; i++) {
        let name = towns[i].name;
        if (name == "Fish Haven" || name == "Preston" || name == "Soda Springs") {
            
            let card = document.createElement("article");
            let textElements = document.createElement("section");
            let h2 = document.createElement("h2");
            let h4 = document.createElement("h4");
            let founded = document.createElement("p");
            let population = document.createElement("p");
            let rainfall = document.createElement("p");
            let image = document.createElement("img");

            h2.textContent = towns[i].name;
            h4.textContent = towns[i].motto;
            population.textContent = "Population: " + towns[i].currentPopulation;
            founded.textContent = "Year Founded: " + towns[i].yearFounded;
            rainfall.textContent = "Average Rainfall: " + towns[i].averageRainfall + " inches";
            image.setAttribute("src", "images/" + towns[i].photo);
            image.setAttribute("alt", "Picture of " + towns[i].name);

            textElements.appendChild(h2);
            textElements.appendChild(h4);
            textElements.appendChild(founded);
            textElements.appendChild(population);
            textElements.appendChild(rainfall);
            card.appendChild(textElements);
            card.appendChild(image);
            card.classList.add("card-box", "homepage-content");
            document.getElementById("cards").appendChild(card);
        }
    }
});