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
import Earthquake from "@origami/classes/Earthquake";
import Event from "@origami/classes/Event";

export default class Ready extends Event {
  public client: Client;

  public earthquake: Earthquake = new Earthquake(this.client);

  constructor(client: Client) {
    super(client, {
      name: "ready",
    });
  }

  async run(): Promise<void> {
    this.client.lavalink.manager.init(this.client.user.id);

    /* Start earthquake notification service */
    await this.earthquake.startService();
  }
}
