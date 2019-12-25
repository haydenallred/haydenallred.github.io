



var characters = [50];

var sortedCharacters = {
  traits: []
};

collectCharacters();

function collectCharacters() {
  
  //get static reference
  
  var docRef = db.collection("data").doc("temp-static-characters");

  docRef.get().then(function(doc) {
      if (doc.exists) {
        characters = doc.data().data;
        //console.log(characters);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
  
}

function sortCharacters() {
  
  for (let i = 0; i < 30; i++) {
    let characterSort = _.clone(characters);
    characterSort.sort(function(a, b) {
    return a.traits[i] - b.traits[i]; 
  });
  characterSort.reverse();
  sortedCharacters.traits[i] = characterSort;
  }
  
  //console.log(sortedCharacters);
  assignRankings();
}

function assignRankings() {
  for (let currentTrait = 0; currentTrait < 30; currentTrait++) {
    
    
    let currentRank = 0;
    let cList = sortedCharacters.traits[currentTrait];
    let currentElo = 0;
    
    /* cList[0] = {
      gender: female,
      name: Elastigirl,
      traits: [],
      ranks: [],
      percentiles: []
    }*/
    
    // assign rankings
    for (let i = 0; i < cList.length; i++) {
      cList[i].ranks[currentTrait] = currentRank;
      currentElo = cList[i].traits[currentTrait];
      var additionalMatchingElos = 0;
      for (let x = i; x < cList.length; x++) {
        if (cList[x].traits[currentTrait] == currentElo) {
          additionalMatchingElos++;
          cList[x].ranks[currentTrait] = currentRank;
        }
      }
      i+= additionalMatchingElos - 1;
      currentRank++;
    }
    
    // assign percentile rankings
    currentRank--; // this is how many total ranks we have for our percentile
    let pointsPerRank = 100 / currentRank;
    for (let i = 0; i < cList.length; i++) {
      let percentile = cList[i].ranks[currentTrait] * pointsPerRank;
      percentile = 100 - percentile;
      
      percentile = Math.round(percentile*10) / 10;
      cList[i].percentiles[currentTrait] = percentile;
    }
  }
  
  console.log(sortedCharacters); 
  
  // upload new profiles of characters
  for (let i = 0; i < characters.length; i++) {
    let character = sortedCharacters.traits[0][i];
    db.collection("character-profiles").doc(character.id).set(character)
    .then(function() {
      console.log("Updated character: " + character.name);
    }) .catch (function(error) {
      console.error("Error writing " + character.name +  " document: ", error);
    });
  }
  
  // create & upload new data reference of percentile rankings
  let percentileRankings = [];
  for (let i = 0; i < 30; i++) {
    let cList = sortedCharacters.traits[i];
    let currentPR = []
    for (let x = 0; x < characters.length; x++) {
      let character = {
        name: sortedCharacters.traits[i][x].name,
        percentile: sortedCharacters.traits[i][x].percentiles[i],
        gender: sortedCharacters.traits[i][x].gender,
        id: sortedCharacters.traits[i][x].id
      };
      currentPR[x] = character;
    }
    percentileRankings[i] = currentPR;
  }
  
  var data = {
    data: []
  };
  
  for (let i = 0; i < 30; i++) {
    data.data[i] = {data: percentileRankings[i]};
  }
  
  db.collection("data").doc("percentile-rankings").set(data)
    .then(function() {
      console.log("Updated percentile rankings");
      alert("Updated Percentile Rankings!");
    }) .catch (function(error) {
      console.error("Error writing percentile rankings document: ", error);
    });
  console.log(percentileRankings);
  
}

function createStaticReferenceOfCharacters() {
  
  var index = 0;
  
   db.collection("character-profiles").get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        characters[index] = {
          name: doc.data().name,
          gender: doc.data().gender,
          traits: doc.data().traits,
          percentiles: [],
          ranks: [],
          id: doc.id
        }; //doc.data();
        index++;
        if (index == 50) {
          db.collection("data").doc("temp-static-characters").set({
            data: characters
          })
          .then(function() {
              console.log("created");
              alert("Static Character Information Created");
          })
          .catch(function(error) {
              console.error("Error writing document: ", error);
          });
        }
      });
  });
  
}

/*
employees.sort(function(a, b){
    return a.age-b.age
})

function addCharacter(doc) {
  
  // characters = doc.data().characters;
  
  let adjustedValues = doc.data().traitTotals;
  for (let i = 0; i < adjustedValues.length; i++) {
    adjustedValues[i] /= doc.data().traitCounters[i];
    
    let value = adjustedValues[i];
    value -= 50;
    
    let eloRating = 2000;
    eloRating += value * 4;
    
    // console.log(adjustedValues[i] + " --> " + eloRating);
    
    adjustedValues[i] = eloRating;
  }
  
  let characterName = doc.data().name;
  let characterGender = "male";
  
  adjustedValues[6] = 2000;
  adjustedValues[7] = 2000;
  adjustedValues[12] = 2000;
  
  /*
  console.log(characterName);
  console.log(characterGender);
  console.log(adjustedValues); */
  
  /*
  db.collection("character-profiles").doc().set({
    name: characterName,
    gender: characterGender,
    traits: adjustedValues
  })
  .then(function() {
      console.log(characterName + " transferred successfully.");
  })
  .catch(function(error) {
      console.error("Error writing document: ", error);
  }); */
  
//}




// get traits
/*
var docRef = db.collection("data").doc("personality-traits");

docRef.get().then(function(doc) {
    if (doc.exists) {
        console.log("Document data:", doc.data());
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}).catch(function(error) {
    console.log("Error getting document:", error);
}); */