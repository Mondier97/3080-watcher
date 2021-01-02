import dotenv from 'dotenv';
import sendgrid from '@sendgrid/mail';
import { exit } from 'process';
import { request } from 'https';
import cheerio from 'cheerio';

dotenv.config();

if (process.env.SENDGRID_API_KEY) {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.error('Sendgrid api key not provided in .env');
  exit();
}

let userEmail = '';
if (process.env.USER_EMAIL) {
  userEmail = process.env.USER_EMAIL;
} else {
  console.error('User Email was not provided');
  exit();
}

function sendMail(text: string, subject?: string, to?: string, from?: string) {
  subject = subject ? subject : 'Gtx 3080 Available for Purchase';
  to = to ? to : userEmail;
  from = from ? from : userEmail;

  const message = {
    to: to,
    from: from,
    subject: subject,
    text: text
  };

  sendgrid
    .send(message)
    .then(() => {
      console.log('Email Sent');
    })
    .catch((err) => {
      console.error(err);
    });
}

function onPageRecieved(data: string) {
  const $ = cheerio.load(data);
  const rows = $("#trackerContent > #data tr").get();

  const sites = rows.map((element) => {
    const name = $(element).children(":nth-child(1)").text();
    const url =  $(element).children(":nth-child(1)").children().first().attr('href');
    const status = $(element).children(":nth-child(2)").text();
    const price = $(element).children(":nth-child(3)").text();

    return {
      name: name,
      url: url,
      status: status,
      price: price
    };
  }).filter(site => {
    return !site.name.includes('Ebay');
  });

  const inStockSites = sites.filter(site => {
    return site.status === 'Stock Available' || site.status === 'In Stock';
  });

  if (inStockSites.length) {
    let emailBody = 'The following sites are in stock:\n\n';
    inStockSites.forEach(site => {
      emailBody += `name: ${site.name}, price: ${site.price}, url: ${site.url}\n`;
    });
    sendMail(emailBody);
  }
}

async function mainLoop() {

  const delay = 15 * 1000;

  const options = {
    hostname: 'www.nowinstock.net',
    port: 443,
    path: '/computers/videocards/nvidia/rtx3080/',
    method: 'GET'
  }

  while (true) {
    const req = request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('close', () => {
        onPageRecieved(data);
      });
    });

    req.on('error', err => {
      console.error(err);
    })

    req.end();

    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

mainLoop();