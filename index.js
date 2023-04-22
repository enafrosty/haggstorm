import axios from "axios";
import { Client } from "fca-utils";
import { Configuration, OpenAIApi } from "openai";

const config = new Configuration({
    apiKey: process.env.OPENAI_KEY
})

const openai = new OpenAIApi(config);

const client = new Client({
    prefix: process.env.PREFIX,
    ignoreMessageInCommandEvent: true
})

client.openServer(process.env.PORT);
client.loginWithAppState(process.env.APPSTATE);
client.on('ready', (_, bid) => console.log("Logged in as", bid, `[${process.env.PREFIX}]`));

client.on('command', (command) => {


    if (command.name === "create") {
        openai.createImage({
            prompt: command.commandArgs.join(" "),
            size: "512x512",
            response_format: "url"
        }).then(res => {
            command.message.sendAttachment(res.data.data[0].url);
        }).catch(e => {
            console.error(e.response.data);
            command.message.reply("An error occurred!")
        })
    }
})

client.on('error', (e) => {
    console.error("login error");
    console.error(e);
})
