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
import { EMOJIS } from "@origami/classes/Constants";
import EarthquakeUser from "@origami/database/models/EarthquakeUser";
import { Message } from "discord.js";

/* eslint camelcase: "off" */
export default class Earthquake extends Command {
  constructor(client: Client) {
    super(client, {
      allowDm: true,
      category: "Information",
      cooldown: 10,
      name: "earthquake",
      options: [
        {
          description: "Earthquake notification",
          name: "set",
          options: [
            {
              description: "Set notifications to on",
              name: "on",
              type: 1,
            },
            {
              description: "Set notifications to off",
              name: "off",
              type: 1,
            },
            {
              description: "Set city for notification",
              name: "city",
              options: [
                {
                  description: "Enter city name",
                  name: "city_name",
                  required: true,
                  type: 3,
                },
              ],
              type: 1,
            },
          ],
          type: 2,
        },
      ],
      usage: "earthquake set <on|off|city> [input city]",
    });
  }

  async run(ctx: CommandContext): Promise<void | Message> {
    if (!ctx.interaction.isChatInputCommand()) return;
    const subCommand = ctx.interaction.options.getSubcommand();
    const userData = await EarthquakeUser.findOne({
      id: ctx.interaction.user.id,
    });

    if (subCommand === "on") {
      if (!userData || !userData.city) {
        return ctx.replyT("commands: earthquake.user_no_data", true);
      }
      if (userData.status === false || userData.status === true)
        userData.updateOne({
          status: true,
        });

      return ctx.replyWithTime(
        `${EMOJIS.yes} | ${ctx.locale("commands:earthquake.success_enable")}`,
      );
    }
    if (subCommand === "off") {
      if (!userData || !userData.city) {
        return ctx.replyT("commands: earthquake.user_no_data", true);
      }
      if (userData.status === false || userData.status === true)
        userData.updateOne({
          status: false,
        });

      return ctx.replyWithTime(
        `${EMOJIS.yes} | ${ctx.locale("commands:earthquake.success_disable")}`,
      );
    }
    if (subCommand === "city") {
      const city_name = ctx.interaction.options.getString("city_name");

      if (!userData) {
        await EarthquakeUser.create({
          city: city_name,
          id: ctx.interaction.user.id,
        });

        return ctx.replyWithTime(
          `${EMOJIS.yes} | ${ctx.locale(
            "commands:earthquake.success_set_city",
            {
              city: city_name,
            },
          )}`,
          30000,
        );
      }
      await userData.updateOne({
        city: city_name,
      });
      return ctx.replyWithTime(
        `${EMOJIS.yes} | ${ctx.locale("commands:earthquake.success_set_city", {
          city: city_name,
        })}`,
        30000,
      );
    }
  }
}
