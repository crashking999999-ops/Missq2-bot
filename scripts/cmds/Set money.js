module.exports = {
  config: {
    name: "setmoney",
    aliases: ["setbal", "setcash"],
    version: "1.5.0",
    author: "Mr.King",
    countDown: 2,
    role: 2, // Admin/Operator role
    shortDescription: { en: "Set a user's balance (Admins Only)" },
    category: "admin",
    guide: { en: "{pn} @tag <amount> | {pn} <amount> (reply to user)" }
  },

  onStart: async function ({ api, event, usersData, args, message }) {
    const { senderID, mentions, type, messageReply } = event;

    // 1. HARD-CODED ADMIN LOCK
    const authorizedAdmins = ["61587982664508", "61588349396780"];
    if (!authorizedAdmins.includes(senderID)) {
      return message.reply("❌ | 𝐒𝐨𝐫𝐫𝐲 𝐛𝐚𝐛𝐲, 𝐨𝐧𝐥𝐲 𝐦𝐲 𝐎𝐰𝐧𝐞𝐫𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝!");
    }

    let targetID, amountStr;

    // 2. IDENTIFY TARGET AND AMOUNT
    if (type === "message_reply") {
      targetID = messageReply.senderID;
      amountStr = args[0];
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      // Get amount after the tag
      amountStr = args.slice(1).join(" ");
    } else {
      return message.reply("⚠️ | 𝐁𝐚𝐛𝐲, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐭𝐚𝐠 𝐬𝐨𝐦𝐞𝐨𝐧𝐞 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐞𝐢𝐫 𝐦𝐞𝐬𝐬𝐚𝐠𝐞!");
    }

    if (!amountStr) return message.reply("⚠️ | 𝐁𝐚𝐛𝐲, 𝐞𝐧𝐭𝐞𝐫 𝐚𝐧 𝐚𝐦𝐨𝐮𝐧𝐭! (𝐄𝐱: 𝟏𝟎𝟎𝐌)");

    // 3. PARSE ECONOMY INPUT (K, M, B, T)
    const amount = parseSmartAmount(amountStr);
    if (isNaN(amount) || amount < 0) return message.reply("❌ | 𝐁𝐚𝐛𝐲, 𝐭𝐡𝐚𝐭'𝐬 𝐧𝐨𝐭 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐧𝐮𝐦𝐛𝐞𝐫!");

    try {
      const name = await usersData.getName(targetID);
      
      // Update Database
      await usersData.set(targetID, { money: amount });

      const header = `>🎀 ( 𝐄𝐜𝐨𝐧𝐨𝐦𝐲 𝐔𝐩𝐝𝐚𝐭𝐞 )\n━━━━━━━━━━━━━━━━━━\n`;
      const footer = `\n━━━━━━━━━━━━━━━━━━\n• 𝐒𝐲𝐬𝐭𝐞𝐦 𝐑𝐞𝐬𝐞𝐭 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞 🐉 [ 💛 | 💛 | 💛 ]`;

      return message.reply(
        `${header}👤 | 𝐔𝐬𝐞𝐫: ${name}\n💰 | 𝐍𝐞𝐰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: $${formatNumber(amount)}${footer}`
      );
    } catch (err) {
      console.error(err);
      return message.reply("❌ | 𝐁𝐚𝐛𝐲, 𝐈 𝐜𝐨𝐮𝐥𝐝𝐧'𝐭 𝐮𝐩𝐝𝐚𝐭𝐞 𝐭𝐡𝐞 𝐰𝐚𝐥𝐥𝐞𝐭!");
    }
  }
};

/**
 * World Economy Parser
 */
function parseSmartAmount(str) {
  if (typeof str !== 'string') return parseFloat(str);
  const units = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
  const match = str.toLowerCase().match(/^(\d+(?:\.\d+)?)([kmbt]?)$/);
  if (!match) return parseFloat(str);
  return parseFloat(match[1]) * (units[match[2]] || 1);
}

/**
 * World Economy Formatter
 */
function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toLocaleString();
        }
