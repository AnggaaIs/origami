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

import chalk from "chalk";
import moment from "moment";

export default class Logger {
  public dateFormat(): string {
    return moment(Date.now()).format("h:mm:ss A");
  }

  public convertChalk(content: string, color: string): string {
    switch (color) {
      case "INFO":
        color = "#35d8de";
        break;
      case "ERROR":
        color = "#ff0303";
        break;
      case "WARN":
        color = "ff8605";
        break;
    }

    return chalk.hex(color)(content);
  }

  public convert(content: any, type: string): void {
    return console.log(
      `  ${this.convertChalk(`[ ${type} ]`, type)} : ${content}`,
    );
  }

  public info(content: any): void {
    this.convert(content, "INFO");
  }

  public error(content: any): void {
    this.convert(content, "ERROR");
  }

  public warn(content: any): void {
    this.convert(content, "WARN");
  }
}
