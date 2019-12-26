



var characters = [];
var traits = [];
var pr = [];

var currentTrait = 0;
var firstCharacter;
var secondCharacter;
var firstEloBefore;
var secondEloBefore;

var sortedCharacters = {
  traits: []
};

collectTraits();

function setUpElements() {
  document.getElementById("trait").innerHTML = traits[currentTrait].trait;
  document.getElementById("definition").innerHTML = traits[currentTrait].definition;
  document.getElementById("button1").innerHTML = firstCharacter.name;
  document.getElementById("button2").innerHTML = secondCharacter.name;

  document.getElementById("button1").disabled = false;
  document.getElementById("button2").disabled = false;
  document.getElementById("tie").disabled = false;
}

function chooseFirstWinner() { chooseWinner(1); }

function chooseSecondWinner() { chooseWinner(2); }

function chooseTie() { chooseWinner(0) }

function chooseWinner(winner) {

  document.getElementById("button1").disabled = true;
  document.getElementById("button2").disabled = true;
  document.getElementById("tie").disabled = true;
  
  let rating1 = firstEloBefore;
  let rating2 = secondEloBefore;
  let k = 25;
  let newRating1 = rating1;
  let newRating2 = rating2;
  
  let P1 = (1.0 / (1.0 + Math.pow(10, ((rating2 - rating1) / 400))));
  let P2 = (1.0 / (1.0 + Math.pow(10, ((rating1 - rating2) / 400))));

  console.log("P1: " + P1);
  console.log("P2: " + P2);
  
  if (winner == 1) {
    // left movie wins
    console.log("First movie wins");
    newRating1 = rating1 + k * (1 - P1);
    newRating2 = rating2 + k * (0 - P2);
  } else if (winner == 2) {
    // right movie wins
    console.log("Second movie wins");
    newRating1 = rating1 + k * (0 - P1);
    newRating2 = rating2 + k * (1 - P2);
  } else if (winner == 0) {
    // tie
    console.log("It's a tie!");
    k *= 5;
    newRating1 = rating1 + k * (0.5 - P1);
    newRating2 = rating2 + k * (0.5 - P2);
  }

  newRating1 = Math.round(newRating1);
  newRating2 = Math.round(newRating2);

  console.log(rating1 + " -> " + newRating1);
  console.log(rating2 + " -> " + newRating2);

  firstCharacter.traits[currentTrait] = newRating1;
  secondCharacter.traits[currentTrait] = newRating2;
  console.log(firstCharacter);
  console.log(secondCharacter);

  document.getElementById("button1").innerHTML = rating1 + " -> " + newRating1;
  document.getElementById("button2").innerHTML = rating2 + " -> " + newRating2;

  updateCharacter1(newRating1, newRating2);

}

function updateCharacter1(newRating1, newRating2) {
  db.collection("character-profiles").doc(firstCharacter.id).set(firstCharacter)
  .then(function() {
      console.log("Updated " + firstCharacter.name);
      updateCharacter2(newRating2);
  })
  .catch(function(error) {
      console.error("Error updating first character: ", error);
      alert("Error updating first character");
  });
}

function updateCharacter2(newRating2) {
  db.collection("character-profiles").doc(secondCharacter.id).set(secondCharacter)
  .then(function() {
      console.log("Updated " + secondCharacter.name);
      setTimeout(chooseNewMatchup, 1250);
  })
  .catch(function(error) {
      console.error("Error updating second character: ", error);
      alert("Error updating second character");
  });
}

function chooseSecondCharacter(randomIndex, cList) {
  // create range of choosing the second character
  let minimum = -4; let maximum = 4;
  for (let i = 0; i < 4; i++) {
    if (randomIndex + minimum < 0) {
      minimum++;
      maximum++;
    }
  }
  for (let i = 0; i < 4; i++) {
    if (randomIndex + maximum > cList.length - 1) {
      maximum--;
      minimum--;
    }
  }
  //console.log("Minimum: " + minimum);
  //console.log("Maximum: " + maximum);

  let secondRandom = 0;
  let range = maximum - minimum;
  while (secondRandom == 0) {
    secondRandom = Math.floor(Math.random() * (range + 1)) + minimum;
  }
  secondRandom += randomIndex;
  //console.log("Range: " + range);
  //console.log("Second Random: " + secondRandom);
  
  // get reference of second character
  var docRef = db.collection("character-profiles").doc(cList[secondRandom].id);

  docRef.get().then(function(doc) {
    if (doc.exists) {
      secondCharacter = doc.data();
      console.log("Character 2: " + secondCharacter.name + " | " + secondCharacter.traits[currentTrait]);
      secondEloBefore = secondCharacter.traits[currentTrait];

      setUpElements();
    } else {
      // doc.data() will be undefined in this case
      console.log("No document for second character!");
    }
    }).catch(function(error) {
        console.log("Error getting second character:", error);
        alert("Error getting second character");
    }); 

}

function chooseNewMatchup() {

  // disable elements
  document.getElementById("button1").disabled = true;
  document.getElementById("button2").disabled = true;
  document.getElementById("tie").disabled = true;

  firstCharacter = null;
  secondCharacter = null;

  let actuallyRandom = Math.floor(Math.random() * 5)
  if (actuallyRandom < 4) {
    // choose an actually random one
    currentTrait = Math.floor(Math.random() * 30);
    console.log("Actual random trait");
  } else {
    var randomTraits = [6, 7, 12];
    var randomTrait = Math.floor(Math.random() * 3);
    currentTrait = randomTraits[randomTrait];
    console.log("Pseudo random trait");
  }
  
  console.log("Trait: " + traits[currentTrait].trait)
  let cList = pr[currentTrait];
  console.log(cList);

  let randomIndex = Math.floor(Math.random() * cList.length);
  //console.log("Random: " + randomIndex);

  // get reference of first character
  var docRef = db.collection("character-profiles").doc(cList[randomIndex].id);

  docRef.get().then(function(doc) {
      if (doc.exists) {
        firstCharacter = doc.data();
        console.log("Character 1: " + firstCharacter.name + " | " + firstCharacter.traits[currentTrait]);
        firstEloBefore = firstCharacter.traits[currentTrait];
        chooseSecondCharacter(randomIndex, cList);
      } else {
        // doc.data() will be undefined in this case
        console.log("No document for first character!");
      }
  }).catch(function(error) {
      console.log("Error getting first character:", error);
      alert("Error getting first character");
  });
}

function collectCharacters() {
  
  //get static reference
  
  var docRef = db.collection("data").doc("percentile-rankings");

  docRef.get().then(function(doc) {
      if (doc.exists) {
        for (let i = 0; i < 30; i ++) {
          pr[i] = doc.data().data[i].data;
        }
        //console.log(pr);
        chooseNewMatchup();
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting characters:", error);
      alert("Error getting characters");
  });
  
}

// get traits
function collectTraits() {
  var docRef = db.collection("data").doc("personality-traits");
  docRef.get().then(function(doc) {
      if (doc.exists) {
          traits = doc.data().traits;
          //console.log(traits);
          collectCharacters();
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
      alert("Error getting traits");
  });
}