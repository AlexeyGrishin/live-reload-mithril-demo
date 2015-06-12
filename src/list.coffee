
wrapItem = (item) ->
  "__stateless"
  m "i", ["[", item, "]"]

module.exports = List =
  view: (c, items) ->
    m "ul", [
      items.map (i) -> m "li", wrapItem(i)
    ]

