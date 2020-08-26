const Telegraf = require("telegraf");
const Bot_Token = process.env.Bot_Token;
const app = new Telegraf(Bot_Token);
const axios = require("axios");

const pexelKey = process.env.pexelKey;
const unsplashKey = process.env.unsplashKey;

app.start(ctx => {
  console.log(ctx.message.from);
  if (ctx.message.from.username !== undefined) {
    ctx.reply(
      `Welcome ${ctx.message.from.username} You can Search HD images from here`
    );
  } else if (ctx.message.from.first_name !== undefined) {
    ctx.reply(
      `Welcome ${ctx.message.from.first_name} ${
      ctx.message.from.last_name
      } You can Search HD images from here`
    );
  } else {
    ctx.reply(
      `Welcome ${ctx.message.from.id} You can Search HD images from here`
    );
  }
});

const fetchImages = async (text) => {
  try {
    const { data: { photos } } = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURI(text)}&per_page=10`, {
      headers: { Authorization: pexelKey }
    }).catch(() => []);
    if (photos.length > 0) {
      return photos.map(({ src }) => ({ media: src?.landscape, caption: "Pexel", type: "photo" }));
    } else {
      const { data: { results } } = await axios.get(`https://api.unsplash.com/search/photos?query=${encodeURI(text)}`, {
        headers: { Authorization: `Client-ID ${unsplashKey}` }
      })
      return results.map(({ urls }) => ({ media: urls?.regular, caption: "Unsplash", type: "photo" }));
    }
  } catch (e) {
    throw e;
  }
}

app.on("text", async (ctx) => {
  try {
    ctx.replyWithMarkdown("⌛️ please wait It will take few seconds to grab Images");
    const photos = await fetchImages(ctx.message.text);
    photos.length > 0 ? ctx.replyWithMediaGroup(photos) : ctx.reply("Sorry Image not found :(");
  } catch (e) {
    console.log(e);
    ctx.reply("Please try after sometime PexelsPlash is down :(")
  }
});

app.startPolling();
