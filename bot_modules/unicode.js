/**
 * UNICODE - Replaces letters with letterlike symbols
 *
 * To add new mangling modes, add a new object to the charsets array.
 * Make sure the order of characters in the alpha/numeric/punctuation arrays is the same as in the reference arrays
 * Characters in new mangling modes that aren't supported should be "skipped" by making them empty strings
 */

const fs = require("fs");
const onlyEmoji = require("emoji-aware").onlyEmoji;

let helpStrings = [
  "**Unicode**",
  "  *Converts given text into emoji characters*",
  "  Usage:",
  "    `!ri <message>` - prints <message> using emoji characters",
  "    `!clap <message>` - replaces:clap:spaces:clap:with:clap:clap:clap:emoji",
  "    `!sheriff <message>` - howdy. im the sheriff of <message> (message must be an emoji)",
  "    `!emoji <emoji name>` - looks up an emoji by name and posts it",
];
let help = helpStrings.join("\n");

const avoidFlags = true;

const reDigits = /^\d+$/;
const reAlpha = /^([a-zA-z])+$/;
const rePunc = /[!\"#\$%&'\(\)\*\+\-\.\/:;<=>\?@\[\\\]\^_`{\|}~]/;

const reference = {
  alpha: [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ],
  numeric: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  punctuation: [
    "!",
    '"',
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "/",
    ":",
    ";",
    "<",
    "=",
    ">",
    "?",
    "@",
    "[",
    "\\",
    "]",
    "^",
    "_",
    "`",
    "{",
    "|",
    "}",
    "~",
  ],
};

const charsets = [
  {
    name: "Regional Indicator",
    aliases: ["regional", "reg", "ri"],
    variants: [
      {
        name: "Regular",
        aliases: ["", "r", "rg"],
        charset: {
          alpha: [
            "🇦",
            "🇧",
            "🇨",
            "🇩",
            "🇪",
            "🇫",
            "🇬",
            "🇭",
            "🇮",
            "🇯",
            "🇰",
            "🇱",
            "🇲",
            "🇳",
            "🇴",
            "🇵",
            "🇶",
            "🇷",
            "🇸",
            "🇹",
            "🇺",
            "🇻",
            "🇼",
            "🇽",
            "🇾",
            "🇿",
            "🇦",
            "🇧",
            "🇨",
            "🇩",
            "🇪",
            "🇫",
            "🇬",
            "🇭",
            "🇮",
            "🇯",
            "🇰",
            "🇱",
            "🇲",
            "🇳",
            "🇴",
            "🇵",
            "🇶",
            "🇷",
            "🇸",
            "🇹",
            "🇺",
            "🇻",
            "🇼",
            "🇽",
            "🇾",
            "🇿",
          ],
        },
      },
    ],
  },
];

let testAliases = [];
for (var i = 0; i < charsets.length; i++) {
  let cs = charsets[i];
  for (var ai = 0; ai < cs.aliases.length; ai++) {
    let alias = cs.aliases[ai];
    if (testAliases.includes(alias)) {
      console.warn(
        `Alias "${alias}" is defined multiple times. Skipping Unicode module.`
      );
      return;
    }
    testAliases.push(alias);
  }
}

//** Command handlers

let commandHandlers = {};

commandHandlers.ri = function (message, args) {
  let messageContent = args;

  if (messageContent === "") {
    message.channel.send("You must specify a message.");
    return false;
  }

  let mangledText = mangleText("ri", messageContent);
  if (mangledText === null) {
    message.channel.send(`Something went wrong. :pensive:`);
    return false;
  }

  // avoid flags by appending a zero-width space to every character
  if (avoidFlags) mangledText = [...mangledText].join("\u200B");

  message.channel.send(mangledText);
};

commandHandlers.clap = function (message, args) {
  let messageContent = args;

  // append a zero-width space to all @s to avoid bot pings
  messageContent = messageContent.replace(/@/g, "@\u200B");

  // replace all spaces with claps
  messageContent = messageContent.replace(/\s+/g, " :clap: ");

  message.channel.send(messageContent);
};

commandHandlers.sheriff = function (message, args) {
  let sheriffTemplate =
    "﻿                   🤠\n　　💯💯💯\n　💯 　💯　💯\n👇　  💯💯　👇\n　　💯　  💯\n　　💯　　💯\n　　 👢　　👢 ";
  let serverEmojiRegex = /<(.*?):(.*?):(.*?)>/;

  let messageContent = args.trim();
  let standardEmoji = onlyEmoji(messageContent);
  let sem = messageContent.match(serverEmojiRegex);
  let serverEmoji;
  if (sem)
    serverEmoji = message.client.emojis.cache.find(
      (emoji) => emoji.name == sem[2] && emoji.id == sem[3]
    );
  let backupEmoji = message.client.emojis.cache.find(
    (emoji) => emoji.name == messageContent
  );

  // console.debug(standardEmoji);
  // console.debug(sem);
  // console.debug(backupEmoji);

  if (standardEmoji.length > 0) {
    sheriffTemplate = sheriffTemplate.replace(/💯/g, standardEmoji[0]);
  } else if (serverEmoji) {
    sheriffTemplate = sheriffTemplate.replace(/💯/g, serverEmoji);
  } else if (backupEmoji) {
    sheriffTemplate = sheriffTemplate.replace(/💯/g, backupEmoji);
  } else {
    console.log("Sheriff:", messageContent, "failed");
    message.channel.send(
      "I don't know this emoji. If this is a server emoji, consider adding me to the server it came from! <3"
    );
    return;
  }

  console.log("Sheriff:", messageContent);
  message.channel.send(sheriffTemplate);
};

commandHandlers.emoji = function (message, args) {
  let messageContent = args.trim();
  let matchingEmoji = message.client.emojis.cache.find(
    (emoji) => emoji.name == messageContent
  );

  if (matchingEmoji) {
    let emojiTemplate = "<#animated#:#name#:#id#>";
    emojiTemplate = emojiTemplate.replace(
      "#animated#",
      matchingEmoji.animated ? "a" : ""
    );
    emojiTemplate = emojiTemplate.replace("#name#", matchingEmoji.name);
    emojiTemplate = emojiTemplate.replace("#id#", matchingEmoji.id);
    console.log("Emoji: ", emojiTemplate);

    message.channel.send(emojiTemplate);
  } else {
    console.log("Emoji: ", messageContent, "not found");
    message.channel.send(
      "I don't know this emoji. If this is a server emoji, consider adding me to the server it came from! <3"
    );
    return;
  }
};

//** Functions for unicode command

function mangleText(mode, text) {
  let modeSplit = mode.split("-");

  let modeName = modeSplit[0].toLowerCase();
  let modeVariant = "";
  if (modeSplit.length > 1) modeVariant = modeSplit[1].toLowerCase();

  // console.info("Mode split", modeSplit);

  var selectedCharset = null;

  outerLoop: for (var i = 0; i < charsets.length; i++) {
    let cs = charsets[i];
    let charsetName = cs.name.replace(/\s/g, "").toLowerCase();

    for (var j = 0; j < cs.variants.length; j++) {
      let variant = cs.variants[j];
      let variantName = variant.name.replace(/\s/g, "").toLowerCase();

      let charsetMatches =
        charsetName === modeName || cs.aliases.includes(modeName);
      let variantMatches =
        variantName === modeVariant || variant.aliases.includes(modeVariant);

      if (charsetMatches && variantMatches) {
        selectedCharset = variant.charset;
        break outerLoop;
      }
    }
  }

  if (selectedCharset === null) {
    console.error("Charset not found.");
    return null;
  }

  let newStr = "";

  for (var i = 0; i < text.length; i++) {
    var c = text.charAt(i);
    var newChar = c;

    if (reDigits.test(c)) {
      if ("numeric" in selectedCharset) {
        let idx = reference["numeric"].indexOf(c);
        if (
          idx > -1 &&
          idx in selectedCharset["numeric"] &&
          selectedCharset["numeric"][idx] != ""
        )
          newChar = selectedCharset["numeric"][idx];
      }
    } else if (reAlpha.test(c)) {
      if ("alpha" in selectedCharset) {
        let idx = reference["alpha"].indexOf(c);
        if (
          idx > -1 &&
          idx in selectedCharset["alpha"] &&
          selectedCharset["alpha"][idx] != ""
        )
          newChar = selectedCharset["alpha"][idx];
      }
    } else if (rePunc.test(c)) {
      if ("punctuation" in selectedCharset) {
        let idx = reference["punctuation"].indexOf(c);
        if (
          idx > -1 &&
          idx in selectedCharset["punctuation"] &&
          selectedCharset["punctuation"][idx] != ""
        )
          newChar = selectedCharset["punctuation"][idx];
      }
    }

    newStr += newChar;
  }

  return newStr;
}

//** Module Exports

module.exports = {
  help: help,
  commandHandlers: commandHandlers,
};

let scriptName = __filename.split(/[\\/]/).pop().split(".").shift();
console.info(`${scriptName} module loaded.`);
