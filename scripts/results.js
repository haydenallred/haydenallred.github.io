


var characters;
var responses = [];
var traits;

var results = [];

var maximums = [];
var maximumsStrings = [];
var minimums = [];
var minimumsStrings = [];

for (let i = 0; i < 30; i++) {
    maximums[i] = 0;
    minimums[i] = 100;
}

class matchDetails {
    constructor(characterName, nearMatches, bonus, averageDifference, match, percentiles) {
        this.characterName = characterName;
        this.bonus = bonus;
        this.averageDifference = averageDifference;
        this.match = match;
        this.nearMatches = nearMatches;
        this.percentiles = percentiles;
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

        let id = info.matches[i].characterName;
        id = id.replace(/\s+/g, '');
        id = id.replace(".", "");
        id = id.replace("-", "");

        let item = document.createElement('li');
        let clickEvent = "toggleDetails(" + id + ")";
        item.setAttribute('onclick', clickEvent);
        let h2 = document.createElement('h2');
        h2.innerHTML = info.matches[i].match + "% " + info.matches[i].characterName;
        let p = document.createElement('p');
        let text = info.matches[i].nearMatches + " +-6% | Bonus: " + info.matches[i].bonus + "% | Avg Diff: " + info.matches[i].averageDifference + "%";
        p.innerHTML = text;
        item.appendChild(h2);
        item.appendChild(p);
        list.appendChild(item);

        let details = document.createElement('li');
        details.classList.add("details");
        details.style.display = "none";
        
        details.setAttribute('id', id);
        let traitUl = document.createElement('ul');

        for (let x = 0; x < traits.length; x++) {
            let traitLi = document.createElement('li');
            //console.log(info.matches[i]);
            traitLi.innerHTML = traits[x].trait.toUpperCase() + ": user: " + info.percentiles[x] + " | character: " + info.matches[i].percentiles[x];
            traitLi.classList.add('details-li');
            if (Math.abs(info.percentiles[x] - info.matches[i].percentiles[x]) <= 6) {
                traitLi.classList.add('bold');
            }
            traitUl.appendChild(traitLi);
        }
        details.appendChild(traitUl);
        list.appendChild(details);
    }
    section.appendChild(list);
    resultsDiv.appendChild(section);
}

function toggleDetails(id) {
    console.log(id.id);
    let detail = document.getElementById(id.id);
    if (detail.style.display == "none") {
        detail.style.display = "flex";
        //console.log("make see go");
    } else {
        detail.style.display = "none";
        //console.log("make bye bye go");
    }
    console.log(detail);
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
        console.log("Maximums:");
        console.log(maximumsStrings);
        console.log("Minimums:");
        console.log(minimumsStrings);
        sortResults();
        
        // find out the average number of times each trait was modified
        let timesModified = [];
        for (let i = 0; i < 30; i++) {
            timesModified[i] = 0;
        }
        for (let i = 0; i < responses.length; i++) {
            for (let x = 0; x < 30; x++) {
                timesModified[x] += responses[i].timesModified[x];
            }
        }
        for (let i = 0; i < 30; i++) {
            let averageTimesModified = timesModified[i] / responses.length;
            averageTimesModified = Math.round(averageTimesModified * 100) / 100;
            console.log(traits[i].trait + ": " + averageTimesModified);
        }

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

            if (difference <= 6) {
                // add adjustment for being within 6%
                let average = (cValue + uValue) / 2;
                average = Math.round(average * 100) / 100;

                let range = Math.abs(50 - average); // how far it is away from 50
                let adjustmentValue = range / 45;
                
                nearBonus += adjustmentValue;
                //console.log("Near bonus on " + traits[traitIndex].trait + ": " + adjustmentValue + " (Average: " + average + ")");
                nearTraits++;
            }

            if (uValue < minimums[traitIndex]) {
                minimums[traitIndex] = uValue;
                minimumsStrings[traitIndex] = traits[traitIndex].trait + ": " + user.name;
            }
            if (uValue > maximums[traitIndex]) {
                maximums[traitIndex] = uValue;
                maximumsStrings[traitIndex] = traits[traitIndex].trait + ": " + user.name;
            }

        }
        
        nearBonus = Math.round(nearBonus * 100) / 100;
        totalDifference /= 30;
        let match = (100 - (Math.round(totalDifference * 100) / 100)) + nearBonus;
        match = Math.round(match * 100) / 100;
        totalDifference = Math.round(totalDifference * 100) / 100;

        let matchDetail = new matchDetails(character.name, nearTraits, nearBonus, totalDifference, match, character.percentiles);
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