import m from "mithril";
import Dexie from "dexie";

const DB = new Dexie("pinch_app");
DB.version(1).stores({
  ledger: 'date,desc,*tags'
});

class LedgerModel {
  constructor() {
    this.recent = [];
    this.db().orderBy("date")
      .reverse()
      .limit(8)
      .toArray()
      .then(result => (this.recent = this.recent.concat(result)) && m.redraw());
  }

  db() { return DB.ledger; }
  all() { return this.db().orderBy("date").reverse().toArray(); }

  put(obj) { return this.db().put(obj); }

  populate() {
    let i;
    for (i = 0; i < 10; i++) {
      this.db().put({
        date: Date.now(),
        desc: "chipotle",
        amt: 12.29
      });
    }
  }
}

const Ledger = new LedgerModel();

module.exports = {
  Ledger
};
