/**
 * DERAIL - In case of excessively intense conversation, posts a random Neil Cicierega song
 */

let serverConfig = require("../serverConfig.js");

let helpStrings = [
  "**Derail**",
  "  *In case of excessively intense conversation, posts a random Neil Cicierega song*",
  "  Usage:",
  "    `!derail`",
];
let help = helpStrings.join("\n");

//** Command handlers
let commandHandlers = {};

commandHandlers.derail = function (message, args) {
  serverConfig
    .getServerConfig(message.guild.id)
    .then(function (config) {
      var songList = config.moduleConfig.derail;
      if (songList.length == 0) {
        message.reply("There are no songs to link to!");
      } else {
        var choose = songList[Math.floor(Math.random() * songList.length)];
        message.reply(choose);
      }
    })
    .catch(function (error) {
      message.reply("The config file for this server is broken!");
      console.error("The config file for this server is broken!");
      console.error(error);
    });
};

//** Module Exports
module.exports = {
  help: help,
  commandHandlers: commandHandlers,
};

let scriptName = __filename.split(/[\\/]/).pop().split(".").shift();
console.info(`${scriptName} module loaded.`);
