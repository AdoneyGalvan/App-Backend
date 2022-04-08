const express = require('express');
const path = require('path');
var cors = require('cors');
const app = express();
const data = path.join(__dirname, '/data.json')
var stringSimilarity = require("string-similarity");
const fetch = require('node-fetch');
const {performance} = require('perf_hooks');
const cheerio = require('cheerio');


// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
const puppeteer = require('puppeteer-extra');

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { timeStamp } = require('console');
const { response } = require('express');
const { request } = require('http');
puppeteer.use(StealthPlugin());

app.use(cors())

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);

const fetchWalmartItems = async (search, searchpage, browser) => 
{
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    try {
        await page.setViewport({ width: 1000, height: 4000 });
        await page.goto(`https://www.walmart.com/search?q=${search}&page=${searchpage}`, {waitUntil: 'networkidle0', timeout: 0});

        let html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);
        let parentElement = $('.flex.flex-wrap.w-100.flex-grow-0.flex-shrink-0.ph2.pr0-xl.pl4-xl.mt0-xl.mt3').html();

        var names = [];
        var urls = [];
        var prices = [];
        var imgurls = [];

        $('.f6.f5-l.normal.dark-gray.mb0.mt1.lh-title', parentElement).each(function(i, elem){
            names[i] = $(this).text();
        });

        $('.absolute.w-100.h-100.z-1', parentElement).each(function(i, elem){
            urls[i] = $(this).attr('href');
        });

        $('.b.black.f5.mr1.mr2-xl.lh-copy.f4-l, .normal.gray.f5.mr1.mr2-xl.lh-copy.f4-l', parentElement).each(function(i, elem){
            prices[i] = $(this).text();
        });

        $('.absolute.top-0.left-0', parentElement).each(function(i, elem){
            imgurls[i] = $(this).attr('src');
        });

        
        var items = [];
        var item = {};

        for (var i = 0; i < names.length; i++)
        {
            item.id = i;
            names[i] != undefined ? item.name = names[i] : item.name = "Missing Description";
            urls[i] != undefined ? item.url = "https://www.walmart.com/" + urls[i] : item.url = "";
            prices[i] != undefined ? item.price = parseFloat(prices[i].slice(1)) : item.price = 0;
            imgurls[i] != undefined ? item.imgurl = imgurls[i] : item.imgurl = "";
            item.store = "Walmart";

            items.push({...item});
        }

        return items;
    }
    catch(error)
    {
        console.log(error);
        var items = [];
        var item = {};
    
        item.id = "0";
        item.url = "";
        item.name = "Test";
        item.price = 100;
        item.imgurl = "";
        item.store = "Walmart";
    
        items.push({...item});
        return items;
    }
}

const fetchSafewayItems = async (search, searchpage, browser) => 
{
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    try {
        await page.setViewport({ width: 1000, height: 4000 });
        await page.goto(`https://www.safeway.com/shop/search-results.html?q=${search}`, {waitUntil: 'networkidle0', timeout: 0});

        let html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);
        let parentElement = $('.search-results-grid.section').html();

        var names = [];
        var urls = [];
        var prices = [];
        var imgurls = [];

        $('.product-title', parentElement).each(function(i, elem){
            names[i] = $(this).text();
        });

        $('.product-title', parentElement).each(function(i, elem){
            urls[i] = $(this).attr('href');
        });

        $('.product-price, .product-price.product-strike-price', parentElement).each(function(i, elem){
            prices[i] = $(this).text();
        });

        $('.ab-lazy.loaded', parentElement).each(function(i, elem){
            imgurls[i] = $(this).attr('src');
        });

        var items = [];
        var item = {};

        for (var i = 0; i < names.length; i++)
        {
            item.id = i;
            names[i] != undefined ? item.name = names[i] : item.name = "Missing Description";
            urls[i] != undefined ? item.url = "https://www.safeway.com" + urls[i] : item.url = "";
            if (prices[i] != undefined)
            {
                price = prices[i].match(/\$\d+(\.\d+)?/gi);
                item.price = parseFloat(price[0].slice(1));
            } else 
            {
                item.price = 0;
            }
            
            imgurls[i] != undefined ? item.imgurl = "https:" + imgurls[i] : item.imgurl = "";
            item.store = "Safeway";

            items.push({...item});
        }

        return items;
    }
    catch(error)
    {
        console.log(error);
        var items = [];
        var item = {};
    
        item.id = "0";
        item.name = "Test";
        item.url = "";
        item.price = 100;
        item.imgurl = "";
        item.store = "Safeway";
    
        items.push({...item});
    
        return items;
    }
}

const fetchFredMeyerItems = async (search, searchpage, browser) => 
{
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    
    try {
        await page.setViewport({ width: 1000, height: 4000 });
        await page.goto(`https://www.fredmeyer.com/search?query=${search}&page=${searchpage}`, {waitUntil: 'networkidle0', timeout: 0});

        let html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);
        let parentElement = $('.AutoGrid').html();

        var names = [];
        var urls = [];
        var prices = [];
        var imgurls = [];

        $('.kds-Text--l.text-default-900.font-secondary.font-500.mt-8.mb-0', parentElement).each(function(i, elem){
            names[i] = $(this).text();
        });

        $('.kds-Link.kds-Link--inherit.kds-Link--implied.ProductDescription-truncated.overflow-hidden', parentElement).each(function(i, elem){
            urls[i] = $(this).attr('href');
        });

        $('.kds-Price.kds-Price--alternate', parentElement).each(function(i, elem){
            prices[i] = $(this).attr('value');
        });

        $('.kds-Image-img', parentElement).each(function(i, elem){
            imgurls[i] = $(this).attr('src');
        });

        var items = [];
        var item = {};

        for (var i = 0; i < names.length; i++)
        {
            item.id = i;
            names[i] != undefined ? item.name = names[i] : item.name = "Missing Description";
            urls[i] != undefined ? item.url = "https://www.fredmeyer.com" + urls[i] : item.url = "";
            prices[i] != undefined ? item.price = parseFloat(prices[i]) : item.price = 0;
            imgurls[i] != undefined ? item.imgurl = imgurls[i] : item.imgurl = "";
            item.store = "Fred Meyer";

            items.push({...item});
        }
  
        return items;
    }
    catch(error)
    {
        console.log(error);
        var items = [];
        var item = {};
    
        item.id = "0";
        item.name = "Test";
        item.url = "";
        item.price = 100;
        item.imgurl = "";
        item.store = "Fred Meyer";
    
        items.push({...item});
    
        return items;
    }
}

const fetchWincoItems = async (search, searchpage, browser) => 
{
    var items = [];
    var item = {};

    item.id = "0";
    item.name = "Test";
    item.price = 100;
    item.imgurl = "";
    item.store = "Winco";

    items.push({...item});

    return items;
}

const fetchTargetItems = async (search, searchpage, browser) => 
{
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.setExtraHTTPHeaders({
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        'connection': 'keep-alive',
        'upgrade-insecure-requests': '1',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'if-none-match': '\"2dddf-wI5dD+fLRbKmsSE2bQK9HW20S9w\"',
        'cache-control': 'max-age=0'

    })

    try {

        await page.goto(`https://www.target.com/s?searchTerm=${search}`, {waitUntil: 'networkidle0', devtools: true, timeout: 0});
        await page.waitForTimeout(100000);

        let html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);
        console.log($);
        var names = [];
        var urls = [];
        var prices = [];
        var imgurls = [];

        $("a[data-test='product-title']").each(function(i, elem){
            names[i] = $(this).attr('aria-label');
        });

/*         $('.kds-Link.kds-Link--inherit.kds-Link--implied.ProductDescription-truncated.overflow-hidden', parentElement).each(function(i, elem){
            urls[i] = $(this).attr('href');
        });

        $('.kds-Price.kds-Price--alternate', parentElement).each(function(i, elem){
            prices[i] = $(this).attr('value');
        });

        $('.kds-Image-img', parentElement).each(function(i, elem){
            imgurls[i] = $(this).attr('src');
        }); */

        var items = [];
        var item = {};

        for (var i = 0; i < names.length; i++)
        {
            item.id = i;
            names[i] != undefined ? item.name = names[i] : item.name = "Missing Description";
            item.store = "Target";

            items.push({...item});
        }
        console.log(items);
        return items;
    }
    catch (error)
    {
        console.log(error);
        var items = [];
        var item = {};
    
        item.id = "0";
        item.name = "Test";
        item.price = 100;
        item.imgurl = "";
        item.store = "Target";
    
        items.push({...item});
    
        return items;
    }
}

const SearchItems = async (search, searchpage) => 
{
    var items = [];

    // Stores the promises for the items
    let promisesitems = [];

    // Stores the promised items when relsolved
    let returneditems = [];

    const browser = await puppeteer.launch(
        { headless:true, 
            args: ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-accelerated-2d-canvas',
            '--no-zygote',
            '--renderer-process-limit=1',
            '--no-first-run',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-dev-shm-usage',
            '--disable-infobars',
            '--lang=en-US,en',
            '--window-size=1920x1080',
            '--disable-extensions'] , 
            userDataDir: './cache'});

    // Search for items at Fred Meyers
    console.log(`Searching for ${search} @ Fred Meyers`);
    promisesitems.push(fetchFredMeyerItems(search, searchpage, browser));

    // Search for items at Walmart
    console.log(`Searching for ${search} @ Walmart`);
    promisesitems.push(fetchWalmartItems(search, searchpage, browser));

    // Search for items at Safeway
    console.log(`Searching for ${search} @ Safeway`);
    promisesitems.push(fetchSafewayItems(search, searchpage, browser));

    // Search for items at Winco
    console.log(`Searching for ${search} @ Winco`);
    promisesitems.push(fetchWincoItems(search, searchpage, browser));

    // Wait for the fetches to be completed
    returneditems  = await Promise.all(promisesitems);
    await browser.close();

    // Merge all the fetched items into a single array
    items =[...returneditems[0], ...returneditems[1], ...returneditems[2], ...returneditems[3]];

    for (var i = 0; i < items.length; i++)
    {
        items[i].id = i;
    }

    return items;
}

// An api endpoint that returns a short list of items
app.get('/walmart', async (req,res) => 
{

    const t0 = performance.now();
    console.log(`Searching for ${req.query.search} @ Walamrt`);
    const browser = await puppeteer.launch({ headless:true, args: [ '--no-sandbox', '--disable-setuid-sandbox', "--disable-dev-shm-usage", "--disable-gpu" ], userDataDir: './cache'});
    var data = await fetchWalmartItems(req.query.search, req.query.searchpage, browser);
    await browser.close();
    const t1 = performance.now();
    console.log(`Duration: ${t1-t0}`);
    res.send(data);
});

// An api endpoint that returns a short list of items
app.get('/safeway', async (req,res) => 
{
    const t0 = performance.now();
    console.log(`Searching for ${req.query.search} @ Safeway`);
    const browser = await puppeteer.launch({ headless:true, args: [ '--no-sandbox', '--disable-setuid-sandbox', "--disable-dev-shm-usage", "--disable-gpu" ], userDataDir: './cache'});
    var data = await fetchSafewayItems(req.query.search, req.query.searchpage, browser);
    await browser.close();
    const t1 = performance.now();
    console.log(`Duration: ${t1-t0}`);
    res.send(data);
});

// An api endpoint that returns a short list of items
app.get('/fredmeyer', async (req,res) => 
{
    const t0 = performance.now();
    console.log(`Searching for ${req.query.search} @ Fred Meyers`);
    const browser = await puppeteer.launch({ headless:true, args: [ '--no-sandbox', '--disable-setuid-sandbox', "--disable-dev-shm-usage", "--disable-gpu" ], userDataDir: './cache'});
    var data = await fetchFredMeyerItems(req.query.search, req.query.searchpage, browser);
    await browser.close();
    const t1 = performance.now();
    console.log(`Duration: ${t1-t0}`);
    res.send(data);
});

// An api endpoint that returns a short list of items
app.get('/winco', async (req,res) => 
{
        const t0 = performance.now();
        console.log(`Searching for ${req.query.search} @ WinCo`);
        const browser = await puppeteer.launch({ headless:true, args: [ '--no-sandbox', '--disable-setuid-sandbox', "--disable-dev-shm-usage", "--disable-gpu" ], userDataDir: './cache'});
        var data = await fetchWincoItems(req.query.search, req.query.searchpage, browser);
        await browser.close();
        const t1 = performance.now();
        console.log(`Duration: ${t1-t0}`);
        res.send(data);
});

// An api endpoint that returns a short list of items
app.get('/target', async (req,res) => 
{
    const t0 = performance.now();
    console.log(`Searching for ${req.query.search} @ Target`);
    const browser = await puppeteer.launch({ headless:false, args: [ '--no-sandbox', '--disable-setuid-sandbox', "--disable-dev-shm-usage", "--disable-gpu" ], userDataDir: './cache'});
    var data = await fetchTargetItems(req.query.search, req.query.searchpage, browser);
    await browser.close();
    const t1 = performance.now();
    console.log(`Duration: ${t1-t0}`);
    res.send(data);
});

// An api endpoint that returns a short list of items
app.get('/search', async (req,res) => 
{
        const t0 = performance.now();
        var data = await SearchItems(req.query.search, req.query.searchpage);
        const t1 = performance.now();
        console.log(`Duration: ${t1-t0}`);
        res.send(data);
});

app.get('/test', async (req,res) => 
{

        var data = await fetchWalmartItems(req.query.search, req.query.searchpage);
        res.send(data);
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    console.log(data);
    res.sendFile(data);
});
