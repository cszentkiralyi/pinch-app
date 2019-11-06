import m from "mithril";



const LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const NBSP = "\u00a0";


const $ = (sel, node) => (node || document).querySelector(sel);

const htr = function __htr(form) {
  return (!Array.isArray(form))
    ? form
    : m.apply(window, form.slice(0,2).concat(form.slice(2).map(__htr)));
}

const STYLES = {
  header: "flex bg-green-500 font-weight-600 text-lg text-gray-100 py-4 justify-center shadow-md relative ",
  container_header: "text-lg pb-2 ",
  container: "p-4 my-8 bg-white text-black shadow-md ",

  input: "my-2 p-2 border-gray-400 focus:border-purple-400 text-lg ",
  corner_button: "absolute inset-b-0 inset-r-0 m-8 rounded-full bg-purple-400 text-black text-3x font-weight-300 flex size-xl justify-center items-center "
};

const NewEntryCard = {
  view: function NewEntryCard_view() {
    return htr(
      ["div", {className: STYLES.container},
       ["div", {className: "relative mb-8"},
        ["input", {className: STYLES.input + "pl-8", type: "number"}],
        ["div", {className: "absolute inset-y-0 inset-l-0 ml-2 opacity-20 text-lg flex justify-center items-center"},
         "$"]],
       ["div", {className: "mb-8"},
        ["input", {className: STYLES.input, type: "text", placeholder: "Description"}]],
       ["div", {className: "flex relative justify-center items-center p-4 mt-8"},
        NBSP,
        ["div", {className: "absolute inset-l-0 ml-4 p-4 text-purple-400 font-weight-700"},
         "more"],
        ["div", {className: "absolute inset-r-0 mr-4 p-4 bg-purple-400 text-gray-100 font-weight-700 shadow-md"},
         "enter"]]]);
  }
};

const RecentEntriesCard = {
  view: function RecentEntriesCard_view() {
    return htr(
      ["div", {className: STYLES.container},
       ["div", {className: STYLES.container_header + "text-green-600"},
        "recent entries"],

       ["div",
        {className: "grid",
         style: {gridTemplateColumns: "3fr 1fr"}},
        ["div", {className: "border-none border-b border-gray-300 p-2 ml-2"}, "chipotle"],
        ["div", {className: "border-none border-b border-gray-300 p-2 mr-2"}, "$12.29"],
        ["div", {className: "border-none border-b border-gray-300 p-2 ml-2"}, "chipotle"],
        ["div", {className: "border-none border-b border-gray-300 p-2 mr-2"}, "$12.29"],
        ["div", {className: "border-none border-b border-gray-300 p-2 ml-2"}, "chipotle"],
        ["div", {className: "border-none border-b border-gray-300 p-2 mr-2"}, "$12.29"]
        ,
        ["div", {className: "border-none border-b border-gray-300 p-2 ml-2"}, "chipotle"],
        ["div", {className: "border-none border-b border-gray-300 p-2 mr-2"}, "$12.29"]
        ,
        ["div", {className: "border-none border-b border-gray-300 p-2 ml-2"}, "chipotle"],
        ["div", {className: "border-none border-b border-gray-300 p-2 mr-2"}, "$12.29"]
       
       ],

       ["div", {className: "flex mt-2 justify-center items-center"},
        ["div", {className: "p-4 text-purple-400 font-weight-700"},
         "more"]
       ]

      ]
    );
    
  }
}
;

const App = {
  view: function App_view() {
    return htr(
      ["div", {className: "h-100 bg-gray-100 text-rg font-weight-400"},
       ["div", {className: STYLES.header},
        "pinch"],

       [NewEntryCard],

       [RecentEntriesCard]
       /*
         ["div", {className: STYLES.container},
         "This is some content on a light card."
         ],
         ["div", {className: STYLES.container},
         ["div", {className: STYLES.container_header}, "A Header"],
         LOREM_IPSUM],
         ["div", {className: STYLES.corner_button}, "+"]
       */
      ])
  }
}

//m.render($("#app-container"), "Hello world!");
m.mount($("#app-container"), App);

