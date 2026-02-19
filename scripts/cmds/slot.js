module.exports = {
  config: {
    name: "slot",
    version: "4.5.0",
    author: "Mr.King",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Slots with hidden counter and 400M daily reward" },
    category: "Game",
  },

  onStart: async function ({ args, api, event, usersData, message }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const money = userData.money || 0;
    const name = await usersData.getName(senderID);

    // 1. Economy Parsing
    const betInput = args[0];
    if (!betInput) return message.reply(">🎀 ( 𝐒𝐥𝐨𝐭 𝐌𝐚𝐜𝐡𝐢𝐧𝐞 )\n━━━━━━━━━━━━━━━━━━\n⚠️ | 𝐁𝐚𝐛𝐲, 𝐞𝐧𝐭𝐞𝐫 𝐚𝐧 𝐚𝐦𝐨𝐮𝐧𝐭! (𝐄𝐱: 𝟏𝐌)");

    const betAmount = parseSmartAmount(betInput);

    // 2. Bet Limit Check (200M)
    const maxBet = 200000000;
    if (isNaN(betAmount) || betAmount <= 0) return message.reply("⚠️ | 𝐁𝐚𝐛𝐲, 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭!");
    if (betAmount > maxBet) return message.reply(`❌ | 𝐁𝐚𝐛𝐲, 𝐭𝐡𝐞 𝐦𝐚𝐱𝐢𝐦𝐮𝐦 𝐬𝐥𝐨𝐭 𝐥𝐢𝐦𝐢𝐭 𝐢𝐬 $${formatNumber(maxBet)}!`);
    if (betAmount > money) return message.reply(`❌ | 𝐁𝐚𝐛𝐲, 𝐲𝐨𝐮 𝐨𝐧𝐥𝐲 𝐡𝐚𝐯𝐞 $${formatNumber(money)}!`);

    // 3. Hidden Daily Limit Logic
    const today = new Date().toISOString().slice(0, 10);
    let slotLimit = userData.slotLimit || { date: today, count: 0 };

    if (slotLimit.date !== today) {
      slotLimit = { date: today, count: 0 };
    }

    // Stop command if user reached 800 spins
    if (slotLimit.count >= 800) {
      return message.reply(">🎀 ( 𝐋𝐢𝐦𝐢𝐭 𝐑𝐞𝐚𝐜𝐡𝐞𝐝 )\n━━━━━━━━━━━━━━━━━━\n🚫 | 𝐁𝐚𝐛𝐲, 𝐲𝐨𝐮 𝐡𝐚𝐯𝐞 𝐟𝐢𝐧𝐢𝐬𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝟖𝟎𝟎 𝐬𝐩𝐢𝐧𝐬!\n✨ | 𝐒𝐥𝐨𝐭 𝐢𝐬 𝐧𝐨𝐰 𝐜𝐥𝐨𝐬𝐞𝐝 𝐟𝐨𝐫 𝐲𝐨𝐮 𝐮𝐧𝐭𝐢𝐥 𝐭𝐨𝐦𝐨𝐫𝐫𝐨𝐰.");
    }

    // 4. Slot Logic (65% Win Rate)
    const isWin = Math.random() < 0.65;
    const slots = ["🍒", "💎", "⭐", "💰", "👑", "🍀"];
    let s1, s2, s3, balanceChange;

    if (isWin) {
      const winSymbol = slots[Math.floor(Math.random() * slots.length)];
      s1 = s2 = s3 = winSymbol;
      balanceChange = betAmount; // 2x Payout
    } else {
      s1 = slots[Math.floor(Math.random() * slots.length)];
      s2 = slots[Math.floor(Math.random() * slots.length)];
      s3 = slots[Math.floor(Math.random() * slots.length)];
      if (s1 === s2 && s2 === s3) s3 = "💔"; 
      balanceChange = -betAmount;
    }

    // 5. 800th Spin Special Reward
    const newSpinCount = slotLimit.count + 1;
    let rewardText = "";
    let finalBalanceChange = balanceChange;

    if (newSpinCount === 800) {
      const rewardAmount = 400000000; // 400M
      finalBalanceChange += rewardAmount;
      rewardText = `\n🎁 | 𝐒𝐏𝐄𝐂𝐈𝐀𝐋 𝐑𝐄𝐖𝐀𝐑𝐃: $${formatNumber(rewardAmount)} 𝐚𝐝𝐝𝐞𝐝!`;
    }

    // 6. Silent Update to Database
    await usersData.set(senderID, { 
      money: money + finalBalanceChange,
      slotLimit: { date: today, count: newSpinCount }
    });

    const header = `>🎀 ( ${name} )\n━━━━━━━━━━━━━━━━━━\n`;
    const footer = `\n━━━━━━━━━━━━━━━━━━\n• 𝐄𝐧𝐣𝐨𝐲 𝐛𝐛𝐲🐉 [ 💛 | 💛 | 💛 ]`;

    if (isWin) {
      return message.reply(`${header}🏆 | 𝐘𝐨𝐮 𝐛𝐞𝐭: $${formatNumber(betAmount)}\n💰 | 𝐘𝐨𝐮 𝐰𝐨𝐧: $${formatNumber(betAmount * 2)} (2x)${rewardText}\n🎰 | [ ${s1} | ${s2} | ${s3} ]${footer}`);
    } else {
      return message.reply(`${header}💀 | 𝐘𝐨𝐮 𝐛𝐞𝐭: $${formatNumber(betAmount)}\n❌ | 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 everything!${rewardText}\n🎰 | [ ${s1} | ${s2} | ${s3} ]${footer}`);
    }
  }
};

function parseSmartAmount(str) {
  if (typeof str !== 'string') return parseFloat(str);
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