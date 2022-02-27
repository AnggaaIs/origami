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

import { Structure } from "erela.js";

/* eslint-disable @typescript-eslint/no-unused-vars */
class Players extends Structure.get("Player") {
  public timeout: any = null;

  public nightcore = false;

  public _8d = false;

  public setNightcore(status: boolean): boolean {
    if (typeof status !== "boolean")
      throw new Error("Status must be a boolean");

    if (status) {
      this.node.send({
        guildId: this.guild,
        op: "filters",
        timescale: {
          pitch: 1.2,
          rate: 1.0,
          speed: 1.2,
        },
        tremolo: {
          depth: 0.3,
          frequency: 14,
        },
      });

      this.nightcore = true;
      return true;
    }
    this.node.send({
      guildId: this.guild,
      op: "filters",
      timescale: {
        pitch: 1.0,
        rate: 1.0,
        speed: 1.0,
      },
      tremolo: {
        depth: 0,
        frequency: 0,
      },
    });
    this.nightcore = false;
    return true;
  }

  public set8D(status: boolean): boolean {
    if (typeof status !== "boolean")
      throw new Error("Status must be a boolean");
    if (status) {
      this.node.send({
        guildId: this.guild,
        op: "filters",
        rotation: {
          rotationHz: 0.2,
        },
      });
      this._8d = true;
      return true;
    }
    this.node.send({
      guildId: this.guild,
      op: "filters",
      rotation: {
        rotationHz: 0,
      },
    });
    this._8d = false;
    return true;
  }

  public setFilters(value = {}): boolean {
    this.node.send({
      guildId: this.guild,
      op: "filters",
      ...value,
    });
    return true;
  }

  public resetFilters(): boolean {
    this._8d = false;
    this.nightcore = false;

    this.node.send({
      guildId: this.guild,
      op: "filters",
      ...{},
    });
    return true;
  }
}

declare module "erela.js" {
  export interface Player {
    timeout: any;
    nightcore: boolean;
    _8d: boolean;
    setNightcore(status: boolean): boolean;
    set8D(status: boolean): boolean;
    setFilters(): boolean;
    resetFilters(): boolean;
  }
}

Structure.extend("Player", () => Players);
