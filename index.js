const fs = require("fs");
const http = require("http");
const url = require("url");
const slugify = require("slugify");
const replaceTemplate = require("./modules/replaceTemplate");

// Reading the templates
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

// Reading and parsing data
const data = fs.readFileSync(`${__dirname}/food-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

// Creating slugs for the products
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

// Creating the server
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Overview Page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });

    // Replacing the template with product cards
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);

    // Product Page
  } else if (pathname === "/product") {
    const product = dataObj[query.id];

    // Check if product exists
    if (product) {
      res.writeHead(200, {
        "Content-type": "text/html",
      });
      const output = replaceTemplate(tempProduct, product);
      res.end(output);
    } else {
      res.writeHead(404, {
        "Content-type": "text/html",
      });
      res.end("<h1>Product not found!</h1>");
    }

    // API Route
  } else if (pathname === "/api") {
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(data);

    // 404 Not Found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

// Starting the server
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
