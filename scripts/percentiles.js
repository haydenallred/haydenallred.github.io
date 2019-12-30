

var pr = [];
var traits = [];


date = new Date();
document.getElementById("currently").innerHTML = "Currently: " + date.toUTCString();


collectTraits();

function collectTraits() {
    // get reference of traits
    var docRef = db.collection("data").doc("personality-traits");

    docRef.get().then(function(doc) {
        if (doc.exists) {
            traits = doc.data();
            console.log(traits);
            collectRankings();
        } else {
            console.log("No document for percentile rankings!");
        }
    }).catch(function(error) {
        console.log("Error getting percentile rankings:", error);
        alert("Error getting percentile rankings!");
    });
}

function collectRankings() {
    // get reference of rankings
    var docRef = db.collection("data").doc("percentile-rankings");

    docRef.get().then(function(doc) {
        if (doc.exists) {
            document.getElementById("lastUpdated").innerHTML = "Last Updated: " + doc.data().lastUpdated;
            pr = doc.data().data;
            console.log(pr);
            createElements();
        } else {
            console.log("No document for percentile rankings!");
        }
    })
    .catch(function(error) {
        console.log("Error getting percentile rankings:", error);
        alert("Error getting percentile rankings!");
    });
}

function createElements() {
    var results = document.getElementById("results");
    var links = document.getElementById("links");

    for (let i = 0; i < 30; i++) {
        let section = document.createElement('section');
        let h2 = document.createElement('h2');
        h2.innerHTML = traits.traits[i].trait;
        h2.setAttribute('id', traits.traits[i].trait);
        section.appendChild(h2);

        let p = document.createElement('p');
        let link = document.createElement('a');
        link.setAttribute('href', "#" + traits.traits[i].trait);
        link.innerHTML = traits.traits[i].trait;
        p.appendChild(link);
        links.appendChild(p);

        let list = document.createElement('ul');
        for (let x = 0; x < pr[i].data.length; x++) {
            let text = pr[i].data[x].name + ": " + pr[i].data[x].percentile;
            let item = document.createElement('li');
            item.innerHTML = text;

            let textbox = document.createElement('input');
            textbox.setAttribute('type', 'text');
            textbox.setAttribute('name', traits.traits[i].trait + pr[i].data[x].name);
            textbox.setAttribute('id', traits.traits[i].trait + pr[i].data[x].name);
            textbox.setAttribute('placeholder', pr[i].data[x].elo);
            item.appendChild(textbox);

            //console.log(traits.traits[i].trait + ": " + pr[i].data[x].name + " (" + pr[i].data[x].elo + ")");

            list.appendChild(item);
        }

        section.appendChild(list);

        let saveButton = document.createElement('button');
        saveButton.setAttribute('type', 'button');
        saveButton.innerHTML = "Save " + traits.traits[i].trait + " elo ratings";
        saveButton.setAttribute('onclick', "saveChanges(" + i + ")");
        section.appendChild(saveButton);

        results.appendChild(section);
    }
}

function saveChanges(i) {

    let count = 0;

    for (let x = 0; x < pr[i].data.length; x++) {
        //console.log(traits.traits[i].trait + ": " + pr[i].data[x].name + " (" + pr[i].data[x].elo + ")");
        let textBox = document.getElementById(traits.traits[i].trait + pr[i].data[x].name);
        if (textBox.value != "") {
            let id = pr[i].data[x].id;
            count++;
            var docRef = db.collection("character-profiles").doc(id);

            docRef.get().then(function(doc) {
                if (doc.exists) {
                    let character = _.clone(doc.data());
                    character.traits[i] = parseInt(textBox.value);
                    updateCharacter(character);
                } else {
                    console.log("No document for character!");
                }
            })
            .catch(function(error) {
                console.log("Error getting character data:", error);
                alert("Error getting character data!");
            });
        }
    }

    alert("Updated " + count + " character(s)");
}

function updateCharacter(character) {
    db.collection("character-profiles").doc(character.id).set(character)
            .then(function() {
                console.log("Updated " + character.name)
            })
            .catch(function(error) {
                console.error("Error updating character: ", error);
                alert("Error updating character");
            });
}