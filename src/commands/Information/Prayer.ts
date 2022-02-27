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
import { COLORS, EMOJIS, PATTERN } from "@origami/classes/Constants";
import uq from "@umalqura/core";
import {
  APIEmbed,
  APIEmbedField,
  APISelectMenuComponent,
  APISelectMenuOption,
  ComponentType,
} from "discord-api-types/v9";
import {
  ActionRow,
  Embed,
  Message,
  SelectMenuComponent,
  UnsafeEmbed,
} from "discord.js";
import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  Madhab,
  Prayer as PrayerData,
  PrayerTimes,
} from "adhan";
import axios from "axios";
import { find } from "geo-tz";
import moment from "moment-timezone";
import momentJs from "moment";
import pretty from "pretty-ms";

const dataUser = new Map();

interface IPrayerData {
  fajrTime: string;
  sunriseTime: string;
  dhuhrTime: string;
  asrTime: string;
  maghribTime: string;
  ishaTime: string;
  current: PrayerData;
  nextPrayer: PrayerData;
  nextPrayerTime: Date;
  data: { coordinate: Coordinates; date: Date; params: any };
}

const islamicMonth = {
  "01": "Muharram",
  "02": "Safar",
  "03": "Rabi Al-Awwal",
  "04": "Rabi Al-Thani",
  "05": "Jamada Al-Awwal",
  "06": "Jamada Al-Thani",
  "07": "Rajab",
  "08": "Sha’ban",
  "09": "Ramadhan",
  "10": "Shawwal",
  "11": "Dhul Qadah",
  "12": "Dhul Hijjah",
};

const prayerData: any[] = [
  {
    name: "Fajr",
    nameS: "fajrTime",
  },
  {
    name: "Sunrise",
    nameS: "sunriseTime",
  },
  {
    name: "Dhuhr",
    nameS: "dhuhrTime",
  },
  {
    name: "Asr",
    nameS: "asrTime",
  },
  {
    name: "Maghrib",
    nameS: "maghribTime",
  },
  {
    name: "Isha",
    nameS: "ishaTime",
  },
];

const calculationMethod: any[] = [
  {
    description: "Muslim World League (MWL)",
    name: "Muslim World League",
  },
  {
    description: "Egyptian General Authority of Survey",
    name: "Egyptian",
  },
  {
    description: "University of Islamic Sciences, Karachi",
    name: "Karachi",
  },
  {
    description: "Umm al-Qura University, Makkah",
    name: "UmmAlQura",
  },
  {
    description: "Dubai",
    name: "Dubai",
  },
  {
    description: "Moonsighting Committee",
    name: "Moonsighting Committee",
  },
  {
    description: "Islamic Society Of North America (ISNA)",
    name: "NorthAmerica (ISNA)",
  },
  {
    description: "Kuwait",
    name: "Kuwait",
  },
  {
    description: "Qatar",
    name: "Qatar",
  },
  {
    description: "Singapore",
    name: "Singapore",
  },
  {
    description: "Institute of Geophysics, University of Tehran",
    name: "Tehran",
  },
  {
    description: "Dianet",
    name: "Turkey",
  },
];

const madhabArray: any[] = [
  {
    description: "Madhab Hanafi",
    name: "Hanafi",
  },
  {
    description: "Madhab Shafi",
    name: "Shafi",
  },
];
async function getNextPrayerTime(
  prayer: PrayerData,
  data: { coordinate: Coordinates; date: Date; params: any },
): Promise<any> {
  const prayerTimes = new PrayerTimes(data.coordinate, data.date, data.params);

  const timePrayer = prayerTimes.timeForPrayer(prayer);

  return timePrayer;
}
function timeConversion(duration: number) {
  const portions: string[] = [];

  const msInHour = 1000 * 60 * 60;
  const hours = Math.trunc(duration / msInHour);
  if (hours > 0) {
    portions.push(hours + "h");
    duration = duration - hours * msInHour;
  }

  const msInMinute = 1000 * 60;
  const minutes = Math.trunc(duration / msInMinute);
  if (minutes > 0) {
    portions.push(minutes + "m");
    duration = duration - minutes * msInMinute;
  }

  const seconds = Math.trunc(duration / 1000);
  if (seconds > 0) {
    portions.push(seconds + "s");
  }

  return portions.join(" ");
}

async function embedPrayer(
  location: string,
  date: string,
  date2: Date,
  timezone: string,
  method: string,
  madhab: string,
  ctx: CommandContext,
  client: Client,
  fields: APIEmbedField[],
  row: any[],
  display = true,
): Promise<Embed | Message | APIEmbed | void> {
  const time = `**${moment(date2)
    .tz(timezone)
    .format("HH:mm z")}** in **${timezone}**`;
  const dateH = uq(date2);
  const monthZero = ("0" + dateH.hm).slice(-2) as string;
  const dayZero = ("0" + dateH.hd).slice(-2);

  const hijriDate = `${dayZero} ${islamicMonth[monthZero]} ${dateH.hy}`;

  const embed = new UnsafeEmbed({
    fields,
  })
    .setColor(COLORS.general)
    .setAuthor({
      iconURL: client.user.avatarURL(),
      name: ctx.locale("commands:prayer.title_schedule"),
    })
    .setThumbnail(client.user.avatarURL())
    .setDescription(
      `Location: ${
        !location.includes("undefined")
          ? `**${location}**`
          : `**${ctx.locale("commands:prayer.location_not_detect")}**`
      }\nDate: **${date}**\nHijri Date: **${hijriDate}**\nTime: ${time}\n\n> **Configuration**\n> Method: **${method}**\n> Madhab: **${madhab}**`,
    );
  if (display) {
    await ctx.interaction.followUp({
      components: row,
      embeds: [embed],
    });
    return;
  } else {
    return embed;
  }
}
async function displayPrayer(
  latitude: number,
  longitude: number,
  date: Date,
  location: string,
  method = "MuslimWorldLeague",
  madhab = "Shafi",
  ctx: CommandContext,
  client: Client,
): Promise<void> {
  const field: APIEmbedField[] = [];
  let field2: APIEmbedField[] = [];
  let field3: APIEmbedField[] = [];

  const arrayCalculation: APISelectMenuOption[] = [];
  const arrayMadhab: APISelectMenuOption[] = [];

  const Timezone = find(latitude, longitude)[0];

  const calc = await prayerCalculation(
    latitude,
    longitude,
    date,
    method,
    madhab,
  );

  prayerData.forEach(async (a) => {
    const current = calc.current === a.name.toLowerCase() ? true : false;
    let prayerNext = calc.nextPrayer;
    const nextPrayerTimeDhuhr = await getNextPrayerTime(
      PrayerData.Dhuhr,
      calc.data,
    );

    const nextIsSunrise = calc.nextPrayer === PrayerData.Sunrise ? true : false;
    
    if (nextIsSunrise) prayerNext = PrayerData.Dhuhr;
    const nextPrayer = prayerNext === a.name.toLowerCase() ? true : false;
    
    const nextPrayerTimeSeconds =
      moment(nextIsSunrise ? nextPrayerTimeDhuhr : calc.nextPrayerTime)
        .tz(Timezone)
        .valueOf() - moment(Date.now()).tz(Timezone).valueOf();

    const nextPrayerTime = timeConversion(nextPrayerTimeSeconds);

    if (calc)
      field.push({
        inline: true,
        name: `${a.name} ${current ? "(Current)" : ""} ${
          nextPrayer ? `(Remaining: ${nextPrayerTime})` : ""
        }`,
        value: calc[a.nameS],
      });
  });

  const currentDate = moment(date).tz(Timezone).format("DD MMMM YYYY");

  calculationMethod.forEach((a) => {
    arrayCalculation.push({
      default: a.name === "Muslim World League" ? true : false,
      description: a.description,
      label: a.name,
      value: a.name,
    });
  });

  madhabArray.forEach((a) => {
    arrayMadhab.push({
      default: a.name === "Shafi" ? true : false,
      description: a.description,
      label: a.name,
      value: a.name,
    });
  });
  const selectMenuData: APISelectMenuComponent = {
    custom_id: "select_method",
    options: arrayCalculation,
    placeholder: ctx.locale("commands:prayer.placeholder_select_method"),
    type: ComponentType.SelectMenu,
  };

  const selectMenuData2: APISelectMenuComponent = {
    custom_id: "select_madhab",
    options: arrayMadhab,
    placeholder: ctx.locale("commands:prayer.placeholder_select_madhab"),
    type: ComponentType.SelectMenu,
  };

  const row = new ActionRow().setComponents(
    new SelectMenuComponent(selectMenuData),
  );

  const row2 = new ActionRow().setComponents(
    new SelectMenuComponent(selectMenuData2),
  );

  const embedA1 = (await embedPrayer(
    location,
    currentDate,
    date,
    Timezone,
    method,
    madhab,
    ctx,
    client,
    field,
    [],
    false,
  )) as Embed | APIEmbed;

  const embed1 = await ctx.interaction.followUp({
    components: [row, row2],
    embeds: [embedA1],
  });

  const filter = (interactions: any) =>
    interactions.user.id === ctx.interaction.user.id;

  const collector = (embed1 as Message).createMessageComponentCollector({
    filter,
    time: 300000
  });

  collector.on("collect", async (b: any) => {
    if (!b || !b.values) return;

    const value = b.values[0];
    const customId = b.customId;

    /* Id = Select Method */
    if (customId === "select_method") {
      calculationMethod.forEach(async (a) => {
        if (value === a.name) {
          const storeData2 = dataUser.get(ctx.interaction.user.id);
          dataUser.delete(ctx.interaction.user.id);
          dataUser.set(ctx.interaction.user.id, {
            madhab: storeData2.madhab,
            method: value,
          });
          const dataUsr2 = dataUser.get(ctx.interaction.user.id);

          const calc2 = await prayerCalculation(
            latitude,
            longitude,
            date,
            dataUsr2.method,
            dataUsr2.madhab,
          );

          prayerData.forEach(async (a) => {
            const current2 =
              calc2.current === a.name.toLowerCase() ? true : false;

            let prayerNext2 = calc2.nextPrayer;
            const nextPrayerTimeDhuhr2 = await getNextPrayerTime(
              PrayerData.Dhuhr,
              calc2.data,
            );

            const nextIsSunrise2 =
              calc2.nextPrayer === PrayerData.Sunrise ? true : false;

            if (nextIsSunrise2) prayerNext2 = PrayerData.Dhuhr;
            const nextPrayer2 =
              prayerNext2 === a.name.toLowerCase() ? true : false;

            const nextPrayerTimeSeconds2 =
              moment(
                nextIsSunrise2 ? nextPrayerTimeDhuhr2 : calc2.nextPrayerTime,
              )
                .tz(Timezone)
                .valueOf() - moment(Date.now()).tz(Timezone).valueOf();

            //
            const nextPrayerTime2 = timeConversion(nextPrayerTimeSeconds2);
            if (calc2)
              field2.push({
                inline: true,
                name: `${a.name} ${current2 ? "(Current)" : ""} ${
                  nextPrayer2 ? `(Remaining: ${nextPrayerTime2})` : ""
                }`,
                value: calc2[a.nameS],
              });
          });

          const embed2 = await embedPrayer(
            location,
            currentDate,
            date,
            Timezone,
            dataUsr2.method,
            dataUsr2.madhab,
            ctx,
            client,
            field2,
            [],
            false,
          );

          field2 = [];

          await b
            .update({
              embeds: [embed2],
            })
            .catch(() => {});
        }
      });

      /* Id = Select Madhab */
    } else if (customId === "select_madhab") {
      madhabArray.forEach(async (a) => {
        if (value === a.name) {
          const storeData3 = dataUser.get(ctx.interaction.user.id);
          dataUser.delete(ctx.interaction.user.id);
          dataUser.set(ctx.interaction.user.id, {
            madhab: value,
            method: storeData3.method,
          });
          const dataUsr3 = dataUser.get(ctx.interaction.user.id);

          const calc3 = await prayerCalculation(
            latitude,
            longitude,
            date,
            dataUsr3.method,
            dataUsr3.madhab,
          );

          prayerData.forEach(async (a) => {
            const current3 =
              calc3.current === a.name.toLowerCase() ? true : false;
            let prayerNext3 = calc3.nextPrayer;
            const nextPrayerTimeDhuhr3 = await getNextPrayerTime(
              PrayerData.Dhuhr,
              calc3.data,
            );

            const nextIsSunrise3 =
              calc3.nextPrayer === PrayerData.Sunrise ? true : false;

            if (nextIsSunrise3) prayerNext3 = PrayerData.Dhuhr;
            const nextPrayer3 =
              prayerNext3 === a.name.toLowerCase() ? true : false;

            const nextPrayerTimeSeconds3 =
              moment(
                nextIsSunrise3 ? nextPrayerTimeDhuhr3 : calc3.nextPrayerTime,
              )
                .tz(Timezone)
                .valueOf() - moment(Date.now()).tz(Timezone).valueOf();

            const nextPrayerTime3 = timeConversion(nextPrayerTimeSeconds3);

            if (calc3)
              field3.push({
                inline: true,
                name: `${a.name} ${current3 ? "(Current)" : ""} ${
                  nextPrayer3 ? `(Remaining: ${nextPrayerTime3})` : ""
                }`,
                value: calc3[a.nameS],
              });
          });

          const embed3 = await embedPrayer(
            location,
            currentDate,
            date,
            Timezone,
            dataUsr3.method,
            dataUsr3.madhab,
            ctx,
            client,
            field3,
            [],
            false,
          );

          field3 = [];

          await b
            .update({
              embeds: [embed3],
            })
            .catch(() => {});
        }
      });
    }
  });

  collector.on("end", () => {
    if (dataUser.has(ctx.interaction.user.id))
      dataUser.delete(ctx.interaction.user.id);
    return;
  });
}

async function prayerCalculation(
  latitude: number,
  longitude: number,
  date: Date,
  calculation = "MuslimWorldLeague",
  madhab = "Shafi",
): Promise<IPrayerData> {
  const coordinate = new Coordinates(latitude, longitude);
  let params;

  switch (calculation) {
    case "Muslim World League":
    case "MuslimWorldLeague":
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case "Egyptian":
      params = CalculationMethod.Egyptian();
      break;
    case "Karachi":
      params = CalculationMethod.Karachi();
      break;
    case "UmmAlQura":
      params = CalculationMethod.UmmAlQura();
      break;
    case "Dubai":
      params = CalculationMethod.Dubai();
      break;
    case "MoonsightingCommittee":
    case "Moonsighting Committee":
      params = CalculationMethod.MoonsightingCommittee();
      break;
    case "NorthAmerica (ISNA)":
      params = CalculationMethod.NorthAmerica();
      break;
    case "Kuwait":
      params = CalculationMethod.Kuwait();
      break;
    case "Qatar":
      params = CalculationMethod.Qatar();
      break;
    case "Singapore":
      params = CalculationMethod.Singapore();
      break;
    case "Tehran":
      params = CalculationMethod.Tehran();
      break;
    case "Turkey":
      params = CalculationMethod.Turkey();
      break;
    default:
      throw "Invalid Calculation Method";
  }

  switch (madhab) {
    case "Shafi":
      params.madhab = Madhab.Shafi;
      break;
    case "Hanafi":
      params.madhab = Madhab.Hanafi;
      break;
    default:
      throw "Invalid Madhab";
  }

  const Timezone = find(latitude, longitude)[0];

  const prayerTimes = new PrayerTimes(coordinate, date, params);

  const fajrTime = moment(prayerTimes.fajr).tz(Timezone).format("HH:mm");
  const sunriseTime = moment(prayerTimes.sunrise).tz(Timezone).format("HH:mm");
  const dhuhrTime = moment(prayerTimes.dhuhr).tz(Timezone).format("HH:mm");
  const asrTime = moment(prayerTimes.asr).tz(Timezone).format("HH:mm");
  const maghribTime = moment(prayerTimes.maghrib).tz(Timezone).format("HH:mm");
  const ishaTime = moment(prayerTimes.isha).tz(Timezone).format("HH:mm");

  const current = prayerTimes.currentPrayer();
  const nextPrayer = prayerTimes.nextPrayer();
  const nextPrayerTime = prayerTimes.timeForPrayer(nextPrayer);

  const data = { coordinate, date, params };

  return {
    asrTime,
    current,
    dhuhrTime,
    fajrTime,
    ishaTime,
    maghribTime,
    nextPrayer,
    nextPrayerTime,
    sunriseTime,
    data,
  };
}

export default class Prayer extends Command {
  constructor(client: Client) {
    super(client, {
      allowDm: true,
      category: "Information",
      cooldown: 10,
      name: "prayer",
      options: [
        {
          description: "Find prayer times by location",
          name: "location",
          required: true,
          type: 3,
        },
      ],
      usage: "prayer <location|latitude,longitude>",
    });
  }

  async run(ctx: CommandContext): Promise<void | Message> {
    if (!ctx.interaction.isChatInputCommand()) return;
    const userLocation = ctx.interaction.options.getString("location");

    await ctx.interaction.deferReply();
    const date = new Date();
    let location;
    let lat;
    let long;

    const arrayLocation: APISelectMenuOption[] = [];

    if (PATTERN.coordinates.test(userLocation)) {
      const [a, b] = userLocation.split(",");

      const reverseGeocodeEndpoint = `http://api.openweathermap.org/geo/1.0/reverse?lat=${a}&lon=${b}&limit=1&appid=${this.client.config.apiKey.openWeather}`;

      const { data: ReverseGeocodeData } = await axios.get<any>(
        reverseGeocodeEndpoint,
      );

      if (ReverseGeocodeData.length < 1) {
        ctx.interaction.followUp(
          `${EMOJIS.no} | ${ctx.locale("commands:prayer.location_not_found")}`,
        );
      }

      lat = a;
      long = b;
      location = `${ReverseGeocodeData.name}${
        ReverseGeocodeData.state ? `, ${ReverseGeocodeData.state}` : ""
      }, ${ReverseGeocodeData.country}`;

      if (dataUser.has(ctx.interaction.user.id))
        dataUser.delete(ctx.interaction.user.id);
      dataUser.set(ctx.interaction.user.id, {
        madhab: "Shafi",
        method: "Muslim World League",
      });

      await displayPrayer(
        lat,
        long,
        date,
        location,
        "Muslim World League",
        "Shafi",
        ctx,
        this.client,
      );
    } else {
      const geocodeEndpoint = `http://api.openweathermap.org/geo/1.0/direct?q=${userLocation}&limit=5&appid=${this.client.config.apiKey.openWeather}`;

      const { data: LocationData } = await axios.get<any>(geocodeEndpoint);
      if (LocationData.length < 1) {
        await ctx.interaction.followUp(
          `${EMOJIS.no} | ${ctx.locale("commands:prayer.location_not_found")}`,
        );
      }

      if (LocationData.length > 0) {
        LocationData.forEach((a, i) => {
          arrayLocation.push({
            description: `${a.lat}, ${a.lon}`,
            label: `${a.name}${a.state ? `, ${a.state}` : ""}, ${a.country}`,
            value: (i += 1),
          });
        });

        const selectMenuData: APISelectMenuComponent = {
          custom_id: "select_location",
          options: arrayLocation,
          placeholder: ctx.locale("commands:prayer.placeholder_location"),
          type: ComponentType.SelectMenu,
        };
        const row = new ActionRow().addComponents(
          new SelectMenuComponent(selectMenuData),
        );

        const embedSelect = new Embed()
          .setColor(COLORS.general)
          .setAuthor({
            iconURL: this.client.user.avatarURL(),
            name: ctx.locale("commands:prayer.embedSelect.title"),
          })
          .setDescription(ctx.locale("commands:prayer.embedSelect.description"))
          .setTimestamp();

        const mn = await ctx.interaction.followUp({
          components: [row],
          embeds: [embedSelect],
          fetchReply: true,
        });

        const filter = (interactions: any) =>
          interactions.user.id === ctx.interaction.user.id;

        const collector = (mn as Message).createMessageComponentCollector({
          filter,
          time: 60000,
        });

        collector.on("collect", async (a: any) => {
          if (!a || !a.values) return;

          const dataF = LocationData[Number(a.values[0]) - 1];

          lat = dataF.lat;
          long = dataF.lon;
          location = `${dataF.name}${dataF.state ? `, ${dataF.state}` : ""}, ${
            dataF.country
          }`;

          collector.stop();

          if (dataUser.has(ctx.interaction.user.id))
            dataUser.delete(ctx.interaction.user.id);
          dataUser.set(ctx.interaction.user.id, {
            madhab: "Shafi",
            method: "Muslim World League",
          });

          setTimeout(async () => {
            await displayPrayer(
              lat,
              long,
              date,
              location,
              "Muslim World League",
              "Shafi",
              ctx,
              this.client,
            );
          }, 1000);
          await ctx.interaction.deleteReply().catch(() => {});
        });
      }
    }
  }
}
