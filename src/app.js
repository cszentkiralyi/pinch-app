import m from "mithril";

import { Ledger } from "./models.js";


const LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const NBSP = "\u00a0";


const $ = (sel, node) => (node || document).querySelector(sel);

const fmtDate = (d) => {
  let now = Date.now(),
      nowDay = now.getDate(),
      nowMonth = now.getMonth(),
      nowYear = now.getYear();
  let day = d.getDate(),
      month = d.getMonth(),
      year = d.getYear();
  let dayDiff = nowDay - day;
  if (day === nowDay &&
      month === nowMonth &&
      year === nowYear) {
    return "today";
  } else if (year < nowYear) {
    let yearDiff = nowYear - year;
    return (yearDiff > 1) ? `${yearDiff} years ago` : "last year";
  } else if (dayDiff === 1 && month === nowMonth) {
    return "yesterday";
  } else if (dayDiff < 7 && month === nowMonth) {
    return "this week";
  } else if (month === nowMonth) {
    return "this month";
  } else {
    return "this year";
  }
}

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
  constructor() {
    this.amtStr = "";
  }

  saveEntry() {
    if (!this.amt) return;
    let entry = {
      date: Date.now(),
      amt: this.amt,
      desc: this.desc
    };
    Ledger.db().put(entry);
  }

  tryParseAmt() {
    try {
      let v = parseFloat(this.amtStr);
      this.amt = v;
      this.amtStr = null;
    } catch (e) {
      this.amt = null;
    }
  }

  view(vnode) {
    return (
      <Card>
        <div className="relative mb-8">
          <input
            className={STYLES.input + "w-100 pl-8"}
            type="number"
            value={this.amtStr || (this.amt && this.amt.toFixed(2)) || ""}
            onchange={e => this.amtStr = e.target.value }
            onblur={_ => this.tryParseAmt()}
          />
          <div className="absolute inset-y-0 inset-l-0 ml-2 opacity-20 text-lg flex justify-center items-center">$</div>
        </div>
        <div className="mb-8">
          <input
            className={STYLES.input + "w-100"}
            type="text"
            onchange={e => this.desc = e.target.value}
            autocapitalize="none"
            placeholder="description" />
        </div>
        <div className="flex relative justify-center items-center p-4 mt-8">
          {NBSP}
          <a className={STYLES.button_alt + "block absolute inset-l-0"}
             href="#!/entry">
            more
          </a>
          <button
            className={STYLES.button_primary + "absolute inset-r-0"}
            onclick={e => this.saveEntry()}>
            enter
          </button>
        </div>
      </Card>
    );
  }
}

class LedgerEntryList {
  view(vnode) {
    let { showDate, list } = vnode.attrs;
    let gridTemplate = showDate
        ? "3fr 1fr 1fr"
        : "3fr 1fr";
    return (
      <div className="grid" style={{gridTemplateColumns: gridTemplate}}>
        {list.map((entry, i) => {
          let desc = (<div className="border-none border-b border-gray-300 p-2 ml-2">{entry.desc}</div>);
          let amt = (<div className="border-none border-b border-gray-300 p-2 mx-2">${entry.amt.toFixed(2)}</div>);
          let frag = showDate
            ? [desc,
               (<div className="border-none border-b border-gray-300 p-2 ml-2">{fmtDate(entry.date)}</div>),
               amt]
            : [desc, amt];
          return m.fragment(null, frag);
        })}
      </div>
    );
  }
}

class RecentEntriesCard {
  view(vnode) {
    let { list } = vnode.attrs;
    return (
      <Card>
        <div className="text-lg text-green-600 mb-4">
          recent entries
        </div>
        <LedgerEntryList
          showDate={false}
          list={list}
        />
        <div className="flex mt-2 justify-center items-center">
          <m.route.Link
            className={STYLES.button_alt}
            href="/ledger" >
            more
          </m.route.Link>
        </div>
      </Card>
    );
  }
}

const HomeScreen = {
  //oninit: () => Ledger.populate(),
  view: function HomeScreen_view() {
    return (
      <MainContent header={<Header>pinch</Header>}>
        <NewEntryCard />
        <RecentEntriesCard list={Ledger.recent.slice(0,8)}/>
      </MainContent>
    );
  }
};

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

class LedgerScreen {
  constructor() {
    this.entries = [];
    Ledger.all().then(arr => this.entries = arr).then(_ => m.redraw());
  }

  view() {
    let btnBack = (
      <m.route.Link
        className="p-4 ml-2 text-white text-rg font-weight-700"
        href="/">
        <i className="material-icons">arrow_back</i>
      </m.route.Link>
    );
    return (
      <MainContent header={<Header left={btnBack}>pinch</Header>}>
        <Card>
          <LedgerEntryList
            showDate={false}
            list={this.entries}
          />
        </Card>
      </MainContent>
    );
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('worker.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

m.route($("#app-container"), "/", {
  "/": HomeScreen,
  "/ledger": LedgerScreen,
  "/entry": EditScreen,
  "/entry/:id": EditScreen
});

