const fs = require("fs");
const path = require("path");

const read = (file) => fs.readFileSync(path.join(__dirname, file), "utf-8");

module.exports = {
  mainTemplate: read("main.hbs"),
  headerPartial: read("header.hbs"),
  commitPartial: read("commit.hbs"),
  footerPartial: read("footer.hbs"),
};
