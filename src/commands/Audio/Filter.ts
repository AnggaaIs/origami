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
import { Message } from "discord.js";

export default class Filter extends Command {
  constructor(client: Client) {
    super(client, {
      category: "Audio",
      cooldown: 7,
      name: "filter",
      options: [
        {
          description: "Set filter",
          name: "set",
          options: [
            {
              description: "Set audio filter to nightcore",
              name: "nightcore",
              type: 1,
            },
            {
              description: "Set audio filter to 8d",
              name: "8d",
              type: 1,
            },
          ],
          type: 2,
        },
        {
          description: "Reset all filters",
          name: "reset_all",
          type: 1,
        },
      ],
      usage: "filter <set|reset_all> [filterName] [value]",
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    if (!ctx.interaction.isChatInputCommand()) return;
    const subCommand = ctx.interaction.options.getSubcommand();
    const manager = this.client.lavalink.manager.players.get(
      ctx.interaction.guild.id,
    );

    const { channel } = ctx.interaction.guild.members.cache.get(
      ctx.interaction.user.id,
    ).voice;
    
    if (!channel)
      return ctx.reply(
        `${EMOJIS.no} | ${ctx.locale("global:MUSIC.not_voice")}`,
        true,
      );

    if (!manager)
      return ctx.reply(
        `${EMOJIS.no} | ${ctx.locale("global:MUSIC.not_playing")}`,
        true,
      );
      
    const voiceChannel = this.client.guilds.cache
      .get(ctx.interaction.guild.id)
      .channels.cache.get(manager.voiceChannel);
    

    if (manager) {
      if (channel.id !== manager.voiceChannel) {
        return ctx.reply(
          `${EMOJIS.no} | ${ctx.locale("global:MUSIC.not_voice_same", {
            vc: voiceChannel.name,
          })}`,
          true,
        );
      }
    }

    if (subCommand.toLowerCase() === "nightcore") {
      const nightcoreStatus = manager.nightcore;

      const status = nightcoreStatus ? "Off" : "On";
      const nameFilter = "Nightcore";
      ctx.reply(
        `${EMOJIS.yes} | ${ctx.locale("commands:filter.success_set", {
          nameFilter,
          status,
        })}`,
      );

      manager.setNightcore(!nightcoreStatus);
    } else if (subCommand.toLowerCase() === "8d") {
      const _8DStatus = manager._8d;

      const status = _8DStatus ? "Off" : "On";
      const nameFilter = "8D";
      ctx.reply(
        `${EMOJIS.yes} | ${ctx.locale("commands:filter.success_set", {
          nameFilter,
          status,
        })}`,
      );

      manager.set8D(!_8DStatus);
    }

    if (subCommand.toLowerCase() === "reset_all") {
      const _8DFilter = manager._8d;
      const nightcoreFilter = manager.nightcore;

      if (_8DFilter === false && nightcoreFilter === false)
        return ctx.reply(
          `${EMOJIS.no} | ${ctx.locale("commands:filter.no_filter")}`,
          true,
        );

      manager.resetFilters();
      return ctx.reply(
        `${EMOJIS.yes} | ${ctx.locale("commands:filter.success_reset")}`,
      );
    }
  }
}
