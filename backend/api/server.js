const app = require("../dist/app.js").default;

// Vercel requires exporting a handler, not using app.listen
module.exports = app;
