const https = require('https');

const token = "EAALDr5Qg32UBRpjFzEhQP3M5qgZCZAYIxYWurlPiPZALGTJgj67WSqK49jCpr9z555WlrgVFQp5i41bQWnDUlVcKd5qj5fT6ccYIXZCFaZBCzaVwdQNmBTev4uyO2hj5iBYoy2SopGrsE33ypoaL47MYHmntwD7QiQl7pm8sRvbT5CfRMKWepTmQ7Si9lnCbdsIZBvuqZCTsU49kxZA1QL1MlClZAOYi9HjWoLl9YgMjZB";

https.get(`https://graph.facebook.com/v19.0/1026436790562506?fields=instagram_business_account,connected_instagram_account,name&access_token=${token}`, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Page details:", data);
  });
}).on('error', (err) => {
  console.error("Error: " + err.message);
});
