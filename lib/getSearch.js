var rp = require("request-promise");
var config = require("../config");
var fs = require("fs");

async function gs(keyword) {
  var url =
    "http://api.zhuishushenqi.com/book/fuzzy-search?query=" +
    encodeURI(keyword);
  var opt = {};
  opt["uri"] = url;
  opt["timeout"] = config.timeout;
  opt["User-Agent"] = config.ua;

  return rp(opt)
    .then(async res => {
      var json = JSON.parse(res);
      var books = json.books;
      var list = "";
      var ids = [];
      var intros = [];
      var titles = [];
      var covers = [];
      var authors = [];
      var cats = [];
      var lps = [];

      books.forEach(element => {
        if (element.contentType === "epub") {
          return true;
        }
        ids.push(element._id);
        intros.push(element.shortIntro);
        titles.push(element.title);
        covers.push(decodeURIComponent(element.cover.replace("/agent/", "")));
        authors.push(element.author);
        cats.push(element.cat);
      });

      var bdres = await rp(
        "http://api05iye5.zhuishushenqi.com/book?view=updated&id=" + ids.join()
      );
      var bdresjson = JSON.parse(bdres);
      for (var j in bdresjson) {
        lps.push(bdresjson[j].lastChapter);
      }

      for (var i = 0; i < ids.length; i++) {
        list +=
          '<li><h2><a href="/book/detail?bid=' +
          ids[i] +
          "&intro=" +
          intros[i] +
          '">' +
          titles[i] +
          '</a></h2><img src="' +
          covers[i] +
          '"><h4>' +
          authors[i] +
          "</h4>" +
          "<h4>" +
          cats[i] +
          "</h4>" +
          '<div class="intro">' +
          intros[i] +
          '</div><br><div class="lp">' +
          lps[i] +
          "</div></li>";
      }

      var body =
        '<body><div id="right" style="display:none"><ul class="list_box">' +
        list +
        "</ul></div></body>";

      var html = fs.readFileSync("./lib/ex.html", "utf-8");

      return html.replace("Null", body);
    })
    .catch(e => {
      return e.toString();
    });
}

module.exports = gs;
