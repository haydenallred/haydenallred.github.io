



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
}

function chooseFirstCharacter() { chooseWinner(1); }

function chooseSecondCharacter() { chooseWinner(2); }

function chooseTie() { chooseWinner(0) }

function chooseWinner(winner) {
  
  let rating1 = firstEloBefore;
  let rating2 = secondEloBefore;
  let k = 25;
  let newRating1 = rating1;
  let newRating2 = rating2;
  
  let P1 = (1.0 / (1.0 + Math.pow(10, ((rating1 - rating2) / 400))));
  let P2 = (1.0 / (1.0 + Math.pow(10, ((rating2 - rating1) / 400))));
  
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
    newRating1 = rating1 + k * (0.5 - P1);
    newRating2 = rating2 + k * (0.5 - P2);
  }

  console.log(rating1 + " -> " + newRating1);
  console.log(rating2 + " -> " + newRating2);

}

function chooseSecondCharacter(randomIndex, cList) {
  // create range of choosing the second character
  let minimum = -3; let maximum = 3;
  for (let i = 0; i < 3; i++) {
    if (randomIndex + minimum < 0) {
      minimum++;
      maximum++;
    }
  }
  for (let i = 0; i < 3; i++) {
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
      console.log("No document for first character!");
    }
    }).catch(function(error) {
        console.log("Error getting first character:", error);
    }); 

}

function chooseNewMatchup() {
  firstCharacter = null;
  secondCharacter = null;

  currentTrait = Math.floor(Math.random() * 30);
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
      console.log("Error getting document:", error);
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
  });
}