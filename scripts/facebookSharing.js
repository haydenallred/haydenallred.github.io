function postToFeed() {
    // calling the API ...
    var obj = {
      method: 'feed',
      link: 'https://www.haydenallred.github.io/results.html',
      description: "description goes here",
      picture: 'https://www.azeezkallayi.com/demo/test/womens-day.jpg',
      name: 'International womens day'       
    };
     FB.ui(obj);
   }