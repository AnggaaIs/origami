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
import { Embed, Message } from "discord.js";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default class Shard extends Command {
  constructor(client: Client) {
    super(client, {
      category: "Information",
      cooldown: 5,
      name: "shard",
    });
  }

  async getShardsInfo(): Promise<any> {
    const guilds = await this.client.shard.fetchClientValues(
      "guilds.cache.size",
    );
    const users = await this.client.shard.fetchClientValues("users.cache.size");
    const guildsCounts = guilds.reduce((a: number, b: number) => a + b);
    const usersCounts = users.reduce((a: number, b: number) => a + b);

    const shardsInfo = await this.client.shard.broadcastEval((client) => [
      client.shard.ids[0],
      client.ws.ping,
      client.guilds.cache.size,
      client.users.cache.size,
      client.channels.cache.size,
      process.memoryUsage().heapUsed / 1024 / 1024,
    ]);

    return {
      guildsCounts,
      shardsInfo,
      usersCounts,
    };
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    const { guildsCounts, shardsInfo, usersCounts } =
      await this.getShardsInfo();

    const embed = new Embed()
      .setTitle(ctx.locale("commands:shard.title"))
      .setColor(COLORS.general)
      .setTimestamp();
    shardsInfo.forEach((shrd) => {
      const embedValue = ctx.locale("commands:shard.value", {
        channels: shrd[4],
        guilds: shrd[2],
        memory: Math.round(shrd[5]),
        users: shrd[3],
        ws: Math.round(shrd[1]),
      });

      embed.addField({
        name: ctx.locale(
          `commands:shard.title_info${
            this.client.shard.ids.includes(shrd[0]) ? "_current" : ""
          }`,
          {
            id: shrd[0] + 1,
            status: shrd[1] > 1 ? EMOJIS.yes : EMOJIS.no,
          },
        ),
        value: `\`\`\`${embedValue}\`\`\``,
      });
    });

    ctx.reply({
      embeds: [embed],
    });
  }
}
