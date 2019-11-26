const requestURL = "https://byui-cit230.github.io/lessons/lesson-09/data/latter-day-prophets.json";

fetch(requestURL).then(function (response) {
    return response.json();
})
.then(function(jsonObject) {
    console.table(jsonObject); // temporaryily checking for a valid response and data parsing
    const prophets = jsonObject['prophets'];
    for (let i = 0; i < prophets.length; i++) {
        
        let card = document.createElement('section');
        let h2 = document.createElement('h2');
        let paragraph1 = document.createElement('p');
        let paragraph2 = document.createElement('p');
        let image = document.createElement('img');
        
        h2.textContent = prophets[i].name + " " + prophets[i].lastname;
        paragraph1.textContent = "Date of Birth: " + prophets[i].birthdate;
        paragraph2.textContent = "Place of Birth: " + prophets[i].birthplace;

        image.setAttribute("src", prophets[i].imageurl);
        let alt = "Picture of " + prophets[i].name + " " + prophets[i].lastname + " - " + prophets[i].order;
        image.setAttribute("alt", alt)

        card.appendChild(h2);
        card.appendChild(paragraph1);
        card.appendChild(paragraph2);
        card.appendChild(image);

        document.querySelector('div.cards').appendChild(card);
    }
});