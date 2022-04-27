// const path = require("path");
// const morgan = require("morgan");
// const rfs = require("rotating-file-stream");

// const logStream = rfs.createStream("file.log", {
//   size: "5M",
//   interval: "1d",
//   compress: "gzip",
//   path: path.relative(__dirname, 'backend/logs '),
// });

// module.exports = morgan("short", { stream: logStream });