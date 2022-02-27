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
import Event from "@origami/classes/Event";
import GuildService from "@origami/database/services/Guild";
import { Guild } from "discord.js";

export default class Ready extends Event {
  public client: Client;

  public guildService: GuildService = new GuildService();

  constructor(client: Client) {
    super(client, {
      name: "guildCreate",
    });
  }

  async run(guild: Guild): Promise<void> {
    await this.guildService.find(guild.id).then(async (data) => {
      if (!data) {
        await this.guildService.create(guild?.id);
        this.client.log.info(`${guild.name} Saved.`);
      }
    });
  }
}
