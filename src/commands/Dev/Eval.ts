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
import { COLORS, EMOJIS } from "@origami/classes/Constants";
import GuildService from "@origami/database/services/Guild";
import UserService from "@origami/database/services/User";
import { Message, UnsafeEmbed } from "discord.js";
import axios from "axios";
import { inspect } from "util";

/* eslint no-eval: "off" */
export default class EvalCommand extends Command {
  public guildService: GuildService = new GuildService();

  public userService: UserService = new UserService();

  constructor(client: Client) {
    super(client, {
      category: "Dev",
      dev: true,
      name: "eval",
      options: [
        {
          description: "Evaluated JavaScript code",
          name: "code",
          required: true,
          type: 3,
        },
      ],
      usage: "eval <code>",
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    if (!ctx.interaction.isChatInputCommand()) return;
    const args = ctx.interaction.options.getString("code");
    const embed = new UnsafeEmbed();
    try {
      const evaluated = eval(args);
      const result =
        typeof evaluated === "string" ? evaluated : inspect(evaluated);
      const resultFilter = result.replace(
        new RegExp(this.client.config.bot_token, "g"),
        "Token Hidden :)",
      );

      if (resultFilter.length > 1500) {
        const { data } = await axios.post<any>(
          "https://hastebin.com/documents",
          resultFilter,
        );

        ctx.reply(`${EMOJIS.yes} | https://hastebin.com/${data.key}`, true);
        return;
      }
      embed.setColor(COLORS.general);
      embed.setTitle(`${EMOJIS.yes} Evaled success`);
      embed.setDescription(`\`\`\`js\n${resultFilter}\`\`\``);
      embed.setTimestamp();
      return ctx.reply(
        {
          embeds: [embed],
        },
        true,
      );
    } catch (e) {
      embed.setColor(COLORS.red);
      embed.setTitle(`${EMOJIS.no} Evaled failed`);
      embed.setDescription(`\`\`\`js\n${e.stack}\`\`\``);
      embed.setTimestamp();
      return ctx.reply(
        {
          embeds: [embed],
        },
        true,
      );
    }
  }
}
