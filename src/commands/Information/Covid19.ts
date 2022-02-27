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
import { COLORS } from "@origami/classes/Constants";
import { toTitleCase } from "@origami/util";
import { Embed, Message } from "discord.js";
import axios from "axios";
import moment from "moment";

const endpoint = {
  all: "https://disease.sh/v3/covid-19/all",
  country: "https://disease.sh/v3/covid-19/countries",
};

export default class Covid19 extends Command {
  constructor(client: Client) {
    super(client, {
      allowDm: true,
      category: "Information",
      cooldown: 5,
      name: "covid19",
      options: [
        {
          description: "Displaying covid19 by country",
          name: "country",
          required: false,
          type: 3,
        },
      ],
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    if (!ctx.interaction.isChatInputCommand()) return;
    const args1 = ctx.interaction.options.getString("country");

    if (!args1) {
      await axios.get<any>(endpoint.all).then((res) => {
        const { data } = res;
        const timeUpdateAll = moment(data.updated).format("DD/MM/YYYY, hh:mm");

        const embed = new Embed()
          .setAuthor({
            iconURL: this.client.user.avatarURL(),
            name: ctx.locale("commands:covid19.embed_title_global"),
          })
          .setColor(COLORS.general)
          .addFields(
            {
              inline: true,
              name: ctx.locale("commands:covid19.cases_confirm"),
              value: data.cases.toLocaleString(),
            },
            {
              inline: true,
              name: ctx.locale("commands:covid19.recovered"),
              value: data.recovered.toLocaleString(),
            },
            {
              inline: true,
              name: ctx.locale("commands:covid19.today_cases"),
              value: data.todayCases.toLocaleString(),
            },
            {
              inline: true,
              name: ctx.locale("commands:covid19.today_deaths"),
              value: data.todayDeaths.toLocaleString(),
            },
          )
          .setFooter({
            text: ctx.locale("commands:covid19.update", {
              time: timeUpdateAll,
            }),
          });

        ctx.reply({
          embeds: [embed],
        });
      });
    } else {
      let country = "";
      country = toTitleCase(args1);
      if (country === "laos") country = "Lao People's Democratic Republic";
      if (country === "netherlands") country = "nl";

      await axios
        .get<any>(`${endpoint.country}/${country}`)
        .then((data) => {
          const { data: dataCountry } = data;

          const timeUpdateCountry = moment(dataCountry.updated).format(
            "DD/MM/YYYY, hh:mm",
          );

          const embedCountry = new Embed()
            .setAuthor({
              iconURL: this.client.user.avatarURL(),
              name: ctx.locale("commands:covid19.embed_title_country", {
                country: dataCountry.country,
              }),
            })
            .setColor(COLORS.general)
            .setThumbnail(dataCountry.countryInfo.flag)
            .addFields(
              {
                inline: true,
                name: ctx.locale("commands:covid19.cases_confirm"),
                value: dataCountry.cases.toLocaleString(),
              },
              {
                inline: true,
                name: ctx.locale("commands:covid19.recovered"),
                value: dataCountry.recovered.toLocaleString(),
              },
              {
                inline: true,
                name: ctx.locale("commands:covid19.today_cases"),
                value: dataCountry.todayCases.toLocaleString(),
              },
              {
                inline: true,
                name: ctx.locale("commands:covid19.today_deaths"),
                value: dataCountry.todayDeaths.toLocaleString(),
              },
            )
            .setFooter({
              text: ctx.locale("commands:covid19.update", {
                time: timeUpdateCountry,
              }),
            });

          ctx.reply({
            embeds: [embedCountry],
          });
        })
        .catch(() =>
          ctx.replyT(
            "commands:covid19.country_no",
            {
              country: args1,
            },
            true,
          ),
        );
    }
  }
}
