import m from "mithril";

const $ = (sel, node) => (node || document).querySelector(sel);

m.render($("#app-container"), "Hello world!");
