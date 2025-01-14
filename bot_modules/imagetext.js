/**
 * Images with text on them, you know, for making funny meme pics.
 */

const Discord = require("discord.js");
const serverConfig = require("../serverConfig.js");
const fs = require("fs");
const spawn = require("cross-spawn");
const tmp = require("tmp");
const onlyEmoji = require("emoji-aware").onlyEmoji;

let helpStrings = [
  "**Images With Text**",
  "  *Appropriately frames the take*",
  "  Usage:",
  "    `!im` - Shows available images",
  "    `!im <image> <text>` - Puts <text> on <image>",
];
let help = helpStrings.join("\n");

//** Command handlers

let commandHandlers = {};

commandHandlers.im = function (message, args) {
  serverConfig
    .getServerConfig(message.guild.id)
    .then(function (config) {
      let images = config.moduleConfig.imagetext;
      if (typeof images == "undefined") {
        message.channel.send(
          "Error: The imagetext module has not been configured."
        );
        console.error("The imagetext module has not been configured.");
        return;
      }

      // Print template name list if we didn't get one
      if (args === "") {
        message.channel.send("Usage: `!im <template> <text>`");
        message.channel.send(
          "Available templates: `" + Object.keys(images).join(", ") + "`"
        );
        return;
      }

      let words = args.split(" "); // Split the args into words.
      let command = words.splice(0, 1)[0].toLowerCase(); // Remove the first word.
      let messageText = words.join(" ");

      // Set a reasonable maximum message length
      if (messageText.length > 240) {
        message.channel.send("Error: That message is too long.");
        return;
      }

      // Complain if we didn't get a valid template name
      if (!(command in images)) {
        message.channel.send("Error: Couldn't find that template.");
        message.channel.send(
          "Available templates: `" + Object.keys(images).join(", ") + "`"
        );
        return;
      }

      let imgMeta = images[command];
      if (!sendImage(messageText, imgMeta, message)) {
        message.channel.send("Error: Image generation failed.");
        return;
      }
    })
    .catch(function (error) {
      message.channel.send("An error occurred.");
      console.error("An error occurred in the imagetext module:");
      console.error(error);
    });
};

function sendImage(text, imgMeta, message) {
  let template = `bot_modules/imagetext/${imgMeta.template}`;
  let font = `bot_modules/imagetext/fonts/${imgMeta.font}`;
  let emojiFont = "bot_modules/imagetext/fonts/NotoEmoji-Regular.ttf";
  let pointSize = imgMeta.pointSize;
  let emojiSize = imgMeta.emojiPointSize;
  let size = imgMeta.size;
  let offset = imgMeta.offset;
  let align = imgMeta.align;
  let background = imgMeta.bgColor;
  let fill = imgMeta.fgColor;

  // generate random filename in the tmp/ directory
  let tempFile = tmp.fileSync({});

  let emojiList = onlyEmoji(text);

  if (emojiList.length > 0 && emojiList[0] == text) {
    font = emojiFont;
    pointSize = emojiSize;
  }

  try {
    let imCmd = "convert";

    if (pointSize === undefined) {
      var imArgs = [
        template,
        "-background",
        background,
        "-fill",
        fill,
        "-font",
        font,
        "-gravity",
        align,
        "-size",
        size,
        `caption:${text}`,
        "-geometry",
        offset,
        "-gravity",
        "northwest",
        "-composite",
        tempFile.name,
      ];
    } else {
      var imArgs = [
        template,
        "-background",
        background,
        "-fill",
        fill,
        "-font",
        font,
        "-pointsize",
        pointSize,
        "-gravity",
        align,
        "-size",
        size,
        `caption:${text}`,
        "-geometry",
        offset,
        "-gravity",
        "northwest",
        "-composite",
        tempFile.name,
      ];
    }

    // if this is the dril or pa template, use different imagemagick arguments
    if (imgMeta.template === "dril") {
      let templateTop = "bot_modules/imagetext/dril_top.png";
      let templateBottom = "bot_modules/imagetext/dril_bottom.png";
      imArgs = [
        templateTop,
        "-background",
        background,
        "-fill",
        fill,
        "-font",
        font,
        "-pointsize",
        pointSize,
        "-size",
        size,
        `caption:${text}`,
        "-gravity",
        align,
        templateBottom,
        "-append",
        tempFile.name,
      ];
    } else if (imgMeta.template === "pa") {
      let templateTop = "bot_modules/imagetext/pa_top.png";
      let templateBottom = "bot_modules/imagetext/pa_bottom.png";
      imArgs = [
        templateTop,
        "-background",
        background,
        "-fill",
        fill,
        "-font",
        font,
        "-kerning",
        "-0.3",
        "-interline-spacing",
        "2",
        "-pointsize",
        pointSize,
        "-size",
        size,
        `caption:${text}`,
        "-gravity",
        align,
        templateBottom,
        "-append",
        tempFile.name,
      ];
    }

    // print convert command for debugging
    console.debug(imCmd, imArgs.join(" "));

    // execute imagemagick with the given arguments and get the result
    let result = spawn.sync(imCmd, imArgs);
    if (result.status !== 0) {
      // if the error code is not zero, something went wrong
      console.error("Image couldn't be generated:");
      console.error("Output:", result.stderr.toString());

      // delete the temp file
      tempFile.removeCallback();
      return false;
    }

    message
      .reply({
        files: [
          {
            attachment: tempFile.name,
            name: `${imgMeta.template.split(".").shift()}.png`,
          },
        ],
      })
      .then((message) => {
        console.log("Image macro sent!");

        // delete the temp file
        tempFile.removeCallback();
      })
      .catch(console.error);

    return true;
  } catch (error) {
    // delete the temp file
    tempFile.removeCallback();
  }
}

//** Module Exports

module.exports = {
  help: help,
  commandHandlers: commandHandlers,
};

let scriptName = __filename.split(/[\\/]/).pop().split(".").shift();
console.info(`${scriptName} module loaded.`);
