template = """
            module.exports.PageXXX =
              controller: ->
                @list = ["mithril", "live-reload", "????", "BROWSERIFY"]
                null

              view: (c, item) ->
                m "div.big", c.list[item]
            """
fs = require('fs')
body = []
for i in [1..1000]
  body.push template.replace(/XXX/, i)
fs.writeFileSync "something_big.coffee", body.join("\n\n"), {encoding: "utf-8"}
