const bcrypt = require('bcrypt');

async function generateHash() {
  const saltRounds = 10;
  const password = "malove"; 
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("COPY THIS HASH:");
    console.log(hash);
    console.log("\nPaste this into MongoDB when creating your admin user");
  } catch (err) {
    console.error("Error generating hash:", err);
  }
}

generateHash();