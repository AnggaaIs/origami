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

export default class Stop extends Command {
  constructor(client: Client) {
    super(client, {
      category: "Audio",
      clientPerms: ["CONNECT"],
      cooldown: 10,
      name: "stop",
      usage: "stop",
      userPerms: ["CONNECT", "SPEAK"],
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
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

    manager.destroy();
    return ctx.replyWithTime(
      `${EMOJIS.yes} | ${ctx.locale("commands:stop.success_stop")}`,
    );
  }
}
