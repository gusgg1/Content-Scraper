// Dependencies
const fs = require('fs');
const scrapeIt = require("scrape-it");
const json2csv = require("json2csv");

const dir = './data';
const entryPoint = "http://shirts4mike.com/shirts.php";
let shirtsDetails = [];


if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}

function scrapeData(url, config) {
  return scrapeIt(url, config)
    // .then(res => console.log(res)) shows status HTTP etc
    .then(checkStatus)
    .then(res => res.json())    
    .catch(error => console.log("Looks like there was a problem! " + error))
}

const configURL = {
  teeShirts: {
    listItem: ".products li",
    data: {
      url: {
        selector: "a",
        attr: "href"
      }
    }
  }
};

const configInfoShirts = {
  shirt: {
    selector: ".wrapper",
    data: {
      title: {
        selector: ".shirt-picture img",
        attr: "alt"
      },
      price: ".shirt-details .price",
      imageUrl: {
        selector: ".shirt-picture img",
        attr: "src"
      }
    } 
  }
}


scrapeIt("http://shirts4mike.com/shirts.php", configURL)
  .then(({ data, response }) => {
    console.log(`Status Code: ${response.statusCode}`)
    const urls = data.teeShirts;
    const fullUrls = urls.map(url => `http://shirts4mike.com/${url.url}`);


    fullUrls.forEach(url => {
      scrapeIt(url, configInfoShirts, (err, { data }) => {
        console.log(data.shirt);
        
        shirtsDetails.push(data.shirt.title);
        console.log(shirtsDetails);
      })
    })
  })



  /*
  .then(({ data, response }) => {
    // console.log(`Status Code: ${response.statusCode}`);
    // console.log(data.shirt);
    shirtsDetails.push(data.shirt);
    console.log(shirtsDetails);
  })
  */


// ------------------------------------------
//  HELPER FUNCTIONS
// ------------------------------------------

function checkStatus(response) {
  if (response.statusCode === 200) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}

function getShirtFullURL(data) {
  let shirtFullURL = [];
  data.forEach(url => {
    const urlShirt = `http://shirts4mike.com/${url.url}`;
    shirtFullURL.push(urlShirt);
  });
  return shirtFullURL;
}

function getShirtInfo(shirtsUrls) {
  let shirtsInfo = [];
  shirtsUrls.forEach(url => {
    scrapeIt(url, configInfoShirts)
      .then(({ data, response }) => {
        // console.log(`Status Code: ${response.statusCode}`);
        shirtsInfo.push(data);
      })
  });
  return shirtsInfo;
}












/*
fs.open('./data', 'wx', (err, fd) => {
  if (err) {
    if (err.code === 'EEXIST') {
      console.error('myfile already exists');
      return;
    }

    throw err;
  }

  writeMyData(fd);
});
*/








