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

import UserConfig from "@origami/database/models/User";
import { IUser } from "../../interfaces/Database";

export default class ServiceUser {
  async create(id: string): Promise<void> {
    await UserConfig.create({
      id,
    });
  }

  async deleteOne(id: string): Promise<any> {
    return await UserConfig.deleteOne({
      id,
    });
  }

  async find(id: string): Promise<IUser | any> {
    return await UserConfig.findOne({
      id,
    });
  }

  async findOrCreate(id: string): Promise<IUser | void> {
    const guild = await UserConfig.findOne({
      id,
    });
    if (guild) return guild;
    await UserConfig.create({
      id,
    });
  }
}
