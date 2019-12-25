

var pr = [];
var traits = [];


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
        console.log(pr[i].data.length);
        for (let x = 0; x < pr[i].data.length; x++) {
            let text = pr[i].data[x].name + ": " + pr[i].data[x].percentile;
            let item = document.createElement('li');
            item.innerHTML = text;
            list.appendChild(item);
        }

        section.appendChild(list);
        results.appendChild(section);
    }
}