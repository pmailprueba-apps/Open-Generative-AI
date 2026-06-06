const https = require('https');

const token = "EAALDr5Qg32UBRpjFzEhQP3M5qgZCZAYIxYWurlPiPZALGTJgj67WSqK49jCpr9z555WlrgVFQp5i41bQWnDUlVcKd5qj5fT6ccYIXZCFaZBCzaVwdQNmBTev4uyO2hj5iBYoy2SopGrsE33ypoaL47MYHmntwD7QiQl7pm8sRvbT5CfRMKWepTmQ7Si9lnCbdsIZBvuqZCTsU49kxZA1QL1MlClZAOYi9HjWoLl9YgMjZB";

const urls = [
  `https://graph.facebook.com/v19.0/1026436790562506?fields=instagram_business_account,connected_instagram_account,instagram_accounts,name&access_token=${token}`,
  `https://graph.facebook.com/v19.0/me/accounts?fields=name,instagram_business_account,connected_instagram_account,id&access_token=${token}`
];

function fetch(url, callback) {
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      callback(null, data);
    });
  }).on('error', (err) => {
    callback(err);
  });
}

function runNext(index) {
  if (index >= urls.length) return;
  const url = urls[index];
  console.log(`\nFetching: ${url.split('?')[0]}`);
  fetch(url, (err, data) => {
    if (err) {
      console.error("Error:", err);
    } else {
      console.log("Response:", data);
    }
    runNext(index + 1);
  });
}

runNext(0);
