const express = require("express");
const router = require("./routes");

const app = express();
app.use(express.json());
app.use(router);

app.listen(3000, () => {
  console.log("Naive service running on port 3000");
});
