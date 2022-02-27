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

import GuildConfig from "@origami/database/models/Guild";
import { IGuildConfig } from "../../interfaces/Database";

export default class ServiceGuild {
  async create(id: string): Promise<void> {
    await GuildConfig.create({
      id,
    });
  }

  async deleteOne(id: string): Promise<any> {
    return await GuildConfig.deleteOne({
      id,
    });
  }

  async find(id: string): Promise<IGuildConfig | any> {
    return await GuildConfig.findOne({
      id,
    });
  }

  async findOrCreate(id: string): Promise<IGuildConfig | void> {
    const guild = await GuildConfig.findById(id);
    if (guild) return guild;
    await GuildConfig.create({
      id,
    });
  }
}
