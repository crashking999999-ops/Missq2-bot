module.exports = {
  config: {
    name: "send",
    aliases: ["pay", "give"],
    version: "2.0.0",
    author: "Mr.King",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Send money to another user" },
    category: "💰 Economy",
    guide: { en: "{pn} [amount] (Reply or Mention)" }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID, messageReply, mentions } = event;

    // 1. Styling
    const header = `>🎀 ( 𝐌𝐢𝐬𝐬 𝐐𝐮𝐞𝐞𝐧 𝐁𝐚𝐧𝐤 🏦 )\n━━━━━━━━━━━━━━━━━━\n`;
    const footer = `\n━━━━━━━━━━━━━━━━━━\n• 𝐊𝐞𝐞𝐩 𝐠𝐫𝐢𝐧𝐝𝐢𝐧𝐠 𝐛𝐛𝐲🐉 [ 💛 | 💛 | 💛 ]`;

    // 2. Identify Receiver (Reply or Mention)
    let receiverID;
    if (messageReply) {
      receiverID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      receiverID = Object.keys(mentions)[0];
    } else {
      return message.reply(`${header}⚠️ | 𝐁𝐚𝐛𝐲, 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐨𝐫 𝐭𝐚𝐠 𝐬𝐨𝐦𝐞𝐨𝐧𝐞!${footer}`);
    }

    if (receiverID === senderID) return message.reply(`${header}❌ | 𝐁𝐚𝐛𝐲, 𝐲𝐨𝐮 𝐜𝐚𝐧'𝐭 𝐬𝐞𝐧𝐝 𝐦𝐨𝐧𝐞𝐲 𝐭𝐨 𝐲𝐨𝐮𝐫𝐬𝐞𝐥𝐟!${footer}`);

    // 3. Parse Amount (Supports K, M, B, T)
    const amountStr = args[0];
    if (!amountStr) return message.reply(`${header}⚠️ | 𝐄𝐧𝐭𝐞𝐫 𝐚𝐦𝐨𝐮𝐧𝐭! (𝐄𝐱: 𝟏𝟎𝐌)${footer}`);

    const amount = parseSmartAmount(amountStr);
    if (isNaN(amount) || amount <= 0) return message.reply(`${header}❌ | 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭, 𝐛𝐛𝐲!${footer}`);

    // 4. Balance Check & Transfer
    const senderData = await usersData.get(senderID);
    const receiverData = await usersData.get(receiverID);

    if (senderData.money < amount) {
      return message.reply(`${header}❌ | 𝐘𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐞𝐧𝐨𝐮𝐠𝐡 𝐦𝐨𝐧𝐞𝐲!\n💰 | 𝐘𝐨𝐮 𝐧𝐞𝐞𝐝: $${formatNumber(amount)}${footer}`);
    }

    try {
      // Atomic Update for Speed
      await usersData.set(senderID, { money: senderData.money - amount });
      await usersData.set(receiverID, { money: (receiverData.money || 0) + amount });

      const receiverName = await usersData.getName(receiverID);
      return message.reply(`${header}💸 | 𝐒𝐞𝐧𝐭 $${formatNumber(amount)} 𝐭𝐨 ${receiverName}!\n✨ | 𝐓𝐫𝐚𝐧𝐬𝐚𝐜𝐭𝐢𝐨𝐧 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥!${footer}`);
    } catch (err) {
      return message.reply("❌ | 𝐁𝐚𝐛𝐲, 𝐭𝐡𝐞 𝐛𝐚𝐧𝐤 𝐬𝐲𝐬𝐭𝐞𝐦 𝐢𝐬 𝐛𝐮𝐬𝐲!");
    }
  }
};

// --- Speed Math Helpers ---
function parseSmartAmount(str) {
  const units = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
  const match = str.toLowerCase().match(/^(\d+(?:\.\d+)?)([kmbt]?)$/);
  if (!match) return parseFloat(str);
  return parseFloat(match[1]) * (units[match[2]] || 1);
}

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toLocaleString();
}