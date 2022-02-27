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
import { IEvent } from "@origami/interfaces";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default abstract class Event {
  public name: string;

  constructor(protected client: Client, options: IEvent) {
    this.client = client;
    this.name = options.name;
  }

  abstract run(...args: unknown[]): void;
}
