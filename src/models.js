const Ledger = {
  entries: [],

  populate: () => {
    let newEntries = [], i;
    for (i = 0; i < 5; i++) {
      newEntries.push({
        date: Date.now(),
        desc: "chipotle",
        amt: 12.29
      });
    }
    Ledger.entries = newEntries;
  }
}

module.exports = {
  Ledger
};
