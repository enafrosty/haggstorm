import axios from "axios";
import { Client } from "fca-utils";
import { Configuration, OpenAIApi } from "openai";
import { ChatGPTAPI } from 'chatgpt';
import fetch from 'node-fetch'; // import node-fetch for polyfill

const config = new Configuration({
    apiKey: process.env.OPENAI_KEY
});

const openai = new OpenAIApi(config);

const client = new Client({
    prefix: process.env.PREFIX,
    ignoreMessageInCommandEvent: true
});

const options = {
    method: 'GET',
    url: 'https://officeapi.akashrajpurohit.com/quote/random',
    headers: {'Content-Type': 'application/json'}
};

client.openServer(process.env.PORT);
client.loginWithAppState(process.env.APPSTATE);
client.on('ready', (_, bid) => console.log("Logged in as", bid, `[${process.env.PREFIX}]`));

client.on('command', (command) => {
    if (command.name === "create") {
        openai.createImage({
            prompt: command.commandArgs.join(" "),
            size: "512x512",
            response_format: "url"
        })
        .then(res => {
            command.message.sendAttachment(res.data.data[0].url);
        })
        .catch(e => {
            console.error(e.response.data);
            command.message.reply("An error occurred!");
        });
    }
    else if (command.name === "theoffice") {
        axios.request(options).then(function (response) {
            command.message.reply(response.data.quote + " - " + response.data.character);
          }).catch(function (error) {
            console.error(error);
          });
    }
    else if (command.name === "ask") {
        const api = new ChatGPTAPI({
            apiKey: process.env.OPENAI_KEY,
            fetch: fetch // provide the fetch polyfill
        });

        const message = command.commandArgs.join(' ');

        api.sendMessage(message)
            .then((response) => {
                command.message.reply(response.text);
            })
            .catch((error) => {
                console.error(error);
                command.message.reply('An error occurred.');
            });
    }
    else if (command.name === "reaction") {
        // Send the video.mp4 file as an attachment
        command.message.sendAttachment("./video.mp4");
    }
});

client.on('err', (e) => {
    console.error("login error");
    console.error(e);
});
