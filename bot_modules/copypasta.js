/**
 * COPYPASTA - Sends only the best and most rational copypastas
 */

let serverConfig = require("../serverConfig.js");

let helpStrings = [
  "**Copypasta**",
  "  *Sends only the best and most rational copypasta*",
  "  Usage:",
  "    `!pasta` - Shows available pasta",
  "    `!pasta <pastaname>` - Posts delicious pasta",
];
let help = helpStrings.join("\n");

//** Command handlers
let commandHandlers = {};

commandHandlers.pasta = function (message, args) {
  serverConfig
    .getServerConfig(message.guild.id)
    .then(function (config) {
      if (args === "") {
        message.reply("Usage: !pasta <pasta>");
        let pastaMessage = ["Available Pasta:", "```"];
        Object.keys(config.moduleConfig.copypasta).forEach(function (
          element,
          index
        ) {
          pastaMessage.push("* " + element);
        });
        pastaMessage.push("```");

        message.reply(pastaMessage.join("\n"));
        return;
      }

      if (Object.keys(config.moduleConfig.copypasta).indexOf(args) !== -1) {
        let pasta = config.moduleConfig.copypasta[args];
        message.reply(pasta);
      } else {
        message.reply("Couldn't find that pasta!");
      }
    })
    .catch(function (error) {
      message.reply(
        "There's no copypasta configured for this server. Sorry :("
      );
      console.error("Couldn't load any copypasta: " + error);
    });
};

commandHandlers.listpastas = function (message, args) {
  if (!message.guild) {
    message.reply("This command must be run in a server.");
    return false;
  }

  getPastas(message.guild.id, function (pastas) {
    if (typeof pastas === "object" && Object.keys(pastas).length > 0) {
      pastaMessage = "Pastas:\n";

      Object.keys(pastas).forEach(function (element, index) {
        pastaMessage += element;
        if (index < Object.keys(pastas).length - 1) {
          pastaMessage += ", ";
        }
      });

      message.reply(pastaMessage + "```");
    } else {
      message.reply(
        "There's no copypasta configured for this server. Sorry :("
      );
    }
  });
};

let getPastas = function (guildId, callback) {
  serverConfig.getServerConfig(guildId, function (config) {
    if (
      config.moduleConfig &&
      config.moduleConfig.copypasta &&
      config.moduleConfig.copypasta.pastas
    ) {
      callback(config.moduleConfig.copypasta.pastas);
    } else {
      callback([]);
    }
  });
};

//** Module Exports

module.exports = {
  help: help,
  commandHandlers: commandHandlers,
};

let scriptName = __filename.split(/[\\/]/).pop().split(".").shift();
console.info(`${scriptName} module loaded.`);
