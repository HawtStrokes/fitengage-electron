const bcrypt = require("bcrypt");
bcrypt.hash("ulol1234", 10, (err, hash) => console.log(hash));

