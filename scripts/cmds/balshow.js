module.exports = {
  config: {
    name: "bal",
    aliases: ["balshow", "money", "cash"],
    version: "1.0.5",
    author: "Mr. King",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show balance of yourself or others with World Economy" },
    category: "economy",
    guide: { en: "{pn} | {pn} @tag | reply with {pn}" }
  },

  onStart: async function ({ api, event, usersData, args, message }) {
    const { senderID, mentions, type, messageReply } = event;

    let targetID;

    // 1. Logic for Target Identification
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } 
    else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } 
    else {
      targetID = senderID;
    }

    try {
      const userData = await usersData.get(targetID);
      const money = userData.money || 0;
      const name = await usersData.getName(targetID);

      // 2. World Economy Formatting
      const formattedMoney = formatWorldEconomy(money);

      return message.reply(
        `>🎀\n` +
        `• 𝐁𝐚𝐛𝐲, ${name} 𝐇𝐚𝐯𝐞 $${formattedMoney}\n` +
        `• 𝐊𝐞𝐞𝐩 𝐢𝐭 𝐮𝐩 𝐛𝐛𝐲🐉 [ 💛 | 💛 | 💛 ]`
      );
    } catch (err) {
      console.error(err);
      return message.reply("❌ | 𝐁𝐚𝐛𝐲, I couldn't find that person's wallet!");
    }
  }
};

/**
 * World Economy Parser
 * Converts raw numbers to K, M, B, T formats
 */
function formatWorldEconomy(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"; // Trillion
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";   // Billion
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";   // Million
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";   // Thousand
  return num.toLocaleString(); 
}