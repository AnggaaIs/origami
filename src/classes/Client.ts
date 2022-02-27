/**
 * Copyright (c) 2021 Origami
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import "@origami/classes/extenders";
import Lavalink from "@origami/classes/Lavalink";
import Logger from "@origami/classes/Logger";
import Manager from "@origami/classes/Manager";
import mongoConnect from "@origami/database/Connection";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import {
  Client,
  ClientOptions,
  Collection,
  Snowflake,
  version,
} from "discord.js";
import chalk from "chalk";
import figlet from "figlet";
import i18next from "i18next";
import mongoose from "mongoose";
import Spinnies from "spinnies";
import packageJson from "../../package.json";

export default class BotClient extends Client {
  public config = require("../../config.json");

  public log = new Logger();

  public manager = new Manager(this);

  public lavalink = new Lavalink(this);

  public cooldowns: Collection<string, Collection<Snowflake, number>> =
    new Collection();

  constructor(options?: ClientOptions) {
    super(options);
  }

  async start(): Promise<void> {
    const spinnies = new Spinnies();
    try {
      /* Handle starting bot */
      figlet.text(this.config.bot_name, async (err, data) => {
        const { red } = chalk;

        const pkgErelaVersion = packageJson.dependencies["erela.js"].replace(
          "^",
          "",
        );
        const tsVersion = packageJson.devDependencies.typescript.replace(
          "^",
          "",
        );

        console.log(`${data}
  
  ${red("Version:")}    v${packageJson.version}
  ${red("Node.Js:")}    ${process.version}
  ${red("Typescript")}  v${tsVersion}
  ${red("Discord.js:")} v${version}
  ${red("Erela.js:")}   v${pkgErelaVersion},
  ${red("Shard:")}      #${this.shard.ids[0]}
  `);
        spinnies.add("firstSpinner", {
          indent: 2,
          text: "Setting up bot",
        });

        setTimeout(() => {
          spinnies.update("firstSpinner", {
            status: "spinning",
            text: "Connecting to database",
          });

          // Database init here!
          mongoConnect(spinnies);
        }, 1500);
      });

      mongoose.connection.on("open", async () => {
        /* Login */
        await this.login(this.config.bot_token);

        /* Load manager */
        this.manager.load(spinnies);

        /* Handle register slash cmd and spinner */
        this.on("ready", async () => {
          this.registerSlashCommands();
          spinnies.update("firstSpinner", {
            status: "succeed",
            succeedColor: "white",
            text: `Alright, ${this.user.tag} is ready to go!`,
          });
        });
      });
    } catch (e) {
      spinnies.update("firstSpinner", {
        failColor: "white",
        status: "fail",
        text: `Failed to start the bot! ${e.stack}`,
      });
      process.exit(1);
    }
  }

  async registerSlashCommands(): Promise<void> {
    try {
      const { commands } = this.manager;
      const arrayCmd: any[] = [];
      commands.forEach(async (cmd) => {
        const locale = i18next.getFixedT("en-US");

        const options = {
          description: locale(`commands:${cmd.name}.description`),
          name: cmd.name,
          options: cmd.options || [],
        };

        arrayCmd.push(options);
      });
      const rest = new REST({
        version: "9",
      }).setToken(this.config.bot_token);

      await rest.put(Routes.applicationCommands(this.user.id), {
        body: arrayCmd,
      });
    } catch (e) {
      this.log.error(e.stack);
    }
  }
}
