module.exports = {
  config: {
    name: "bal",
    aliases: ["money", "balance", "cash"],
    version: "2.0.0",
    author: "Mr.King",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Check balance with World Economy format" },
    category: "economy",
    guide: { en: "{pn} or {pn} @tag" }
  },

  onStart: async function ({ api, event, usersData, args, message }) {
    const { senderID, mentions } = event;

    // 1. Identify Target (Tagged user or sender)
    const targetID = Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;

    try {
      const userData = await usersData.get(targetID);
      const money = userData.money || 0;
      const name = await usersData.getName(targetID);

      // 2. Format money to World Economy (K, M, B, T)
      const formattedMoney = formatWorldEconomy(money);

      return message.reply(
        `>🎀 ( ${name} )\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `• 𝐁𝐚𝐛𝐲, ${targetID === senderID ? '𝐘𝐨𝐮' : name} 𝐇𝐚𝐯𝐞\n` +
        `• 💸 $${formattedMoney}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `• 𝐊𝐞𝐞𝐩 𝐢𝐭 𝐮𝐩 𝐛𝐛𝐲🐉 [ 💛 | 💛 | 💛 ]`
      );
    } catch (err) {
      console.error(err);
      return message.reply("❌ | 𝐁𝐚𝐛𝐲, 𝐈 𝐜𝐨𝐮𝐥𝐝𝐧'𝐭 𝐟𝐞𝐭𝐜𝐡 𝐭𝐡𝐞 𝐛𝐚𝐥𝐚𝐧𝐜𝐞!");
    }
  }
};

/**
 * Converts numbers to World Economy format (K, M, B, T)
 *
 */
function formatWorldEconomy(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"; // Trillion
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";   // Billion
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";   // Million
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";   // Thousand
  return num.toLocaleString(); // Standard formatting for small amounts
}