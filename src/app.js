import m from "mithril";

import { Ledger } from "./models.js";


const LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const NBSP = "\u00a0";


const $ = (sel, node) => (node || document).querySelector(sel);

const STYLES = {
  input: "block my-2 p-2 border-gray-400 focus:border-purple-400 text-lg ",
  button_primary: "p-4 bg-purple-400 text-white font-weight-700 shadow ",
  button_alt: "p-4 text-purple-400 font-weight-700 ",
  corner_button: "absolute inset-b-0 inset-r-0 m-8 rounded-full bg-purple-400 text-black text-3x font-weight-300 flex size-xl justify-center items-center "
};


class Header {
  view(vnode) {
    return (
      <div className="flex bg-green-600 font-weight-600 text-lg text-white py-4 justify-center shadow border-none border-b border-green-700 relative " id="header" style={{zIndex: 999}}>
        {vnode.attrs.left
         ? (<div className="absolute inset-y-0 inset-l-0 flex justify-center items-center">
          {vnode.attrs.left}
        </div>)
         : null}
        {vnode.children}
        {vnode.attrs.right
         ? (<div className="absolute inset-y-0 inset-r-0 flex justify-center items-center">
       {vnode.attrs.right}
     </div>)
         : null}
      </div>
    );
  }
}

class MainContent {
  constructor() {
    this.bodyHeight = "100vh";
  }

  oncreate(vnode) {
    let header = vnode.dom.querySelector('div#header');
    let headerHeight = header.getBoundingClientRect().bottom;
    this.bodyHeight = `calc(100vh - ${headerHeight}px)`;
    m.redraw();
  }

  view(vnode) {
    return (
      <div className="h-100 bg-gray-100 text-rg font-weight-400 overflow-hidden">
        {vnode.attrs.header}
        <div className="overflow-y-auto" style={{height: vnode.state.bodyHeight}}>
          {vnode.children}
        </div>
      </div>
    );
  }
}

class Card {
  view(vnode) {
    return (
      <div className="p-4 mb-8 bg-white text-black shadow border-none relative">
        {vnode.children}
      </div>
    );
  }
}

class NewEntryCard {
  view(vnode) {
    return (
      <Card>
        <div className="relative mb-8">
          <input className={STYLES.input + "w-100 pl-8"} type="number" />
          <div className="absolute inset-y-0 inset-l-0 ml-2 opacity-20 text-lg flex justify-center items-center">$</div>
        </div>
        <div className="mb-8">
          <input
            className={STYLES.input + "w-100"}
            type="text"
            autocapitalize="none"
            placeholder="description" />
        </div>
        <div className="flex relative justify-center items-center p-4 mt-8">
          {NBSP}
          <a className={STYLES.button_alt + "block absolute inset-l-0"}
             href="#!/entry">
            more
          </a>
          <div className={STYLES.button_primary + "absolute inset-r-0"}>
            enter
          </div>
        </div>
      </Card>
    );
  }
}

class RecentEntriesCard {
  view(vnode) {
    let { list } = vnode.attrs;
    return (
      <Card>
        <div className={STYLES.container_header + "text-green-600"}>
          recent entries
        </div>
        <div className="grid" style={{gridTemplateColumns: "3fr 1fr"}}>
          {list.map(({desc, amt}) => {
            return m.fragment(null, [
              (<div className="border-none border-b border-gray-300 p-2 ml-2">{desc}</div>),
              (<div className="border-none border-b border-gray-300 p-2 mr-2">${amt.toFixed(2)}</div>)
            ]);
          })}
        </div>
        <div className="flex mt-2 justify-center items-center">
          <div className={STYLES.button_alt}>more</div>
        </div>
      </Card>
    );
  }
}

const HomeScreen = {
  oninit: Ledger.populate,
  view: function HomeScreen_view() {
    return (
      <MainContent header={<Header>pinch</Header>}>
        <NewEntryCard />
        <RecentEntriesCard list={Ledger.entries.slice(0,8)}/>
      </MainContent>
    );
  }
}

class EditScreen {
  view() {
    let btnBack = (
      <m.route.Link
        className="p-4 ml-2 text-white text-rg font-weight-700"
        href="/">
        <i className="material-icons">arrow_back</i>
      </m.route.Link>
    );
    let calIcon = "\ue916"; // date_range, but the ligatures acted fucky and was 240px wide for no reason
    return (
      <MainContent header={<Header left={btnBack}>pinch</Header>}>
        <Card>
          <div className="relative mb-8">
            <input className={STYLES.input + "w-100 pl-8"} type="number" />
            <div className="absolute inset-y-0 inset-l-0 ml-2 opacity-20 text-lg flex justify-center items-center">$</div>
          </div>
          <div className="mb-8">
            <input className={STYLES.input + "w-100"}
                   type="text"
                   autocapitalize="none"
                   placeholder="description" />
          </div>
          <div className="relative mb-8">
            <input className={STYLES.input + "w-100 bg-white pl-8"} type="date" />
            <div className="absolute inset-y-0 inset-l-0 m-0 opacity-20 text-lg flex justify-center items-center">
              <i className="material-icons">{calIcon}</i>
            </div>
          </div>
          <div className="flex relative justify-center items-center mt-8">
            <div className={STYLES.button_primary + "mx-4 flex-grow text-center"}>
              enter
            </div>
          </div>
        </Card>
      </MainContent>
    );
  }
}

m.route($("#app-container"), "/", {
  "/": HomeScreen,
  "/entry": EditScreen,
  "/entry/:id": EditScreen
});

