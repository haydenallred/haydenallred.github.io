function postToFeed() {
    // calling the API ...
    var obj = {
      method: 'feed',
      href: 'https://www.haydenallred.github.io/results.html',
      description: "description goes here",
      picture: 'https://www.azeezkallayi.com/demo/test/womens-day.jpg',
      name: 'International womens day'  ,
      quote: "I got Peter Pan. Here is why... blah blah blah."     
    };
     FB.ui(obj);
   }