

var traits = [];
var characters = [];


collectTraits();

function collectTraits() {
    // get reference of traits
    var docRef = db.collection("data").doc("personality-traits");

    docRef.get().then(function(doc) {
        if (doc.exists) {
            traits = doc.data();
            //console.log(traits);
            collectCharacters();
        } else {
            console.log("No document for percentile rankings!");
        }
    }).catch(function(error) {
        console.log("Error getting percentile rankings:", error);
        alert("Error getting percentile rankings!");
    });
}

function collectCharacters() {

    let characterReference = db.collection("data").doc("temp-static-characters");
    characterReference.get().then(function(doc) {
        characters = _.clone(doc.data().data);
        createElements();
    }).catch(function(error) {
        console.log("Error gathering characters!");
    });
}

function createElements() {
    
    let characterSelect = document.getElementById("characterSelector");

    for (let i = 0; i < characters.length; i++) {
        // <option value="choose" selected="">Choose a character</option>
        let option = document.createElement('option');
        option.value = characters[i].name;
        option.innerHTML = characters[i].name;
        characterSelect.appendChild(option);
    }

    sortSelect(characterSelect);
    changeCharacter();

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

function changeCharacter() {
    let characterSelect = document.getElementById("characterSelector");
    let name = characterSelect.options[characterSelect.selectedIndex].text;
    let traitList = document.getElementById("traitList");
    //console.log(name);
    traitList.innerHTML = "";

    for (let x = 0; x < characters.length; x++) {
        if (characters[x].name == name) {
            for (let i = 0; i < traits.traits.length; i++) {
                //console.log(traits.traits[i].trait + ": " + characters[x].percentiles[i]);
                
                let trait = traits.traits[i].trait;
                let percentile = characters[x].percentiles[i];
                let item = document.createElement('li');
                item.innerHTML = trait + ": " + percentile;

                let className = "regular-item";

                if (percentile >= 80 || percentile <= 20) {
                    className = "extreme";
                }

                if (percentile >= 90 || percentile <= 10) {
                    className = "most-extreme";
                }

                if (percentile <= 1 || percentile >= 99) {
                    className = "definitive";
                }

                item.classList.add(className);
                
                traitList.appendChild(item);
            }
            break;
        }
    }

}