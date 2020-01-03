


var characters;
var responses = [];
var traits;

var results = [];

class matchDetails {
    constructor(characterName, nearMatches, bonus, averageDifference, match) {
        this.characterName = characterName;
        this.bonus = bonus;
        this.averageDifference = averageDifference;
        this.match = match;
        this.nearMatches = nearMatches;
    }
}

class singlePersonResult {
    constructor(name, gender, percentiles, matches) {
        this.name = name;
        this.gender = gender;
        this.percentiles = percentiles;
        this.matches = matches;
    }
}

loadTraits();

function createElements(info) {
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
    
    let section = document.createElement('section');
    let list = document.createElement('ul');
    for (let i = 0; i < info.matches.length; i++) {
        let item = document.createElement('li');
        let h2 = document.createElement('h2');
        h2.innerHTML = info.matches[i].match + "% " + info.matches[i].characterName;
        let p = document.createElement('p');
        let text = info.matches[i].nearMatches + " +-5% | Bonus: " + info.matches[i].bonus + "% | Avg Diff: " + info.matches[i].averageDifference + "%";
        p.innerHTML = text;
        item.appendChild(h2);
        item.appendChild(p);
        list.appendChild(item);
    }
    section.appendChild(list);
    resultsDiv.appendChild(section);
}

function changeUser() {
    let userSelector = document.getElementById("userSelector");
    let name = userSelector.options[userSelector.selectedIndex].text;
    
    for (let i = 0; i < results.length; i++) {
        if (results[i].name == name) {
            createElements(results[i]);
            break;
        }
    }
}

function createDisplayElements() {
    for (let i = 0; i < results.length; i++) {
        let option = document.createElement('option');
        option.value = results[i].name;
        option.innerHTML = results[i].name;
        document.getElementById("userSelector").appendChild(option);
    }
    sortSelect(document.getElementById("userSelector"));
    changeUser();
}

function loadTraits() {
    var docRef = db.collection("data").doc("personality-traits");
    docRef.get().then(function(doc) {
        if (doc.exists) {
            traits = doc.data().traits;
            console.log(traits);
            loadCharacters();
        } else {
            console.log("No document for static character list!");
        }
    }).catch(function(error) {
        console.log("Error getting static character list:", error);
    });
}

function loadCharacters() {
    var docRef = db.collection("data").doc("temp-static-characters");
    docRef.get().then(function(doc) {
        if (doc.exists) {
            characters = doc.data().data;
            console.log(characters);
            loadResponses();
        } else {
            console.log("No document for static character list!");
        }
    }).catch(function(error) {
        console.log("Error getting static character list:", error);
    });
}

function loadResponses() {
    let responseIndex = 0;

    // gather user personality profiles
    db.collection("user-personality-profiles").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            //console.log(doc.data());
            responses[responseIndex] = doc.data();
            responseIndex++;
        })
        console.log("Retrieved all personality profiles");
        console.log(responses);
        for (let i = 0; i < responses.length; i++) {
            runAnalysis(responses[i], i);
        }
        console.log("Analysis complete!");
        sortResults();
        //console.log(results);
    });
}

function sortResults() {
    for (let i = 0; i < results.length; i++) {
        
        results[i].matches.sort(function(a, b) {
            return a.match - b.match;
        });
        results[i].matches.reverse();
        
        /*console.log(results[i].name);
        for (let matchIndex = 0; matchIndex < results[i].matches.length; matchIndex++) {
            console.log(results[i].matches[matchIndex]);
        }*/
    }
    //console.log(results);
    createDisplayElements();
}

function runAnalysis(user, index) {

    let matches = [];
    let currentResult = new singlePersonResult(user.name, user.gender, user.percentiles, matches);
    
    for (let i = 0; i < characters.length; i++) {

        currentResult.name = user.name;
        currentResult.gender = user.gender;
        currentResult.percentiles = user.percentiles;

        let character = characters[i];
        let totalDifference = 0;
        let nearBonus = 0;
        let nearTraits = 0;

        for (let traitIndex = 0; traitIndex < 30; traitIndex++) {
            let uValue = user.percentiles[traitIndex];
            let cValue = characters[i].percentiles[traitIndex];
            //console.log(traits[traitIndex].trait + ": " + user.name + " (" + uValue + ") | " + character.name + " (" + cValue+ ")");
        
            // find differences

            let difference = Math.abs(cValue - uValue);
            difference = Math.round(difference * 100) / 100;
            totalDifference += difference;

            if (difference <= 5) {
                // add adjustment for being within 5%
                let average = (cValue + uValue) / 2;
                average = Math.round(average * 100) / 100;

                let range = Math.abs(50 - average); // how far it is away from 50
                let adjustmentValue = range / 45;
                
                nearBonus += adjustmentValue;
                //console.log("Near bonus on " + traits[traitIndex].trait + ": " + adjustmentValue + " (Average: " + average + ")");
                nearTraits++;
            }
        }
        
        nearBonus = Math.round(nearBonus * 100) / 100;
        totalDifference /= 30;
        let match = (100 - (Math.round(totalDifference * 100) / 100)) + nearBonus;
        match = Math.round(match * 100) / 100;
        totalDifference = Math.round(totalDifference * 100) / 100;

        let matchDetail = new matchDetails(character.name, nearTraits, nearBonus, totalDifference, match);
        currentResult.matches[i] = matchDetail;

        //console.log(differences);
        //console.log("Near bonus: " + nearBonus);
        //console.log("Near traits: " + nearTraits);
        //console.log(user.name + " & " + character.name + ": " + match + "% match");
    }

    results[index] = currentResult;

}

function sortSelect(selElem) {
    var tmpAry = new Array();
    for (var i=0;i<selElem.options.length;i++) {
        tmpAry[i] = new Array();
        tmpAry[i][0] = selElem.options[i].text;
        tmpAry[i][1] = selElem.options[i].value;
    }
    tmpAry.sort();
    while (selElem.options.length > 0) {
        selElem.options[0] = null;
    }
    for (var i=0;i<tmpAry.length;i++) {
        var op = new Option(tmpAry[i][0], tmpAry[i][1]);
        selElem.options[i] = op;
    }
    return;
}