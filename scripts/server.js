


var tr = [];
var tm = [];
var template = {
    data: [],
    totalNumber: 0
};
var emptyData = {
    traits: []
};
var min = 0; max = 0;
var responseIndex = 0;
var responses = [];
var personalityTraits = [];

// get personality trait descriptions
var docRef = db.collection("data").doc("personality-traits");
docRef.get().then(function(doc) {
    if (doc.exists) {
        personalityTraits = doc.data().traits;
        console.log(personalityTraits);
    } else {
        console.log("No document for personality traits!");
    }
}).catch(function(error) {
    console.log("Error getting personality traits:", error);
});

function getPersonalityTraitCounters() {

    var docRef = db.collection("data").doc("personality-trait-counters");

    docRef.get().then(function(doc) {
        if (doc.exists) {
            template = doc.data();
            createPercentileRankings();
        } else {
            console.log("No document for personality trait counters!");
        }
    }).catch(function(error) {
        console.log("Error getting personality trait counters:", error);
        alert("Error getting personality trait counters!");
    });

}

function createPercentileRankings() {

    document.getElementById("button3").disabled = true;
    responseIndex = 0;

    // gather user personality profiles
    db.collection("user-personality-profiles").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            //console.log(doc.data());
            addPersonalityProfile(doc.data());
            responses[responseIndex] = doc.data();
            responseIndex++;
            if (template.totalNumber == 48) {
                // continue on to ranking
                calculatePercentiles();
            }
        })
    });
}

function calculatePercentiles() {
    console.log(template);
    for (let i = 0; i < responses.length; i++) {
        calculatePercentile(responses[i]);
    }

    // update user responses
    responseIndex = 0;

    // gather user personality profiles
    db.collection("user-personality-profiles").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            
            for (let i = 0; i < responses.length; i++) {
                if (responses[i].name == doc.data().name) {
                    // found character, now update
                    db.collection("user-personality-profiles").doc(doc.id).set(responses[i])
                        .then(function() {
                        console.log("Updated " + doc.data().name + "'s profile");
                        responseIndex++;
                        if (responseIndex == 48) {
                            // continue on to ranking
                            console.log("Created Percentile Rankings for all User Responses!");
                        }
                        }) .catch (function(error) {
                        console.error("Error updating " + doc.data().name + "'s profile:", error);
                        });
                }
            }
        })
    });
}

function calculatePercentile(user) { // single user percentile. This is where the meat of the alg happens.
    //console.log(user);
    toggleUserFromData(user, true); // REMOVE user from dataset

    for (let traitIndex = 0; traitIndex < 30; traitIndex++) {
        let userValue = user.traits[traitIndex];
        let offsetValue = (userValue * -1) + 200;
        let totalUsers = template.totalNumber;
        //console.log("Trait Value: " + userValue + " | Total Users: " + totalUsers);
        let usersBelow = 0;
        let history = template.data[traitIndex].traits;
        for (let i = 400; i > offsetValue; i--) {
            if (history[i] > 0) {
                usersBelow += history[i];
            }
        }

        let percentileRanking = usersBelow / responses.length;
        percentileRanking = Math.round(percentileRanking * 10000) / 100;

        user.percentiles[traitIndex] = percentileRanking;

        //console.log("Users below " + user.name + " on " + personalityTraits[traitIndex].trait + ": " + usersBelow);
        //console.log(user.name + " " + personalityTraits[traitIndex].trait + ": " + percentileRanking + " percentile");
    }

    toggleUserFromData(user, false); // RETURN user to dataset
}

function toggleUserFromData(user, remove) {

    for (let i = 0; i < 30; i++) {
        let value = user.traits[i];
        let offset = value * -1;
        offset += 200;
        //console.log("Before: " + template.data[i].traits[offset]);
        if (remove) {
            template.data[i].traits[offset]--;
        } else {
            template.data[i].traits[offset]++;
        }
        //console.log("After: " + template.data[i].traits[offset]);
    }

}

function addPersonalityProfile(data) {



    for (let i = 0; i < 30; i++) {
        //console.log(data.name + " trait: " + i + " (" + data.traits[i] + ")");
        
        let value = data.traits[i];
        /*if (value >= max) {
            max = value;
            //console.log("New Max! " + data.name + ": " + value + " (Trait: " + i + ")");
        } else if (value <= min) {
            min = value;
            //console.log("New Min! " + data.name + ": " + value + " (Trait: " + i + ")");
        }*/
        let offset = value * -1;
        offset += 200;
        //console.log("Before: " + template.data[i].traits[offset]);
        template.data[i].traits[offset]++;
        //console.log("After: " + template.data[i].traits[offset]);
        if (i == 0) {
            //console.log("Added ONE at index " + offset + " on trait " + i + " for " + data.name);
        }
    }
    template.totalNumber++;
}

function createBlankPercentileRankings() {
    
    let arrays = [];
    for (let i = 0; i < 30; i++) {
        arrays[i] = emptyData;
    }

    template = {
        data: arrays,
        totalNumber: 0
    };

    for (let i = 0; i < 30; i++) {
        for (let x = 0; x < 401; x++) {
            template.data[i].traits[x] = 0;
        }
    }

    db.collection("data").doc("personality-trait-counters").set(template)
    .then(function() {
      console.log("Uploaded blank template");
    }) .catch (function(error) {
      console.error("Error upoading blank template:", error);
    });
}

function runResults() {

    document.getElementById("button1").disabled = true;

    if (document.getElementById("delete-checkbox").checked) {
        // delete all responses

        console.log("Attempting to remove all old personality profiles");

        let index = 0;
        db.collection("user-personality-profiles").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                index++;
                db.collection("user-personality-profiles").doc(doc.id).delete().then(function() {
                    index--;
                    if (index == 0) {
                        console.log("Removed old personality profiles.");
                        nowRunResults();
                    }
                }).catch(function(error) {
                    console.error("Error removing" + doc.data().name + ": ", error);
                });
            })
        });
        //console.log("Deleted " + index + " old personality profiles");
    } else {
        nowRunResults();
    }

}

function nowRunResults() {
    var responses = [];
    let index = 0;

    db.collection("responses").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            responses[index] = doc.data();
            index++;
        })
        console.log("Retrieved " + responses.length + " responses.");
        for (let i = 0; i < responses.length; i++) {
            runResponse(responses[i]);
        }
    });
}

function resetArrays() {
    tr = [];
    fm = [];
    for (let i = 0; i < 30; i++) {
        tr[i] = 0;
        tm[i] = 0;
    }
}

function runResponse(response) {
    
    resetArrays();
    runQuestions(response);
    let traits = _.clone(tr);
    let timesModified = _.clone(tm);
    let blankArray = [];
    for (let i = 0; i < 30; i++) { blankArray[i] = 0; }

    db.collection("user-personality-profiles").doc().set({
        name: response.name,
        gender: response.gender,
        traits: traits,
        timesModified: timesModified,
        percentiles: blankArray,
        q01: response.q01,
        q02: response.q02,
        q03: response.q03,
        q04: response.q04,
        q05: response.q05,
        q06: response.q06,
        q07: response.q07,
        q08: response.q08,
        q09: response.q09,
        q10: response.q10,
        q11: response.q11,
        q12: response.q12,
        q13: response.q13,
        q14: response.q14,
        q15: response.q15,
        q16: response.q16,
        q17: response.q17,
        q18: response.q18,
        q19: response.q19,
        q20: response.q20,
        q21: response.q21,
        q22: response.q22
    })
    .then(function() {
      console.log("Uploaded personality profile for " + response.name);
      document.getElementById("button1").disabled = false;
    }) .catch (function(error) {
      console.error("Error upoading personality profile for " + response.name + ":", error);
    });

    //console.log("COMPLETED response for " + response.name);
}






// ----------------------------------   Q U E S T I O N S   &   M O D I F I E R S   ----------------------------------

function runQuestions(response) {
    let counter = 0;

    // QUESTION 01: THERE IS A PARTY IN A FEW HOURS WITH SOME OF YOUR CLOSEST FRIENDS.
    // YOU HAVE A LOT OF WORK THAT NEEDS TO BE DONE. WHAT DO YOU DO?
    // ----------
    if (response.q01 == 0) { // SKIP THE PARTY SO I CAN FINISH MY WORK
        silly(-3);
        leaderlike(7);
        loyal(3);
        forgetful(-6);
        confident(4);
        independent(8);
        friendly(-1);
        funny(-2);
        curious(-2);
        adventurous(-3);
        reckless(-10);
        freethinking(-3);
        intelligent(8);
        trustworthy(3);
        clumsy(-2);
        jealous(-4);
        lazy(-10);
        crazy(-3);
    } else if (response.q01 == 1)  { // FINISH MY WORK, AND ARRIVE LATE TOWARDS THE END OF THE PARTY
        silly(-2);
        leaderlike(4);
        genuine(+1);
        loyal(5);
        forgetful(-3);
        confident(3);
        independent(4);
        friendly(1);
        optimistic(+1);
        reckless(-3);
        freethinking(-2);
        intelligent(4);
        trustworthy(2);
        clumsy(-1);
        jealous(-2);
        lazy(-8);
    } else if (response.q01 == 2) { // FINISH MY WORK AND POTENTIALLY MISS THE PARTY. I'LL ARRIVE LATE, IF THE PARTY HASN'T ALREADY ENDED.
        silly(-2);
        leaderlike(7);
        genuine(1);
        loyal(2);
        forgetful(-2);
        confident(3);
        independent(5);
        optimistic(2);
        adventurous(-2);
        reckless(-6);
        freethinking(3);
        intelligent(6);
        trustworthy(2);
        clumsy(-1);
        jealous(-2);
        lazy(-6);
    } else if (response.q01 == 3) { // IGNORE MY WORK SO I CAN GET READY FOR THE PARTY
        silly(6);
        leaderlike(-5);
        loyal(-3);
        forgetful(7);
        confident(2);
        independent(-3);
        friendly(3);
        funny(5);
        optimistic(3);
        curious(3);
        adventurous(6);
        reckless(10);
        freethinking(6);
        intelligent(-3);
        happy(2);
        trustworthy(-3);
        clumsy(2);
        jealous(2);
        properclassy(-3);
        anxious(-2);
        lazy(5);
        crazy(4);
    }

    // QUESTION 02: HOW DO YOU FEEL ABOUT SPORTS?
    // ----------
    if (response.q02 == 0) { // LOVE THEM! I'LL PLAY ANY SPORT WHENEVER I CAN
        athletic(10);
        leaderlike(5);
        loyal(3);
        confident(5);
        independent(3);
        optimistic(1);
        curious(1);
        adventurous(3);
        reckless(3);
        happy(1);
        clumsy(-10);
        anxious(-7);
        lazy(-7);
    } else if (response.q02 == 1) { // I LIKE THEM OVERALL! THERE ARE A FEW SPORTS THAT I REALLY ENJOY PARTICIPATING IN.
        athletic(7);
        leaderlike(3);
        loyal(1);
        confident(4);
        independent(3);
        optimistic(1);
        curious(1);
        adventurous(2);
        reckless(3);
        clumsy(-6);
        anxious(-5);
        lazy(-5);
    } else if (response.q02 == 2) { // THEY AREN'T MY FAVORITE, BUT I'M DECENT AT THEM IF I EVER PARTICIPATE
        athletic(5);
        leaderlike(3);
        confident(3);
        independent(1);
        optimistic(1);
        adventurous(1);
        reckless(1);
        clumsy(-3);
        anxious(-2);
        lazy(-2);
    } else if (response.q02 == 3) { // THEY DEFINITELY AREN'T MY THING. I AVOID THEM AT ALL COSTS AND IF I'M EVER FORCED TO PARTICIPATE, I DON'T DO WELL AT ALL.
        athletic(-10);
        silly(3);
        genuine(1);
        confident(-2);
        optimistic(-2);
        adventurous(-2);
        reckless(-2);
        freethinking(2);
        happy(-1);
        clumsy(8);
        anxious(10);
        lazy(2);
        crazy(3);
    } else if (response.q02 == 4) { // I DON'T LOVE PLAYEM THEM, BUT I DEFINITELY ENJOY WATCHING THEM AND CHEERING ON MY FAVORITE TEAM!
        athletic(-5);
        leaderlike(3);
        genuine(3);
        loyal(5);
        confident(2);
        independent(2);
        friendly(2);
        optimistic(2);
        adventurous(-1);
        freethinking(1);
        happy(2);
        compassionate(2);
        clumsy(2);
        selfish(-2);
        lazy(1);
    }

    // QUESTION 03: WHICH OF THE FOLLOWING SOUNDS MOST LIKE YOU AT A SOCIAL EVENT?
    // ----------
    if (response.q03 == 0) { // I PREFER TO STAY ON THE OUTSKIRTS WITH 1 OR 2 PEOPLE THAT I KNOW BEST. IF OTHERS APPROACH ME, I'M HAPPY TO CHAT WITH THEM, BUT OTHERWISE I WILL PROBABLY KEEP TO MY OWN SMALL GROUP.
        silly(-3);
        leaderlike(-2);
        loyal(2);
        confident(-2);
        independent(-1);
        friendly(-3);
        curious(-2);
        adventurous(-3);
        reckless(-5);
        intelligent(1);
        happy(3);
        jealous(-2);
        selfish(1);
        anxious(5);
        lazy(1);
        easytoanger(-1);
        crazy(2);
    } else if (response.q03 == 1) { // I AM EXTREMELY COMFORTABLE MEETING NEW PEOPLE AND TAKE THE INITIATIVE TO APPROACH OTHERS, INTRODUCING MYSELF.
        silly(1);
        leaderlike(8);
        genuine(5);
        confident(10);
        independent(3);
        friendly(10);
        optimistic(5);
        curious(3);
        adventurous(2);
        reckless(1);
        freethinking(4);
        happy(8);
        jealous(-1);
        selfish(-2);
        anxious(-5);
        lazy(-1);
        easytoanger(-4);
        crazy(-2);
    } else if (response.q03 == 2) { // I'M ALWAYS THE ONE LEADING GAMES OR AT THE CENTER OF THE DANCE CIRCLE!
        silly(6);
        leaderlike(7);
        genuine(3);
        confident(10);
        independent(3);
        friendly(8);
        funny(5);
        optimistic(3);
        curious(1);
        adventurous(6);
        reckless(3);
        freethinking(6);
        happy(10);
        selfish(-3);
        persuasive(1);
        anxious(-4);
        easytoanger(-2);
        crazy(8);
    } else if (response.q03 == 3) { // SOCIAL EVENTS AND PARTIES ARE MY WORST NIGHTMARE
        silly(-3);
        leaderlike(-7);
        confident(-5);
        independent(+2);
        friendly(-5);
        curious(-2);
        adventurous(-3);
        reckless(-1);
        freethinking(1);
        jealous(-2);
        selfish(3);
        anxious(7);
        lazy(1);
        easytoanger(2);
        crazy(2);
    } else if (response.q03 == 4) { // WHILE I DON'T TYPICALLY PRIORITIZE PARTIES AND SOCIAL EVENTS, IF I DO GET THERE, I HAVE A LOT OF FUN DOING A LITTLE BIT OF EVERYTHING.
        silly(1);
        leaderlike(-1);
        loyal(-1);
        forgetful(1);
        confident(3);
        independent(3);
        friendly(2);
        optimistic(3);
        curious(1);
        adventurous(1);
        freethinking(1);
        happy(3);
        compassionate(1);
        trustworthy(2);
        jealous(-1);
        selfish(1);
        anxious(2);
        crazy(2);
    }

    // QUESTION 04: WHAT WOULD BE YOUR IDEAL GIFT TO RECEIVE ON VALENTINE'S DAY?
    // ----------
    if (response.q04 == 0) { // SOMETHING DEEPLY ROMANTIC, LIKE ROSES, CHOCOLATES, AND A HAND-WRITTEN POEM OR LETTER.
        silly(-5);
        genuine(2);
        loyal(3);
        forgetful(-5);
        confident(3);
        spiritual(2);
        independent(-1);
        friendly(3);
        romantic(10);
        funny(-1);
        adventurous(-3);
        freethinking(-3);
        happy(2);
        compassionate(5);
        trustworthy(1);
        selfish(-3);
        properclassy(8);
        lazy(-1);
        easytoanger(-4);
        crazy(-1);
    } else if (response.q04 == 1) { // SOMETHING FUN, LIKE PIZZA OR SILLY SOCKS.
        silly(8);
        genuine(5);
        loyal(3);
        forgetful(-3);
        confident(2);
        independent(2);
        friendly(2)
        romantic(5);
        funny(2);
        optimistic(3);
        curious(3);
        adventurous(4);
        freethinking(5);
        happy(3);
        compassionate(5);
        trustworthy(1);
        selfish(-5);
        properclassy(1);
        lazy(-1);
        crazy(2);
    } else if (response.q04 == 2) { // I'M NOT A FAN OF VALENTINE'S DAY AND PREFER NOT TO CELEBRATE.
        silly(-10);
        leaderlike(-1);
        genuine(-2);
        loyal(-2);
        forgetful(1);
        spiritual(-3);
        independent(1);
        friendly(-2);
        romantic(-10);
        optimistic(-3);
        adventurous(-2);
        freethinking(3);
        happy(-3);
        compassionate(-7);
        jealous(5);
        selfish(7);
        anxious(3);
        lazy(1);
        easytoanger(3);
        crazy(3);
    } else if (response.q04 == 3) { // SOMETHING PRACTICAL THAT I NEED, LIKE A NEW BRIEFCASE OR NEW SUNGLASSES.
        silly(-10);
        genuine(1);
        loyal(2);
        spiritual(-1);
        independent(2);
        romantic(-5);
        curious(-1);
        reckless(-2);
        freethinking(-3);
        intelligent(3);
        happy(1);
        trustworthy(3);
        selfish(2);
        crazy(-3);
    } else if (response.q04 == 4) { // ANYTHING THAT I KNOW MY SIGNIFICANT OTHER SPENT A LOT OF MONEY ON.
        silly(-10);
        genuine(-6);
        loyal(-1);
        forgetful(4);
        confident(-2);
        spiritual(-1);
        independent(-1);
        friendly(-1);
        romantic(-6);
        funny(-2);
        optimistic(-1);
        adventurous(-3);
        reckless(4);
        freethinking(-3);
        happy(-5);
        compassionate(-5);
        trustworthy(-3);
        jealous(10);
        selfish(10);
        properclassy(-6);
        anxious(3);
        lazy(1);
        easytoanger(6);
        crazy(4);
    }

    // QUESTION 05: IF YOU WERE MAKING A RECIPE AT HOME AND REALIZED YOU WERE MISSING AN INGREDIENT, WHAT WOULD YOU MOST LIKELY DO?
    // ----------
    if (response.q05 == 0) { // BECAUSE I TYPICALLY DON'T USE RECIPES, I'M MOSTLY GUESSING ANYWAY, SO THIS WOULDN'T BE THAT BIG OF A DEAL.
        silly(3);
        leaderlike(1);
        forgetful(-2);
        confident(6);
        independent(5);
        optimistic(3);
        adventurous(3);
        reckless(5);
        freethinking(4);
        intelligent(2);
        trustworthy(-2);
        lazy(5);
        crazy(4);
    } else if (response.q05 == 1) { // IMPROVISE, INSTINCTIVELY MODIFYING THE RECIPE TO ACCOMMODATE THE MISSING INGREDIENT. NO PROBLEM!
        leaderlike(3);
        confident(5);
        independent(5);
        optimistic(4);
        curious(1);
        adventurous(3);
        reckless(1);
        freethinking(3);
        intelligent(5);
        anxious(-3);
        lazy(-3);
        easytoanger(-5);
    } else if (response.q05 == 2) { // QUICKLY RESEARCH ONLINE TO SEE IF SUBSTITUTIONS CAN BE MADE, AND PROCEED ACCORDINGLY.
        leaderlike(2);
        loyal(1);
        confident(1);
        independent(1);
        optimistic(1);
        curious(4);
        adventurous(1);
        reckless(-2);
        freethinking(-5);
        intelligent(5);
        trustworthy(3);
        clumsy(-3);
        properclassy(1);
        lazy(-3);
        easytoanger(-2);
        crazy(-3);
    } else if (response.q05 == 3) { // START OVER AND PICK A NEW RECIPE TO MAKE
        silly(-3);
        confident(-2);
        curious(2);
        adventurous(-3);
        reckless(-5);
        freethinking(-2);
        trustworthy(3);
        clumsy(-2);
        anxious(1);
        lazy(2);
        crazy(-3);
    } else if (response.q05 == 4) { // GO TO THE STORE TO BUY THE INGREDIENT
        silly(-2);
        leaderlike(4);
        loyal(2);
        adventurous(-1);
        reckless(-8);
        freethinking(-2);
        intelligent(2);
        trustworthy(5);
        selfish(-3);
        lazy(-6);
    } else if (response.q05 == 5) { // CHANGE MY PLANS AND DECIDE TO ORDER TAKE-OUT INSTEAD
        silly(1);
        leaderlike(-4);
        loyal(-1);
        confident(-3);
        independent(-2);
        adventurous(-2);
        freethinking(-2);
        clumsy(1);
        properclassy(-1);
        anxious(3);
        lazy(6);
        easytoanger(4);
    }

    // QUESTION 06: WHAT SORT OF THINGS DO YOU DAYDREAM ABOUT?
    // ----------
    if (response.q06[0] == true) { // COMPLEX PHILOSOPHICAL QUESTIONS ABOUT THE WORLD
        silly(-3);
        leaderlike(4);
        genuine(3);
        spiritual(5);
        independent(2);
        curious(8);
        adventurous(2);
        reckless(1);
        freethinking(7);
        intelligent(10);
        compassionate(1);
        selfish(1);
        anxious(3);
        lazy(-1);
        crazy(2);
    }
    if (response.q06[1] == true) { // MY SIGNIFICANT OTHER
        genuine(1);
        loyal(8);
        forgetful(-2);
        spiritual(2);
        independent(-3);
        friendly(5);
        romantic(8);
        adventurous(-1);
        freethinking(-2);
        happy(6);
        compassionate(5);
        trustworthy(1);
        jealous(2);
        selfish(-1);
        lazy(1);
        crazy(1);
    }
    if (response.q06[2] == true) { // A DREAM VACATION
        spiritual(2);
        optimistic(2);
        curious(5);
        adventurous(7);
        freethinking(1);
        happy(3);
    }
    if (response.q06[3] == true) { // AN EARLIER SITUATION THAT YOU WISH YOU WOULD HAVE HANDLED DIFFERENTLY
        leaderlike(-2);
        genuine(1);
        confident(-3);
        spiritual(1);
        independent(2);
        curious(5);
        adventurous(1);
        reckless(1);
        freethinking(5);
        intelligent(1);
        happy(-1);
        compassionate(1);
        trustworthy(2);
        clumsy(2);
        jealous(3);
        selfish(-1);
        persuasive(-2);
        properclassy(2);
        anxious(6);
        easytoanger(2);
        crazy(2);
    }
    if (response.q06[4] == true) { // I TYPICALLY DO NOT DAYDREAM
        silly(-3);
        forgetful(2);
        spiritual(-5);
        independent(5);
        romantic(-5);
        funny(-5);
        curious(-8);
        adventurous(-2);
        freethinking(-10);
        intelligent(-1);
        selfish(2);
        persuasive(-3);
        anxious(-2);
        easytoanger(2);
        crazy(-10);
    }

    // QUESTION 07: WHICH OF THE FOLLOWING WOULD YOU PROACTIVELY PURSUE WITHOUT ANY CONVINCING?
    // ----------
    counter = 0;
    if (response.q07[0] == true) { // SKYDIVING
        counter++;
        athletic(5);
        silly(3);
        leaderlike(2);
        genuine(1);
        confident(4);
        independent(2);
        optimistic(2);
        curious(5);
        adventurous(10);
        reckless(8);
        freethinking(3);
        happy(2);
        trustworthy(-2);
        selfish(3);
        properclassy(-2);
        anxious(-5);
        lazy(-2);
        crazy(7);
    }
    if (response.q07[1] == true) { // BUNGEE JUMPING
        counter++;
        athletic(7);
        silly(3);
        leaderlike(2);
        genuine(1);
        confident(4);
        independent(2);
        optimistic(2);
        curious(5);
        adventurous(10);
        reckless(8);
        freethinking(3);
        happy(2);
        trustworthy(-2);
        selfish(2);
        properclassy(-2);
        anxious(-5);
        lazy(-2);
        crazy(7);
    }
    if (response.q07[2] == true) { // MOVING TO A FOREIGN COUNTRY
        counter++;
        silly(1);
        leaderlike(4);
        loyal(-2);
        confident(5);
        spiritual(1);
        independent(5);
        friendly(1);
        optimistic(4);
        curious(5);
        reckless(5);
        freethinking(5);
        intelligent(2);
        compassionate(2);
        jealous(-3);
        selfish(1);
        anxious(-4);
        lazy(-3);
        crazy(2);
    }
    if (response.q07[3] == true) { // SHARK DIVING
        counter++;
        athletic(7);
        silly(2);
        leaderlike(2)
        genuine(1);
        confident(4);
        spiritual(1);
        independent(2);
        optimistic(2);
        curious(5);
        adventurous(10);
        reckless(8);
        freethinking(3);
        intelligent(1);
        happy(2);
        trustworthy(-2);
        selfish(1);
        properclassy(-3);
        anxious(-5);
        lazy(-2);
        crazy(5);
    }
    if (response.q07[4] == true) { // WHITE WATER RAFTING
        counter++;
        athletic(4);
        silly(1);
        leaderlike(3);
        genuine(1);
        confident(3);
        spiritual(1);
        independent(1);
        optimistic(2);
        curious(4);
        adventurous(6);
        reckless(3);
        adventurous(7);
        freethinking(2);
        clumsy(-6);
        selfish(1);
        anxious(-2);
        lazy(-3);
        crazy(1);
    }
    if (response.q07[5] == true) { // SAILING
        counter++;
        athletic(3);
        leaderlike(2);
        genuine(1);
        confident(2);
        spiritual(1);
        independent(1);
        romantic(1);
        optimistic(1);
        curious(3);
        adventurous(4);
        reckless(1);
        freethinking(2);
        intelligent(1);
        clumsy(-5);
        properclassy(2);
        anxious(-2);
        lazy(-3);
        crazy(2);
    }
    if (response.q07[6] == true) { // TAKING A COMMUNITY CLASS FOR SOMETHING YOU DON'T KNOW HOW TO DO, LIKE DANCING, MUSIC, OR COOKING
        counter++;
        athletic(1);
        silly(1);
        leaderlike(4);
        genuine(2);
        confident(3);
        spiritual(1);
        independent(2);
        friendly(2);
        optimistic(2);
        curious(7);
        adventurous(5);
        freethinking(5);
        intelligent(5);
        happy(2);
        selfish(-3);
        properclassy(1);
        anxious(-2);
        lazy(-4);
    }
    if (response.q07[7] == true) { // ADOPTING A PET
        counter++;
        silly(2);
        leaderlike(3);
        genuine(1);
        loyal(6);
        forgetful(-2);
        confident(2);
        spiritual(1);
        friendly(3);
        optimistic(2);
        curious(2);
        adventurous(3);
        reckless(1);
        freethinking(1);
        intelligent(1);
        happy(1);
        compassionate(2);
        trustworthy(1);
        selfish(-4);
        lazy(-1);
        crazy(1);
    }
    if (response.q07[8] == true) { // BEFRIENDING A STRANGER IN PUBLIC
        counter++;
        silly(3);
        leaderlike(3);
        genuine(5);
        confident(5);
        spiritual(1);
        independent(5);
        friendly(10);
        optimistic(2);
        curious(3);
        adventurous(4);
        reckless(2);
        freethinking(5);
        intelligent(1);
        happy(2);
        compassionate(2);
        selfish(-6);
        anxious(-6);
        lazy(-2);
        crazy(2);
    }
    if (response.q07[9] == true) { // SINGING KARAOKE IN PUBLIC
        counter++;
        silly(10);
        leaderlike(3);
        genuine(3);
        confident(7);
        independent(4);
        friendly(2);
        funny(5);
        optimistic(3);
        curious(1);
        reckless(3);
        freethinking(5);
        happy(2);
        properclassy(-3);
        anxious(-3);
        lazy(-1);
        crazy(6);
    }
    if (response.q07[10] == true) { // ZIP LINING
        counter++;
        athletic(6);
        silly(2);
        leaderlike(3);
        genuine(1);
        confident(4);
        spiritual(1);
        independent(2);
        optimistic(3);
        curious(5);
        adventurous(7);
        reckless(3);
        freethinking(2);
        trustworthy(-1);
        selfish(1);
        anxious(-3);
        lazy(-3);
        crazy(4);
    }
    if (counter >= 10) {
        adventurous(15);
    } else if (counter >= 6) {
        adventurous(10);
    } else if (counter == 5) {
        adventurous(7);
    } else if (counter == 4) {
        adventurous(3);
    } else if (counter == 3) {
        adventurous(-3);
    } else if (counter == 2) {
        adventurous(-6);
    } else if (counter == 1) {
        adventurous(-10);
    } else if (counter == 0) {
        adventurous(-15);
    }

    // QUESTION 08: YOU NOTICE A CO-WORKER THAT SEEMS DOWN AT WORK. WHAT DO YOU MOST LIKELY DO?
    // ----------
    if (response.q08 == 0) { // HONESTLY, PROBABLY NOTHING. EVERYONE HAS BAD DAYS. ON MY BAD DAYS, I USUALLY JUST WANT TO KEEP TO MYSELF.
        leaderlike(-8);
        genuine(1);
        loyal(-3);
        spiritual(-3);
        independent(4);
        friendly(-5);
        optimistic(-1);
        curious(-1);
        adventurous(-1);
        reckless(-1);
        freethinking(1);
        intelligent(1);
        happy(-1);
        compassionate(-5);
        trustworthy(-1);
        jealous(3);
        selfish(5);
        properclassy(-3);
        lazy(1);
        easytoanger(2);
        crazy(-1);
    } else if (response.q08 == 1) { // APPROACH THE CO-WORKER ASKING IF EVERYTHING IS OKAY ON YOUR WAY TO YOUR DESK.
        leaderlike(4);
        genuine(1);
        loyal(2);
        confident(4);
        spiritual(1);
        independent(2);
        friendly(2);
        romantic(2);
        curious(2);
        adventurous(1);
        freethinking(1);
        happy(1);
        compassionate(4);
        trustworthy(1);
        jealous(-2);
        selfish(-1);
        properclassy(1);
        anxious(-1);
        lazy(-1);
        easytoanger(-1);
    } else if (response.q08 == 2) { // WRITE AN ENCOURAGING NOTE, LEAVING IT WITH A CANDY BAR YOU'VE NOTICED THEM EATING BEFORE
        silly(3);
        leaderlike(5);
        genuine(1);
        loyal(5);
        forgetful(-4);
        confident(3);
        spiritual(1);
        friendly(3);
        romantic(4);
        funny(1);
        optimistic(3);
        adventurous(1);
        freethinking(2);
        intelligent(2);
        happy(2);
        compassionate(6);
        trustworthy(2);
        selfish(-2);
        properclassy(1);
        anxious(-1);
        lazy(-2);
        easytoanger(-3);
    } else if (response.q08 == 3) { // OFFER TO CHAT IF THERE IS ANYTHING THEY'D LIKE TO GET OFF THEIR CHEST
        leaderlike(5);
        genuine(1);
        loyal(5);
        confident(2);
        spiritual(1);
        independent(1);
        friendly(5);
        romantic(2);
        optimistic(2);
        curious(3);
        adventurous(1);
        freethinking(3);
        happy(2);
        compassionate(5);
        trustworthy(3);
        selfish(-2);
        properclassy(1);
        lazy(-1);
        easytoanger(-1);
    } else if (response.q08 == 4) { // ASK IF YOU CAN TAKE THEM OUT TO LUNCH, MAKING SURE TO LET THEM KNOW YOU APPRECIATE THEIR FRIENDSHIP
        leaderlike(10);
        genuine(1);
        loyal(7);
        confident(2);
        spiritual(1);
        independent(1);
        friendly(10);
        romantic(2);
        optimistic(3);
        curious(2);
        adventurous(1);
        freethinking(4);
        intelligent(1);
        happy(3);
        compassionate(10);
        trustworthy(4);
        selfish(-7);
        properclassy(3);
        lazy(-3);
        easytoanger(-1);
    } else if (response.q08 == 5) { // IT ALL DEPENDS ON WHETHER I LIKE THEM OR NOT
        leaderlike(-7);
        genuine(4);
        loyal(-3);
        spiritual(-3);
        independent(3);
        friendly(-5);
        romantic(-2);
        optimistic(-3);
        adventurous(-1);
        freethinking(-2);
        happy(-2);
        compassionate(-6);
        trustworthy(-2);
        jealous(2);
        selfish(7);
        properclassy(-4);
        anxious(1);
        lazy(3);
        easytoanger(3);
    }

    // QUESTION 09: HOW EASY IS IT FOR YOU TO MAINTAIN YOUR SAME PERSONALITY, REGARDNESS OF WHO YOU ARE AROUND?
    // ----------
    if (response.q09 == 0) { // EXTREMELY EASY. WHETHER I'M WITH FRIENDS, MY FAMILY, OR STRANGERS, I'M ALWAYS THE SAME PERSON.
        silly(1);
        leaderlike(8);
        genuine(15);
        loyal(5);
        confident(7);
        spiritual(1);
        independent(7);
        optimistic(3);
        freethinking(10);
        intelligent(3);
        happy(2);
        compassionate(3);
        trustworthy(10);
        clumsy(-2);
        jealous(-4);
        selfish(-3);
        persuasive(3);
        properclassy(3);
        anxious(-5);
        lazy(-2);
        easytoanger(-3);
        crazy(-2);
    } else if (response.q09 == 1) { // MODERATELY EASY. SOMETIMES I MODIFY IF I KNOW A GROUP HAS CERTAIN PREFERENCES, BUT MOSTLY I STAY THE SAME.
        leaderlike(4);
        genuine(5);
        loyal(2);
        confident(2);
        independent(3);
        optimistic(1);
        freethinking(5);
        intelligent(2);
        happy(1);
        compassionate(1);
        trustworthy(6);
        clumsy(-1);
        jealous(-2);
        selfish(-1);
        persuasive(2);
        properclassy(1);
        anxious(-2);
        lazy(-1);
        easytoanger(-1);
        crazy(-1);
    } else if (response.q09 == 2) { // A LITTLE DIFFICULT. DIFFERENT GROUPS NATURALLY BRING OUT FAIRLY DIFFERENT ASPECTS OF MY PERSONALITY.
        leaderlike(-3);
        genuine(-4);
        loyal(-3);
        confident(-5);
        spiritual(-2);
        independent(-3);
        optimistic(-2);
        adventurous(-1);
        intelligent(-1);
        compassionate(-1);
        trustworthy(-2);
        clumsy(2);
        jealous(2);
        selfish(2);
        persuasive(-1);
        properclassy(-2);
        anxious(4);
        lazy(1);
        easytoanger(1);
        crazy(2);
    } else if (response.q09 == 3) {
        leaderlike(-6);
        genuine(-10);
        loyal(-4);
        confident(-7);
        spiritual(-4);
        independent(-7);
        romantic(-3);
        funny(-1);
        optimistic(-5);
        adventurous(-2);
        reckless(3);
        freethinking(-10);
        intelligent(-3);
        happy(-4);
        compassionate(-2);
        trustworthy(-5);
        clumsy(3);
        jealous(5);
        selfish(4);
        persuasive(-2);
        properclassy(-5);
        anxious(7);
        lazy(2);
        easytoanger(3);
        crazy(1);
    }

    // QUESTION 10: HOW SUCCESSFUL ARE YOU WHEN IT COMES TO SELLING AND/OR PERSUADING PEOPLE TO BUY SOMETHING?
    // ----------
    if (response.q10 == 0) { // I'M A VERY CONFIDENT THAT I COULD SELL ANYBODY ANYTHING WITHOUT A PROBLEM!
        leaderlike(3);
        genuine(-2);
        confident(10);
        independent(2);
        friendly(5);
        optimistic(6);
        adventurous(1);
        reckless(2);
        freethinking(1);
        intelligent(1);
        compassionate(-2);
        trustworthy(-4);
        jealous(2);
        selfish(4);
        persuasive(10);
        anxious(-5);
        lazy(-2);
        crazy(-3);
    } else if (response.q10 == 1) { // MOST OF THE TIME, I THINK I COULD BE PRETTY SUCCESSFUL AT SELLING MOST THINGS.
        leaderlike(3);
        genuine(-1);
        confident(4);
        independent(1);
        friendly(3);
        optimistic(3);
        reckless(1);
        intelligent(1);
        compassionate(1);
        trustworthy(-2);
        jealous(1);
        selfish(2);
        persuasive(7);
        anxious(-1);
        lazy(-1);
        easytoanger(-1);
        crazy(-1);
    } else if (response.q10 == 2) { // IT REALLY DEPENDS ON WHETHER OR NOT I BELIEVE IN THE PRODUCT.
        leaderlike(3);
        genuine(6);
        loyal(1);
        confident(3);
        spiritual(3);
        independent(1);
        optimistic(1);
        curious(1);
        reckless(-1);
        freethinking(1);
        intelligent(3);
        compassionate(-1);
        trustworthy(4);
        jealous(-2);
        selfish(-2);
        persuasive(5);
        properclassy(3);
        lazy(-1);
        easytoanger(-2);
        crazy(-2);
    } else if (response.q10 == 3) { // I AM PRETTY UNCOMFORTABLE SELLING, BUT I SEEM TO DO ALL RIGHT AT IT.
        leaderlike(2);
        genuine(3);
        confident(2);
        independent(1);
        optimistic(1);
        curious(1);
        adventurous(-1);
        freethinking(1);
        persuasive(3);
        anxious(2);
        lazy(-1);
    } else if (response.q10 == 4) { // I DO NOT LIKE SELLING AND AM NOT SUCCESSFUL AT IT.
        leaderlike(-2);
        genuine(2);
        forgetful(1);
        confident(-5);
        independent(-2);
        optimistic(-5);
        adventurous(-1);
        reckless(-1);
        freethinking(-1);
        happy(-1);
        clumsy(3);
        persuasive(-10);
        anxious(4);
        lazy(1);
        easytoanger(2);
        crazy(3);
    }

    // QUESTION 11: WHAT WOULD YOU MOST PREFER TO WEAR ON A DAILY BASIS, DISCOUNTING ANY LEVEL OF WHAT IS REALISTIC FOR YOUR TYPICAL SCHEDULE?
    // ----------
    if (response.q11[0] == true) { // PAJAMAS
        silly(5);
        genuine(3);
        confident(1);
        independent(1);
        optimistic(-2);
        adventurous(-3);
        reckless(-3);
        freethinking(3);
        intelligent(-1);
        happy(1);
        clumsy(2);
        persuasive(-3);
        properclassy(-10);
        lazy(5);
        crazy(2);
    }
    if (response.q11[1] == true) { // BASKETBALL SHORTS AND AN OVERSIZED T-SHIRT
        athletic(7);
        genuine(2);
        confident(1);
        independent(1);
        adventurous(1);
        freethinking(1);
        intelligent(-1);
        clumsy(-2);
        persuasive(-2);
        properclassy(-7);
        lazy(3);
        easytoanger(2);
    }
    if (response.q11[2] == true) { // BLACK-TIE
        leaderlike(3);
        genuine(2);
        loyal(2);
        confident(4);
        independent(2);
        romantic(5);
        reckless(-2);
        intelligent(4);
        persuasive(3);
        properclassy(10);
        lazy(-5);
    }
    if (response.q11[3] == true) { // JEANS AND A BUTTON-UP
        genuine(1);
        independent(-1);
        adventurous(1);
        freethinking(-2);
        happy(1);
        persuasive(1);
        properclassy(-3);
        crazy(-3);
    }
    if (response.q11[4] == true) { // A SWIMSUIT
        athletic(5);
        silly(2);
        genuine(2);
        confident(4);
        independent(2);
        adventurous(4);
        freethinking(1);
        happy(2);
        jealous(1);
        persuasive(6);
        properclassy(-7);
        lazy(1);
        easytoanger(1);
        crazy(2);
    }
    if (response.q11[5] == true) { // A SUNDRESS AND SANDALS AND/OR KHAKIS AND A BLAZER
        leaderlike(2);
        confident(2);
        independent(1);
        friendly(1);
        romantic(1);
        adventurous(2);
        jealous(1);
        persuasive(2);
        properclassy(4);
        crazy(-2);
    }
    if (response.q11[6] == true) { // CUT OFFS AND A GRAPHIC TEE
        silly(1);
        genuine(1);
        confident(1);
        independent(1);
        friendly(1);
        freethinking(2);
        persuasive(-1);
        properclassy(-3);
        lazy(2);
    }

    // QUESTION 12: HOW DO YOU TEND TO NATURALLY FEEL ABOUT THE UNKNOWN FUTURE?
    // ----------
    if (response.q12 == 0) { // EXCITED! I LOVE KNOWING THAT ANYTHING COULD HAPPEN. IT MAKES LIFE EXCITING!
        leaderlike(3);
        confident(5);
        spiritual(3);
        independent(1);
        optimistic(10);
        curious(5);
        adventurous(3);
        freethinking(1);
        happy(5);
        anxious(-10);
        easytoanger(-3);
    } else if (response.q12 == 1) {
        silly(-2);
        leaderlike(4);
        forgetful(-3);
        confident(3);
        spiritual(2);
        optimistic(5);
        curious(3);
        adventurous(2);
        happy(3);
        trustworthy(3);
        clumsy(-1);
        selfish(-2);
        persuasive(2);
        anxious(6);
        lazy(-2);
        easytoanger(-1);
    } else if (response.q12 == 2) {
        silly(3);
        leaderlike(3);
        genuine(2);
        forgetful(5);
        confident(2);
        spiritual(5);
        independent(2);
        optimistic(4);
        curious(-3);
        adventurous(4);
        freethinking(3);
        intelligent(1);
        happy(5);
        jealous(-3);
        selfish(1);
        persuasive(1);
        anxious(-5);
        lazy(2);
        easytoanger(-2);
        crazy(3);
    } else if (response.q12 == 3) { // I DO THINK ABOUT THE FUTURE, BUT I FEEL MORE SECURE WHEN I FOCUS ON THE PRESENT.
        genuine(2);
        confident(1);
        spiritual(3);
        optimistic(-5);
        reckless(-2);
        freethinking(-1);
        persuasive(-1);
        anxious(4);
        lazy(1);
    } else if (response.q12 == 4) { // SCARED. I OFTEN WORRY THAT THE FUTURE IS WORSE THAN THE PRESENT, OR THAT MY LIFE WILL BE UNHAPPY.
        leaderlike(-3);
        genuine(1);
        loyal(-1);
        forgetful(1);
        confident(-10);
        spiritual(-3);
        independent(-3);
        optimistic(-10);
        adventurous(-4);
        reckless(1);
        freethinking(2);
        happy(-4);
        jealous(1);
        persuasive(-3);
        properclassy(-1);
        anxious(10);
        lazy(2);
        easytoanger(1);
        crazy(1);
    }

    // QUESTION 13: HOW DO YOU TEND TO IMMEDIATELY FEEL IF SOMEONE CUTS YOU OFF IN TRAFFIC?
    // ----------
    if (response.q13 == 0) { // ANGRY! WHO DO THEY THINK THEY ARE? I MAKE SURE THEY SEE HOW UPSET I AM.
        silly(-1);
        leaderlike(-6);
        confident(3);
        friendly(-2);
        optimistic(-2);
        reckless(4);
        happy(-2);
        compassionate(-4);
        jealous(2);
        selfish(5);
        properclassy(-7);
        anxious(3);
        easytoanger(10);
        crazy(4);
    } else if (response.q13 == 1) { // HURT. DON'T THEY KNOW HOW INCONSIDERATE THAT WAS? I REMIND MYSELF NOT TO DO THAT TO ANYONE IN THE FUTURE.
        leaderlike(2);
        genuine(3);
        loyal(3);
        spiritual(2);
        friendly(3);
        optimistic(4);
        reckless(-3);
        freethinking(1);
        compassionate(3);
        selfish(-5);
        properclassy(2);
        anxious(3);
        easytoanger(-5);
    } else if (response.q13 == 2) { // UNDERSTANDING. SURELY, THEY'RE IN AN EMERGENCY. I GIVE THEM THE BENEFIT OF THE DOUBT AND SLOW DOWN SO THEY HAVE PLENTY OF SPACE AND ROOM. I'M JUST GLAD THERE WASN'T AN ACCIDENT.
        leaderlike(3);
        genuine(2);
        loyal(5);
        spiritual(3);
        friendly(4);
        optimistic(5);
        reckless(-2);
        freethinking(1);
        happy(2);
        compassionate(8);
        trustworthy(2);
        jealous(-4);
        selfish(-7);
        properclassy(3);
        anxious(-2);
        easytoanger(-8);
    } else if (response.q13 == 3) { // I'M USUALLY THE ONE THAT CUTS SOMEONE ELSE OFF!
        leaderlike(-6);
        genuine(-3);
        forgetful(2);
        confident(4);
        spiritual(-1);
        independent(2);
        friendly(-3);
        optimistic(-1);
        reckless(6);
        intelligent(-1);
        happy(-1);
        compassionate(-7);
        trustworthy(-2);
        jealous(3);
        selfish(7);
        properclassy(-9);
        anxious(4);
        easytoanger(13);
        crazy(5);
    }

    // QUESTION 14: ON A SCALE FROM 1-5, WITH 1 BEING VERY EASILY AND 5 BEING NOT AT ALL, HOW EASILY EMBARRASSED ARE YOU?
    // ----------
    if (response.q14 == 0) { // VERY EASILY (1)
        silly(-7);
        leaderlike(-5);
        confident(-10);
        independent(-5);
        funny(-3);
        curious(2);
        adventurous(-5);
        freethinking(-10);
        happy(-2);
        selfish(4);
        anxious(7);
        easytoanger(2);
        crazy(3);
    } else if (response.q14 == 1) { // EASILY (2)
        silly(-5);
        leaderlike(-3);
        confident(-5);
        independent(-3);
        funny(-1);
        curious(1);
        adventurous(-3);
        freethinking(-5);
        happy(-1);
        selfish(2);
        anxious(5);
        easytoanger(1);
        crazy(2);
    } else if (response.q14 == 2) { // NEUTRAL (3)
        freethinking(2);
    } else if (response.q14 == 3) { // NOT EASILY (4)
        silly(3);
        leaderlike(4);
        genuine(3);
        confident(5);
        independent(3);
        funny(1);
        curious(-2);
        adventurous(3);
        reckless(3);
        freethinking(5);
        happy(3);
        anxious(-3);
        easytoanger(-1);
        crazy(-2);
    } else if (response.q14 == 4) { // NOT AT ALL (5)
        silly(5);
        leaderlike(5);
        genuine(5);
        confident(10);
        independent(6);
        funny(3);
        optimistic(1);
        curious(-3);
        adventurous(5);
        reckless(5);
        freethinking(10);
        happy(6);
        jealous(-2);
        anxious(-5);
        easytoanger(-2);
        crazy(-3);
    }
    
    // QUESTION 15: WHEN FACED WITH A DIFFICULT DECISION, YOU USUALLY:
    // ----------
    if (response.q15 == 0) { // MAKE A PROS AND CONS LIST, WEIGHING OUT EACH OPTION AND TAKING PLENTY OF TIME TO LOGICALLY MAKE YOUR DECISION.
        leaderlike(10);
        forgetful(-6);
        confident(5);
        independent(5);
        optimistic(5);
        reckless(-7);
        freethinking(-3);
        intelligent(10);
        trustworthy(4);
        clumsy(-3);
        selfish(-2);
        properclassy(2);
        anxious(-3);
        lazy(-5);
        easytoanger(-2);
        crazy(-7);
    } else if (response.q15 == 1) { // PICK WHICH OPTION FEELS THE MOST RIGHT, EVEN IF IT DOESN'T LOGICALLY MAKE THE MOST SENSE.
        leaderlike(5);
        genuine(2);
        confident(5);
        spiritual(5);
        independent(6);
        optimistic(5);
        reckless(3);
        freethinking(5);
        trustworthy(4);
        properclassy(2);
        anxious(-2);
        lazy(-4);
        crazy(1);
    } else if (response.q15 == 2) { // MAKE A DECISION SPORADICALLY OR EVEN RANDOMLY, THINKING IT LIKELY WON'T MAKE THAT MUCH OF A DIFFERENCE IN THE END.
        leaderlike(-4);
        forgetful(2);
        confident(3);
        spiritual(-5);
        optimistic(5);
        reckless(9);
        freethinking(3);
        intelligent(-5);
        trustworthy(-3);
        clumsy(2);
        selfish(3);
        properclassy(-2);
        anxious(3);
        lazy(3);
        easytoanger(2);
        crazy(5);
    } else if (response.q15 == 3) { // CONSULT SOMEONE YOU TRUST, SECRETLY HOPING THEY'LL MAKE THE DECISION FOR YOU.
        leaderlike(-5);
        genuine(2);
        loyal(5);
        confident(-7);
        independent(-7);
        friendly(3);
        optimistic(-5);
        adventurous(-3);
        reckless(5);
        freethinking(-10);
        intelligent(-3);
        trustworthy(-3);
        clumsy(2);
        jealous(3);
        selfish(5);
        persuasive(-5);
        properclassy(-4);
        anxious(6);
        lazy(8);
        easytoanger(1);
        crazy(3);
    } else if (response.q15 == 4) { // AVOID MAKING THE DECISION UNTIL THE LAST POSSIBLE SECOND, THEN GO WITH MY GUT.
        leaderlike(-7);
        forgetful(8);
        confident(5);
        spiritual(2);
        independent(-6);
        optimistic(-5);
        adventurous(1);
        reckless(7);
        freethinking(5);
        intelligent(-5);
        trustworthy(-5);
        clumsy(3);
        jealous(1);
        selfish(6);
        persuasive(-3);
        properclassy(-6);
        anxious(7);
        lazy(9);
        easytoanger(2);
        crazy(5);
    }

    // QUESTION 16: WHICH OF THE FOLLOWING SOUNDS LIKE AN IDEAL WAY TO SPEND FREE TIME?
    // ----------
    if (response.q16[0] == true) { // DEVELOPING A HOBBY
        leaderlike(2);
        genuine(3);
        confident(3);
        curious(7);
        adventurous(2);
        freethinking(2);
        intelligent(5);
        properclassy(1);
        lazy(-7);
    }
    if (response.q16[1] == true) { // SPENDING QUALITY TIME WITH FRIENDS OR A SIGNIFICANT OTHER
        leaderlike(2);
        genuine(3);
        loyal(5);
        spiritual(3);
        independent(-4);
        friendly(8);
        romantic(6);
        freethinking(-2);
        happy(4);
        compassionate(6);
        trustworthy(4);
        jealous(2);
        selfish(-2);
        properclassy(1);
        lazy(-5);
        easytoanger(-2);
    }
    if (response.q16[2] == true) { // SURFING THE INTERNET OR WATCHING TV
        athletic(-4);
        leaderlike(-2);
        genuine(1);
        forgetful(1);
        spiritual(-1);
        independent(2);
        friendly(-1);
        adventurous(-1);
        reckless(-4);
        freethinking(-1);
        intelligent(-1);
        jealous(1);
        selfish(1);
        properclassy(-1);
        anxious(1);
        lazy(5);
        easytoanger(1);
    }
    if (response.q16[3] == true) { // GETTING ACTIVE OUTSIDE
        athletic(8);
        leaderlike(2);
        genuine(1);
        confident(2);
        spiritual(1);
        independent(2);
        curious(2);
        adventurous(4);
        happy(1);
        clumsy(-2);
        anxious(-2);
        lazy(-10);
    }
    if (response.q16[4] == true) { // LEARNING ABOUT SOMETHING THAT INTERESTS YOU
        leaderlike(2);
        genuine(1);
        spiritual(2);
        independent(1);
        optimistic(1);
        curious(8);
        freethinking(2);
        intelligent(5);
        lazy(-5);
    }
    if (response.q16[5] == true) { // SERVING SOMEONE ELSE
        leaderlike(5);
        genuine(1);
        loyal(3);
        spiritual(6);
        friendly(6);
        romantic(3);
        optimistic(4);
        freethinking(1);
        happy(5);
        compassionate(8);
        trustworthy(5);
        jealous(-6);
        selfish(-6);
        properclassy(4);
        anxious(-3);
        lazy(-5);
        easytoanger(-5);
        crazy(-4);
    }
    if (response.q16[6] == true) { // BUILDING SOCIAL MEDIA PRESENCE
        leaderlike(-2);
        genuine(-5);
        confident(-3);
        spiritual(-2);
        independent(-6);
        friendly(2);
        adventurous(-3);
        freethinking(-3);
        intelligent(-1);
        trustworthy(-1);
        jealous(7);
        selfish(8);
        persuasive(2);
        properclassy(-3);
        anxious(5);
        lazy(4);
        easytoanger(3);
        crazy(6);
    }
    if (response.q16[7] == true) { // PLAYING A SPORT
        athletic(10);
        leaderlike(3);
        genuine(1);
        confident(3);
        independent(1);
        adventurous(2);
        reckless(2);
        clumsy(-6);
        lazy(-10);
        easytoanger(2);
    }
    if (response.q16[8] == true) { // ATTENDING A SOCIAL EVENT
        leaderlike(4);
        genuine(1);
        confident(5);
        independent(-2);
        friendly(5);
        optimistic(2);
        curious(1);
        freethinking(-1);
        jealous(1);
        lazy(-2);
    }

    // QUESTION 17: YOUR IDEAL VACATION WOULD BE:
    // ----------
    if (response.q17 == 0) { // MEXICO FOR HIKING, ZIP-LINING, AND OTHER ADVENTURING
        athletic(10);
        confident(5);
        curious(4);
        adventurous(10);
        reckless(3);
        freethinking(2);
        properclassy(-1);
        anxious(-4);
        lazy(-5);
        crazy(4);
    } else if (response.q17 == 1) { // ITALY WITH YOUR SIGNIFICANT OTHER TO EAT DELICIOUS FOOD, RIDE ON A GONDOLA, AND EXPERIENCE ART
        loyal(5);
        spiritual(4);
        independent(-2);
        friendly(3);
        romantic(8);
        curious(2);
        adventurous(3);
        intelligent(2);
        properclassy(3);
        lazy(-3);
    } else if (response.q17 == 2) { // NEW YORK CITY FOR SHOPPING, NIGHT LIFE, AND TO EXPERIENCE THE BIG CITY
        curious(1);
        adventurous(1);
        freethinking(-1);
        jealous(2);
        selfish(2);
        properclassy(1);
        lazy(-1);
        crazy(1);
    } else if (response.q17 == 3) { // AN AMUSEMENT PARK TO EAT CARNIVAL FOOD, TRY DIFFERENT RIDES, AND LAUGH WITH YOUR FRIENDS
        silly(5);
        loyal(3);
        independent(-1);
        friendly(3);
        funny(2);
        optimistic(1);
        curious(1);
        adventurous(3);
        freethinking(1);
        happy(1);
        crazy(1);
    } else if (response.q17 == 4) { // I'D LOVE A VACATION, BUT NONE OF THE ABOVE OPTIONS APPEAL TO ME
        adventurous(-3);
        freethinking(3);
        easytoanger(2);
    }

    // QUESTION 18: WHICH CAREER TYPE SOUNDS MOST APPEALING TO YOU?
    // ----------
    if (response.q18 == 0) { // PERSONAL TRAINER, PHYSICAL THERAPIST, OR PROFESSIONAL ATHLETE
        athletic(10);
        leaderlike(4);
        confident(3);
        adventurous(2);
        reckless(2);
        clumsy(-7);
        properclassy(-1);
        anxious(-4);
        lazy(-7);
        easytoanger(4);
        crazy(-2);
    } else if (response.q18 == 1) { // VISUAL ARTIST, SINGER, OR WRITER
        silly(5);
        leaderlike(2);
        genuine(2);
        forgetful(-1);
        confident(2);
        spiritual(3);
        romantic(5);
        funny(2);
        curious(4);
        freethinking(7);
        compassionate(2);
        jealous(3);
        anxious(4);
        crazy(3);
    } else if (response.q18 == 2) { // TEACHER, PUBLIC RELATIONS REPRESENTATIVE, NURSE
        leaderlike(8);
        confident(6);
        friendly(8);
        optimistic(6);
        curious(4);
        reckless(-3);
        freethinking(1);
        intelligent(4);
        compassionate(7);
        trustworthy(4);
        jealous(-2);
        selfish(-6);
        lazy(-4);
        easytoanger(-2);
    } else if (response.q18 == 3) { // BUSINESS ANALYST, FINANCIAL ADVISOR, OR ACCOUNTANT
        leaderlike(2);
        forgetful(-6);
        independent(3);
        funny(-2);
        freethinking(-1);
        intelligent(6);
        trustworthy(4);
        persuasive(8);
        lazy(-5);
    } else if (response.q18 == 4) { // ENGINEER, CHEMIST, MEDICAL SCIENTIST
        leaderlike(5);
        forgetful(-6);
        intelligent(8);
        trustworthy(8);
        anxious(-3);
        lazy(-5);
    } else if (response.q18 == 5) { // TECHNICIAN, COMPUTER PROGRAMMER, CONTRACTOR
        athletic(-5);
        leaderlike(2);
        forgetful(-3);
        independent(5);
        curious(2);
        freethinking(2);
        intelligent(5);
        properclassy(-1);
        anxious(5);
        lazy(6);
    } else if (response.q18 == 6) { // AGRICULTURAL WORKER, BOTANIST, ENVIRONMENTAL SCIENCE
        athletic(7);
        leaderlike(3);
        spiritual(2);
        independent(3);
        optimistic(1);
        curious(-3);
        intelligent(3);
        clumsy(-3);
        properclassy(-3);
        lazy(-6);
    }

    // QUESTION 19: HOW LIKELY ARE YOU TO FORGET IMPORTANT DATES LIKE ANNIVERSARIES OR BIRTHDAYS?
    // ----------
    if (response.q19 == 0) { // I NEVER FORGET!
        leaderlike(5);
        loyal(8);
        forgetful(-10);
        confident(6);
        spiritual(4);
        friendly(6);
        romantic(5);
        optimistic(5);
        reckless(-4);
        freethinking(2);
        intelligent(5);
        compassionate(7);
        trustworthy(5);
        clumsy(-1);
        jealous(-3);
        selfish(-4);
        properclassy(2);
        anxious(-2);
        lazy(-5);
    } else if (response.q19 == 1) { // I FORGET SOMETIMES. I'M ONLY HUMAN.
        genuine(2);
        loyal(-1);
        forgetful(4);
        confident(1);
        spiritual(2);
        friendly(2);
        optimistic(1);
        reckless(1);
        intelligent(3);
        compassionate(2);
        trustworthy(4);
        selfish(-1);
        lazy(-2);
    } else if (response.q19 == 2) { // I FORGET OFTEN.
        leaderlike(-5);
        genuine(4);
        loyal(-5);
        forgetful(10);
        confident(-4);
        spiritual(-1);
        friendly(-3);
        romantic(-5);
        reckless(3)
        freethinking(3);
        intelligent(-5);
        compassionate(-2);
        trustworthy(-4);
        clumsy(2);
        jealous(1);
        selfish(4);
        properclassy(-3);
        anxious(2);
        lazy(5);
    }

    // QUESTION 20: WHICH OF THE FOLLOWING DO YOU REGULARLY FIND YOURSELF DOING?
    // ----------
    if (response.q20[0] == true) { // DANCE IN PUBLIC WHEN I THINK NO ONE IS WATCHING
        athletic(3);
        silly(7);
        genuine(4);
        confident(4);
        independent(4);
        funny(3);
        optimistic(3)
        adventurous(4);
        freethinking(4);
        happy(3);
        properclassy(-1);
        crazy(4);
    }
    if (response.q20[1] == true) { // DANCE IN PUBLIC WHEN I KNOW OTHERS ARE WATCHING
        athletic(3);
        silly(10);
        genuine(7);
        confident(6);
        independent(6);
        funny(5);
        optimistic(4);
        adventurous(3);
        freethinking(8);
        happy(5);
        selfish(3);
        properclassy(-2);
        anxious(-3);
        lazy(-1);
        crazy(10);
    }
    if (response.q20[2] == true) { // INITIATING CONVERSATIONS WITH STRANGERS THROUGHOUT MY DAY
        leaderlike(8);
        genuine(7);
        confident(7);
        independent(7);
        friendly(10);
        optimistic(6);
        curious(2);
        adventurous(3);
        freethinking(4);
        happy(7);
        compassionate(8);
        jealous(-5);
        selfish(-7);
        properclassy(3);
        anxious(-5);
        easytoanger(-3);
        crazy(1);
    }
    if (response.q20[3] == true) { // TALK IN RANDOM ACCENTS TO OTHER PEOPLE
        silly(7);
        genuine(2);
        confident(3);
        friendly(4);
        funny(5);
        adventurous(2);
        freethinking(4);
        happy(5);
        clumsy(1);
        crazy(4);
    }
    if (response.q20[4] == true) { // TALK TO MYSELF OUT LOUD
        silly(3);
        independent(2);
        freethinking(3);
        properclassy(-2);
        anxious(4);
        crazy(3);
    }
    if (response.q20[5] == true) { // MOVE CREATIVELY IN PUBLIC BY SKIPPING, JUMPING, ETC.
        athletic(6);
        silly(5);
        confident(6);
        independent(3);
        friendly(4);
        funny(4);
        optimistic(1);
        adventurous(3);
        reckless(1);
        freethinking(5);
        happy(5);
        properclassy(-3);
        crazy(4);
    }
    if (response.q20[6] == true) { // "STALK" SOMEONE ON SOCIAL MEDIA I DO NOT KNOW
        silly(2);
        genuine(-1);
        curious(6);
        jealous(4);
        selfish(2);
        properclassy(-2);
        anxious(3);
        crazy(2);
    }
    if (response.q20[7] == true) { // FIND MYSELF NEEDING TO CONSTANTLY MOVE, EVEN IF IT'S JUST FIDGETING
        athletic(2);
        forgetful(2);
        reckless(2);
        freethinking(1);
        properclassy(-4);
        anxious(4);
        lazy(-2);
        crazy(2);
    }
    if (response.q20[8] == true) { // GETTING EASILY DISTRACTED WHEN I'M SUPPOSED TO BE CONCENTRATING ON SOMETHING
        silly(3);
        leaderlike(-2);
        forgetful(8);
        independent(-1);
        friendly(1);
        curious(8);
        reckless(3);
        freethinking(4);
        intelligent(-3);
        anxious(2);
        lazy(3);
        crazy(2);
    }
    if (response.q20[9] == true) { // BEHAVING IN A WAY THAT PROMPTS OTHERS TO CALL ME "HYPER"
        silly(6);
        forgetful(5);
        friendly(2);
        funny(4);
        reckless(5);
        freethinking(4);
        happy(2);
        clumsy(1);
        properclassy(-4);
        anxious(2);
        lazy(3);
        crazy(10);
    }

    // QUESTION 21: ARE PEOPLE INHERINTLY GOOD OR INHERENTLY BAD?
    // ----------
    if (response.q21 == 0) { // GOOD
        genuine(3);
        loyal(5);
        confident(3);
        spiritual(4);
        friendly(5);
        romantic(2);
        funny(2);
        optimistic(8);
        happy(10);
        compassionate(10);
        trustworthy(5);
        jealous(-6);
        selfish(-10);
        properclassy(4);
        anxious(-2);
        easytoanger(-10);
    } else if (response.q21 == 1) { // BAD
        loyal(-6);
        confident(-2);
        spiritual(-10);
        independent(2);
        friendly(-10);
        romantic(-6);
        funny(-5);
        optimistic(-6);
        happy(-15);
        compassionate(-10);
        trustworthy(-5);
        jealous(5);
        selfish(10);
        properclassy(-3);
        anxious(3);
        easytoanger(10);
        crazy(3);
    }

    // QUESTION 22: ON A SCALE OF 1-5, WITH 1 BEING VERY EASILY AND 5 BEING NOT AT ALL, HOW WELL DO YOU KEEP CALM IN STRESSFUL SITUATIONS?
    // ----------
    if (response.q22 == 0) { // VERY EASILY (1)
        silly(-4);
        leaderlike(10);
        loyal(6);
        forgetful(-10);
        confident(10);
        independent(10);
        reckless(-8);
        intelligent(6);
        trustworthy(6);
        clumsy(-8);
        persuasive(4);
        properclassy(6);
        anxious(-10);
        easytoanger(-6);
        crazy(-4);
    } else if (response.q22 == 1) { // EASILY (2)
        silly(-2);
        leaderlike(5);
        loyal(3);
        forgetful(-5);
        confident(5);
        independent(5);
        reckless(-4);
        intelligent(3);
        trustworthy(3);
        clumsy(-4);
        persuasive(2);
        properclassy(3);
        anxious(-5);
        easytoanger(-3);
        crazy(-2);
    } else if (response.q22 == 2) { // NUETRAL (3)
        leaderlike(1);
        loyal(1);
        forgetful(-1);
        confident(-1);
        intelligent(-1);
        trustworthy(-1);
        clumsy(-1);
        persuasive(1);
        properclassy(-1);
        anxious(2);
        easytoanger(1);
    } else if (response.q22 == 3) { // NOT EASILY (4)
        silly(2);
        leaderlike(-5);
        loyal(-3);
        forgetful(5);
        confident(-5);
        independent(-5);
        reckless(4);
        intelligent(-3);
        trustworthy(-3);
        clumsy(4);
        persuasive(-2);
        properclassy(-3);
        anxious(5);
        easytoanger(3);
        crazy(3);
    } else if (response.q22 == 4) { // NOT AT ALL (5)
        silly(4);
        leaderlike(-10);
        loyal(-6);
        forgetful(10);
        confident(10);
        independent(-10);
        reckless(8);
        intelligent(-6);
        trustworthy(-6);
        clumsy(8);
        persuasive(-4);
        properclassy(-6);
        anxious(10);
        easytoanger(6);
        crazy(6);
    }
}

function athletic(value) {
    tr[0] += value;
    tm[0]++;
}

function silly(value) {
    tr[1] += value;
    tm[1]++;
}

function leaderlike(value) {
    tr[2] += value;
    tm[2]++;
}

function genuine(value) {
    tr[3] += value;
    tm[3]++;
}

function loyal(value) {
    tr[4] += value;
    tm[4]++;
}

function forgetful(value) {
    tr[5] += value;
    tm[5]++;
}

function confident(value) {
    tr[6] += value;
    tm[6]++;
}

function spiritual(value) {
    tr[7] += value;
    tm[7]++;
}

function independent(value) {
    tr[8] += value;
    tm[8]++;
}

function friendly(value) {
    tr[9] += value;
    tm[9]++;
}

function romantic(value) {
    tr[10] += value;
    tm[10]++;
}

function funny(value) {
    tr[11] += value;
    tm[11]++;
}

function optimistic(value) {
    tr[12] += value;
    tm[12]++;
}

function curious(value) {
    tr[13] += value;
    tm[13]++;
}

function adventurous(value) {
    tr[14] += value;
    tm[14]++;
}

function reckless(value) {
    tr[15] += value;
    tm[15]++;
}

function freethinking(value) {
    tr[16] += value;
    tm[16]++;
}

function intelligent(value) {
    tr[17] += value;
    tm[17]++;
}

function happy(value) {
    tr[18] += value;
    tm[18]++;
}

function compassionate(value) {
    tr[19] += value;
    tm[19]++;
}

function trustworthy(value) {
    tr[20] += value;
    tm[20]++;
}

function clumsy(value) {
    tr[21] += value;
    tm[21]++;
}

function jealous(value) {
    tr[22] += value;
    tm[22]++;
}

function selfish(value) {
    tr[23] += value;
    tm[23]++;
}

function persuasive(value) {
    tr[24] += value;
    tm[24]++;
}

function properclassy(value) {
    tr[25] += value;
    tm[25]++;
}

function anxious(value) {
    tr[26] += value;
    tm[26]++;
}

function lazy(value) {
    tr[27] += value;
    tm[27]++;
}

function easytoanger(value) {
    tr[28] += value;
    tm[28]++;
}

function crazy(value) {
    tr[29] += value;
    tm[29]++;
}