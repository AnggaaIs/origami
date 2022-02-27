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

import Client from "@origami/classes/Client";
import Command from "@origami/classes/Command";
import { Collection } from "discord.js";
import { readdirSync } from "fs";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { join, resolve } from "path";
const fileType = /\.(ts|js)$/i;

export default class Manager {
  public commands: Collection<string, Command> = new Collection();

  /* eslint-disable @typescript-eslint/no-unused-vars */
  constructor(private client: Client) {}

  async loadEvents(spinnies: any): Promise<void> {
    try {
      const files = readdirSync(join(__dirname, "..", "..", "src", "events"), {
        withFileTypes: true,
      });

      if (!files) return;

      files.forEach((evt) => {
        if (!fileType.test(evt.name)) return;

        const EventImport = require(`@origami/events/${evt.name}`).default;

        const Event = new EventImport(this.client);

        this.client.on(Event.name, (...params) => Event.run(...params));
      });

      // this.client.log.info("Events successfully load.");
    } catch (e) {
      spinnies.update("firstSpinner", {
        failColor: "white",
        status: "fail",
        text: `Failed to load events ${e}`,
      });
      process.exit(1);
    }
  }

  async loadCommands(spinnies: any): Promise<void> {
    try {
      const folder = readdirSync(
        join(__dirname, "..", "..", "src", "commands"),
      );

      folder.forEach((file) => {
        const cmds = readdirSync(
          join(__dirname, "..", "..", "src", "commands", file),
          {
            withFileTypes: true,
          },
        );

        cmds.forEach((cmd) => {
          if (!fileType.test(cmd.name)) return;

          const commandImport =
            require(`@origami/commands/${file}/${cmd.name}`).default;

          const Command = new commandImport(this.client);
          this.commands.set(Command.name, Command);
        });
      });
    } catch (e) {
      spinnies.update("firstSpinner", {
        failColor: "white",
        status: "fail",
        text: `Failed to load commands ${e}`,
      });
      process.exit(1);
    }
  }

  async loadLocales(spinnies: any): Promise<void> {
    try {
      const nss: string[] = ["commands", "global"];
      const path = resolve(__dirname, "..", "..", "src", "locales");

      await i18next.use(Backend).init({
        backend: {
          loadPath: resolve(__dirname, "../../src/locales/{{lng}}/{{ns}}.json"),
        },
        fallbackLng: "en-US",
        initImmediate: false,
        interpolation: {
          escapeValue: false,
        },
        ns: nss,
        preload: readdirSync(path),
        returnEmptyString: false,
      });

      // this.client.log.info("i18n successfully load.");
    } catch (e) {
      spinnies.update("firstSpinner", {
        failColor: "white",
        status: "fail",
        text: `Failed to load i18n ${e}`,
      });
      process.exit(1);
    }
  }

  async getLocale(lang: string): Promise<any> {
    return i18next.getFixedT(lang);
  }

  getCommand(name: string): Command {
    const command: Command = this.client.manager.commands.get(name);
    return command;
  }

  load(spinnies: any): void {
    spinnies.update("firstSpinner", {
      indent: 2,
      status: "spinning",
      text: "Setting up events, commands, locales",
    });

    this.loadEvents(spinnies);
    this.loadCommands(spinnies);
    this.loadLocales(spinnies);
  }
}
