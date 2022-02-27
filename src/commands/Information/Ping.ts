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
import { Message } from "discord.js";

export default class Ping extends Command {
  constructor(client: Client) {
    super(client, {
      allowDm: true,
      category: "Information",
      cooldown: 5,
      name: "ping",
    });
  }

  async run(ctx: CommandContext): Promise<void | Message> {
    const apiPing = this.client.ws.ping;
    ctx.reply(
      `**Pong** 🏓 ${ctx.locale("commands:ping.ping_msg_info", {
        ping: apiPing,
      })}`,
    );
  }
}
