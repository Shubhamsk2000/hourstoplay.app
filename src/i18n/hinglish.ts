import en, { type Dict } from "./en";

// Hinglish flavour: same shape as English, desi punchlines. Used as a toggle on India pages.
const hi: Dict = {
  ...en,
  langName: "Hinglish",
  hero: {
    kicker: "GTA 6 aa gaya · PS5 & Xbox Series X|S",
    h1: "GTA 6 tumhari zindagi ke kitne ghante lega?",
    sub: "Apni salary daalo. Hum batayenge GTA 6 + console mein {country} mein kitni zindagi jaayegi.",
  },
  form: {
    ...en.form,
    pay: "Tumhari in-hand salary",
    period: { ...en.form.period, stipend: "stipend / mahina", pocket: "pocket money / hafta" },
    orJob: "Ya typical salary use karo",
    own: "Console already hai bhai",
    go: "Calculate karo",
    name: "Card pe naam (optional)",
  },
  result: {
    ...en.result,
    hoursOfLife: "ghante zindagi ke",
    weeksOfPocket: "hafte ki pocket money",
    total: "Total nuksaan",
    stamps: ["PAISA HI PAISA", "MAST HAI", "MEHNAT KARO", "KADKA", "KHATAM!"],
    ranks: [
      { title: "Vice City ka Seth", quip: "Lunch break mein khareed loge. Show-off." },
      { title: "Beach ka Bhai", quip: "Kuch din ki mehnat. Respect." },
      { title: "Jugaadu Hustler", quip: "Kuch hafte ka kaam. Beach bula raha hai." },
      { title: "Garib par Ziddi", quip: "Mahino ki mehnat. Legend aise hi bante hain." },
      { title: "GTA 5 hi khel le bhai", quip: "Is speed se toh GTA 7 pehle aa jayega." },
    ],
    playDate: "{date} tak khel rahe hoge, agar poori salary bachao",
    save: "Ya 3 mahine tak roz {money} bachao",
    workDays: "{n} poore working days",
  },
  items: {
    ...en.items,
    chai: "cutting chai",
    biryani: "plate biryani",
    maggi: "packet Maggi",
    samosa: "samose",
    zomato: "food delivery orders",
    metro: "metro rides",
  },
  share: {
    ...en.share,
    title: "Result share karo",
    caption: "GTA 6 mujhe {h} ghante ki zindagi mein padega ({title} {stars}). Tumhara kitna? 👉",
    challengeCaption: "Mujhe GTA 6 ke liye {h} ghante kaam karna padega. Beat karke dikhao 😤 👉",
  },
  challenge: {
    ...en.challenge,
    banner: "{name} ko GTA 6 ke liye {h} ghante kaam karna padega",
    cta: "Beat kar sakte ho? Salary daalo 👇",
    youWin: "Jeet gaye! {name} se {d} ghante kam 🏆",
    youLose: "Oof. {name} se {d} ghante zyada 💀",
    tie: "{name} ke saath barabar. Rematch?",
  },
  fun: {
    ...en.fun,
    tabs: { ...en.fun.tabs, parents: "Papa ko manao", excuse: "Chhutti ka bahana" },
    parents: {
      ...en.fun.parents,
      letter:
        "Papa, Mummy 🙏\n\nGTA 6 + console sirf {daily} roz ka hai, bas 3 mahine. Itna toh {k} {item} mein chala jaata hai!\n\nPromise, padhai bhi karunga. Ye basically meri hand–eye coordination aur career mein investment hai. Sharma ji ka beta bhi le raha hai.\n\nAapka pyaara,\n{name} 🙏",
      you: "Aapka laadla",
    },
    squad: { ...en.fun.squad, fine: "Fine print: remote ke liye ladai pakki hai." },
    excuse: {
      ...en.fun.excuse,
      list: [
        "Sir, ghar pe pooja hai. (Pooja GTA ki hai.)",
        "Sir, laptop update ho gaya, ab sirf 'chhutti mode' mein chalta hai.",
        "Sir, cousin ki shaadi hai. Cousin ka naam Vice City hai.",
        "Sir, tabiyat kharab hai. Doctor ne bola 'ek mission aur' mat karna.",
        "Sir, internet chala gaya. Sirf office ke kaam ke liye.",
        "Sir, traffic mein phasa hoon. Virtual traffic. Bahut heavy.",
        "Sir, dadi aayi hain, unko beach dikhana hai. Digital wala.",
        "Sir, WFH kar raha hoon. 'Work' thoda strong word hai.",
      ],
    },
    roast: {
      ...en.fun.roast,
      byRank: [
        ["Tumhari salary dekh ke landlord rent badha dega.", "Tumhare liye GTA 6 = humare liye ek Parle-G.", "Bhai party kab de raha hai?"],
        ["Game install hone se pehle paisa wapas.", "Comfortable. Thoda zyada hi comfortable.", "Ameer nahi, par bank app dekh ke rote bhi nahi."],
        ["Ek mahina overtime aur done. Boss khush.", "Tab tak sab ending spoil kar chuke honge.", "Beech wale. Sabse relatable stars."],
        ["Tumhara wallet witness protection mein hai.", "Jab tak afford karoge, sale aa jayegi. Big brain?", "Tum is game ki sabse zyada kadar karoge."],
        ["GTA 5 abhi bhi mast game hai. Bas bol raha hoon.", "Savings account pe 5-star wanted level hai.", "Ameer dost ka stream dekh lo. Free hai."],
      ],
    },
  },
  footer: {
    ...en.footer,
    privacy: "Tumhari salary phone se bahar nahi jaati. Sab kuch browser mein calculate hota hai.",
  },
};

export default hi;
