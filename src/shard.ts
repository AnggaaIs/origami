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

import { ShardingManager, ShardingManagerOptions } from "discord.js";
import config from "../config.json";

const manager = new ShardingManager("dist/src/app.js", {
  respawn: true,
  token: config.bot_token,
  totalShards: config.shards,
} as ShardingManagerOptions);

manager.spawn({
  timeout: 120000,
});
