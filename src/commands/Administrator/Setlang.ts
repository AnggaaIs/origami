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
import CommandContext from "@origami/classes/CommandContext";
import { EMOJIS } from "@origami/classes/Constants";
import GuildService from "@origami/database/services/Guild";
import { toTitleCase } from "@origami/util";
import { Message } from "discord.js";

export default class Setlang extends Command {
  public guildService: GuildService = new GuildService();

  constructor(client: Client) {
    super(client, {
      category: "Administrator",
      cooldown: 20,
      name: "setlang",
      options: [
        {
          choices: [
            {
              name: "English",
              value: "en-US",
            },
            {
              name: "Indonesian",
              value: "id-ID",
            },
          ],
          description: "Enter language.",
          name: "language",
          required: true,
          type: 3,
        },
      ],
      usage: "setlang <lang>",
      userPerms: ["Administrator"],
    });
  }

  async run(ctx: CommandContext): Promise<void | Message> {
    if (!ctx.interaction.isChatInputCommand()) return;
    const value = ctx.interaction.options.getString("language");
    let language: string;
    if (value === "id-ID") language = "indonesian";
    else if (value === "en-US") language = "english";

    const Guild = await this.guildService.find(ctx.interaction.guild.id);
    if (Guild.locale === value)
      return ctx.reply(
        `${EMOJIS.no} | ${ctx.locale("commands:setlang.same_lang")}`,
        true,
      );

    await Guild.updateOne({
      locale: value,
    });

    ctx.reply(
      `${EMOJIS.yes} | ${ctx.locale("commands:setlang.success_set_lang", {
        lang: toTitleCase(language.toLowerCase()),
      })}`,
    );
  }
}
