const { Application } = require("lisk-sdk");
const { genesisBlockDevnet, configDevnet, CONSTANTS } = require("./config");
const { ArchiveTextTransaction, ArchiveBinaryTransaction } = require("./transactions");

const app = new Application(genesisBlockDevnet, configDevnet);

app.registerTransaction(ArchiveTextTransaction);
app.registerTransaction(ArchiveBinaryTransaction);

app.constants = {
  ...app.constants,
  ...CONSTANTS
};

app
  .run()
  .then(() => app.logger.info("App started..."))
  .catch(error => {
    console.error("Faced error in application", error);
    process.exit(1);
  });
