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
import { COLORS, PATTERN } from "@origami/classes/Constants";
import EarthquakeUser from "@origami/database/models/EarthquakeUser";
import { APIEmbedField } from "discord-api-types/v9";
import { Embed, UnsafeEmbed } from "discord.js";
import axios from "axios";
import moment from "moment";

function toFixed(num, fixed) {
  const re = new RegExp(`^-?\\d+(?:.\\d{0,${fixed || -1}})?`);
  return num.toString().match(re)[0];
}

export default class Earthquake {
  constructor(private client: Client) {}

  async startService(): Promise<void> {
    let tsunamiArray = [];
    const isSendCurrentUrl = new Map();
    const endPoint = {
      todayData:
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
    };
    setInterval(async () => {
      const userData = await EarthquakeUser.find({
        status: true,
      });

      if (userData.length !== 0) {
        try {
          const { data: todayData } = await axios.get<any>(endPoint.todayData);
          const regexPlace = PATTERN.earthquakePlace;
          const regexPlace2 = PATTERN.earthquakePlace2;
          let cityFinal;

          const url1 = todayData.features[0].properties.detail;
          const url2 = isSendCurrentUrl.get("url");

          const { data: current } = await axios.get<any>(url1);

          // City converter :v
          const city = current.properties.place;
          if (regexPlace.test(city)) {
            const rpCity = city.replace(regexPlace, "");
            const rp2City = rpCity.replace(regexPlace2, "");
            cityFinal = rp2City
              .slice(1)
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "");
          } else {
            cityFinal = city
              .slice(1)
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "");
          }

          const fields = [];

          const tsunamiEmbed = new Embed()
            .setColor(COLORS.red)
            .setTitle("⚠️ Tsunami Warning")
            .setDescription(
              `Tsunami detected at **${
                current.properties.place
              }**, Magnitude **${toFixed(
                current.properties.mag,
                1,
              )}**, Depth **${toFixed(
                current.properties.products.origin[0].properties.depth,
                2,
              )}km**, Time **${moment(current.properties.time)
                .utcOffset("GMT+00:00")
                .format(
                  "h:mm A",
                )}**\n\n**Note:**\n1. If you are in a low place run to a high place!\n2. If you are in the sea, don't go near the beach, go to the middle of the sea!\n3. Find an evacuation place`,
            )
            .setFooter({
              text: "#StaySafe",
            })
            .setTimestamp();

          const { time } = todayData.features[0].properties;
          const timeNow = Date.now();

          if (url1 !== url2 && timeNow - time < 300000) {
            if (current.properties.place) {
              fields.push({
                inline: true,
                name: "Location",
                value: current.properties.place,
              });
            }

            if (current.properties.mag) {
              fields.push({
                inline: true,
                name: "Magnitude",
                value: toFixed(current.properties.mag, 1),
              });
            }

            if (current.properties.products.origin[0].properties.depth) {
              fields.push({
                inline: true,
                name: "Depth",
                value: `${toFixed(
                  current.properties.products.origin[0].properties.depth,
                  2,
                )}km`,
              });
            }

            if (current.properties.time) {
              fields.push({
                inline: true,
                name: "Time",
                value: moment(current.properties.time)
                  .utcOffset("GMT+00:00")
                  .format("MMMM Do YYYY, h:mm:ss A"),
              });
            }

            let tsunamiPotential;
            if (current.properties.tsunami === 0)
              tsunamiPotential = "No tsunami potential.";
            else if (current.properties.tsunami === 1) {
              tsunamiArray.push({
                url: url1,
              });
              tsunamiPotential = "Tsunami potential.";
            }

            if (tsunamiPotential) {
              fields.push({
                inline: true,
                name: "Tsunami",
                value: tsunamiPotential,
              });
            }

            const embed = new UnsafeEmbed()
              .setColor(COLORS.general)
              .setThumbnail(this.client.user.avatarURL())
              .setTitle("⚠️ Earthquake Alert")
              .addFields(fields as unknown as APIEmbedField)
              .setFooter({
                text: "This data is not completely accurate!",
              })
              .setTimestamp();

            userData.forEach(async (user) => {
              const userCity = user.city
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "");

              if (!userCity.toLowerCase().includes(cityFinal.toLowerCase()))
                return;

              const users = await this.client.users.fetch(user.id);
              if (users)
                users.send({
                  embeds: [embed],
                });
              if (current.properties.tsunami === 1)
                if (users)
                  users.send({
                    embeds: [tsunamiEmbed],
                  });
            });
            isSendCurrentUrl.set("url", url1);
          }
        } catch (e) {}
      }
    }, 10000);

    // Tsunami Notifacation cancel

    if (tsunamiArray.length !== 0) {
      const userData = await EarthquakeUser.find({
        status: true,
      });
      const regexPlace = /(\d*)\s?(km)\s(\w{1,4})\s(of)/s;
      const regexPlace2 = /(,.\w*)/s;

      setInterval(() => {
        tsunamiArray.forEach(async (c) => {
          await axios.get<any>(c.url).then((response) => {
            const tsunamiResponse = response.data.properties.tsunami;
            const cityTsunami = response.data.properties.place;
            let cityFinal;

            if (tsunamiResponse === 0) {
              userData.forEach(async (u) => {
                if (regexPlace.test(cityTsunami)) {
                  const rpCity = cityTsunami.replace(regexPlace, "");
                  const rp2City = rpCity.replace(regexPlace2, "");
                  cityFinal = rp2City
                    .slice(1)
                    .normalize("NFD")
                    .replace(/\p{Diacritic}/gu, "");
                } else {
                  cityFinal = cityTsunami
                    .slice(1)
                    .normalize("NFD")
                    .replace(/\p{Diacritic}/gu, "");
                }
                const userCity = u.city
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "");
                if (!userCity.toLowerCase().includes(cityFinal.toLowerCase()))
                  return;

                const embedTsunamiEnd = new Embed()
                  .setColor(COLORS.general)
                  .setTitle("⚠️ Tsunami Warning Cancelled")
                  .setDescription(
                    `The tsunami warning for **${response.data.properties.place}** has been lifted. Be careful!`,
                  )
                  .setTimestamp();

                tsunamiArray = tsunamiArray.filter((x) => !x.url);

                const user2 = await this.client.users.fetch(u.id);
                user2.send({
                  embeds: [embedTsunamiEnd],
                });
              });
            }
          });
        });
      }, 5000);
    }
  }
}
