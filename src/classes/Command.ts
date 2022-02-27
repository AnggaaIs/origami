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
import { ICommand } from "@origami/interfaces";
import CommandContext from "./CommandContext";

export default class Command {
  public name: string;

  public category?: string;

  public cooldown?: number;

  public dev?: boolean;

  public usage?: string;

  public userPerms?: string[];

  public clientPerms?: string[];

  public allowDm?: boolean;

  public options?: any[];

  /* eslint-disable @typescript-eslint/no-unused-vars */
  constructor(protected client: Client, options: ICommand) {
    (this.client = client),
      (this.name = options.name),
      (this.category = options.category || "General"),
      (this.cooldown = options.cooldown || 3),
      (this.dev = options.dev || false),
      (this.usage = options.usage || options.name),
      (this.userPerms = options.userPerms || []),
      (this.clientPerms = options.clientPerms || []),
      (this.allowDm = options.allowDm || false);
    this.options = options.options || [];
  }

  public run?(ctx: CommandContext): void;
}
