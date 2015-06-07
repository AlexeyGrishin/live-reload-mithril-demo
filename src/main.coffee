
wrapItem = (item) ->
  "__stateless"
  m "i", ["[", item, "]"]

List =
  view: (c, items) ->
    m "ul", [
      items.map (i) -> m "li", wrapItem(i)
    ]


MainPage =
  controller: ->
    @opened = false
    @list = ["mithril", "live-reload", "????", "PROFIT"]
    @reloaded = true
    setTimeout (=>
      @reloaded = false
      m.redraw()
    ), 1000

  view: (c) ->
    m "div", [
      m "h3",
        {class: if c.reloaded then 'red' else 'gray'},
        "Page reloaded!"
      m "div.big", "Hello world"
      m "button.small",
        {onclick: (-> c.opened = not c.opened)},
        if c.opened then "Close" else "Open"
      m.component(List, c.list) if c.opened
    ]

m.mount document.getElementsByTagName("main")[0], MainPage