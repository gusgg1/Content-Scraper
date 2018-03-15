// Dependencies
const fs = require('fs');
const scrapeIt = require("scrape-it");
const Json2csvParser = require('json2csv').Parser;

// Variables
const dir = './data';
const entryPoint = "http://shirts4mike.com/shirts.php";

// If no "data" folder create one
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}


// ------------------------------------------
//  Configurations for scrapeIt
// ------------------------------------------

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
  Title: {
      selector: '.shirt-picture img',
      attr: 'alt'
  },
  Price: {
      selector: '.price',
      how: 'html'
  },
  ImageURL: {
      selector: '.shirt-picture img',
      attr: 'src'
  }
};


// ------------------------------------------
//  Scraping from site and catching errors
// ------------------------------------------

scrapeIt("http://shirts4mike.com/shirts.php", configURL)
  .then(checkStatus)
  .then(getLinksShirts)
  .then(getShirtsInfo)
  .catch(function(error) {
    console.log("There’s been an error. Cannot connect to http://shirts4mike.com. " + error);
    logError(error);
  });


// ------------------------------------------
//  Helper functions
// ------------------------------------------

// gets the link for each shirt
function getLinksShirts({data, response}) {
  const urls = data.teeShirts;
  const shirtLinks = urls.map(url => `http://shirts4mike.com/${url.url}`);
  return shirtLinks;
}

// scrapes shirt info into array
function getShirtsInfo(links) {
  const shirtsInfo = [];      
  let datas = [];
  for (let link of links) { 
    scrapeIt(link, configInfoShirts)
      .then(checkStatus)
      .then(({ data, response }) => {
        data.Url = link;
        data.Time = new Date().toLocaleString();
        shirtsInfo.push(data);
        writeCSV(shirtsInfo);
      })
  } 
}

// creates CSV file uisng shirts info
function writeCSV(shirtsInfo) {
  const scrapeDate = new Date().toLocaleDateString();
  const filePath = `${dir}/${scrapeDate}.csv`;
  const fields = ["Title", "Price", "ImageURL", "Url", "Time"];
  const json2csvParser = new Json2csvParser({ fields });
  const csv = json2csvParser.parse(shirtsInfo);
  
  fs.writeFile(filePath, csv, function(error) {
    if (error) {
      console.log(error);
    } else {  
      console.log("Your file is saved");
    }
  });
}

// when catching an error it is logged in a file
function logError(error) {
  const message = `${new Date().toLocaleString()} -- A (${error}) error has occured, could not save CSV file in folder "Data".\n`;
  fs.appendFile('./scraper-error.log', message, () => {
    console.error(message);
  });
}

// if response not ok promise is rejected and catch will get the error.
function checkStatus({ data, response }) {
  if (response.statusCode === 200) {  
    return {data, response}
  } else {  
    return Promise.reject(new Error(response.statusText));
  }
}





















