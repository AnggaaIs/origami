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
import { COLORS, EMOJIS } from "@origami/classes/Constants";
import GuildService from "@origami/database/services/Guild";
import {
  ActionRow,
  ButtonComponent,
  ButtonStyle,
  Embed,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { Manager, VoicePacket } from "erela.js";
import Spotify from "erela.js-spotify";
import pretty from "pretty-ms";

export default class Lavalink {
  manager: Manager;

  guildService: GuildService = new GuildService();

  constructor(client: Client) {
    this.manager = new Manager({
      autoPlay: true,
      nodes: client.config.lavalink.nodes,
      plugins: [
        /* Plugins */
        new Spotify({
          clientID: client.config.apiKey.spotify.clientID,
          clientSecret: client.config.apiKey.spotify.clientSecret,
        }),
      ],

      send(id, payload) {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
    })
      .on("nodeConnect", (node) =>
        client.log.info(`Lavalink node ${node.options.identifier} connected`),
      )
      .on("nodeError", (node, e) =>
        client.log.error(
          `Lavalink node ${node.options.identifier} error: ${e.message}`,
        ),
      )
      .on("playerCreate", (player) =>
        client.log.info(`Player created in the guild ${player.guild}`),
      )
      .on("playerDestroy", (player) =>
        client.log.info(`Player destroyed in the guild ${player.guild}`),
      )
      .on("trackStart", async (player, track) => {
        const Guild = await this.guildService.find(player.guild);
        const localeString: string = Guild.locale;
        const locale = await client.manager.getLocale(localeString);

        const embed = new Embed()
          .setColor(COLORS.general)
          .setTitle(locale("global:MUSIC_START_TITLE"))
          .setDescription(
            locale("global:MUSIC_START_INFO", {
              duration: `${
                track.isStream
                  ? "🔴 Live"
                  : pretty(track.duration, {
                      colonNotation: true,
                    })
              }`,
              title: track.title,
              uri: track.uri,
            }),
          );

        const row = new ActionRow().addComponents(
          new ButtonComponent()
            .setCustomId("stop")
            .setEmoji({
              name: "⏹️",
            })
            .setStyle(ButtonStyle.Secondary),
          new ButtonComponent()
            .setCustomId("pause_play")
            .setEmoji({
              name: "⏯️",
            })
            .setStyle(ButtonStyle.Secondary),
          new ButtonComponent()
            .setCustomId("skip")
            .setEmoji({
              name: "⏩",
            })
            .setStyle(ButtonStyle.Secondary),
        );

        let texT;
        const textChannel = client.channels.cache.get(
          player.textChannel,
        ) as TextChannel;
        if (textChannel)
          texT = await textChannel
            .send({
              components: [row],
              embeds: [embed],
            })
            .catch(() => {});
        setTimeout(
          () => {
            if (texT.deletable) texT.delete().catch(() => {});
          },
          track.isStream ? 600000 : track.duration,
        );

        // Button Handler

        const collector = textChannel.createMessageComponentCollector();

        collector.on("collect", async (a) => {
          const button = a.customId;
          if (button === "stop") {
            if (!player && !player.playing) return;

            const { channel } = client.guilds.cache
              .get(a.guild.id)
              .members.cache.get(a.user.id).voice;
            const voiceChannel = client.guilds.cache
              .get(a.guild.id)
              .channels.cache.get(player.voiceChannel);

            if (!channel)
              return await a
                .reply(`${EMOJIS.no} | ${locale("global:MUSIC.not_voice")}`)
                .catch(() => {});
            setTimeout(
              async () => await a.deleteReply().catch(() => {}),
              15000,
            );

            if (player) {
              if (channel.id !== player.voiceChannel) {
                return await a
                  .reply(
                    `${EMOJIS.no} | ${locale("global:MUSIC.not_voice_same", {
                      vc: voiceChannel.name,
                    })}`,
                  )
                  .catch(() => {});
              }
            }
            setTimeout(
              async () => await a.deleteReply().catch(() => {}),
              15000,
            );

            player.destroy();
            collector.stop();
            //  await a.deferReply()

            await a
              .reply(`${EMOJIS.yes} | ${locale("commands:stop.success_stop")}`)
              .catch(() => {});
            if (texT.deletable) texT.delete().catch(() => {});
            setTimeout(
              async () => await a.deleteReply().catch(() => {}),
              15000,
            );
          } else if (button === "pause_play") {
            if (!player && !player.playing) return;

            const { channel } = client.guilds.cache
              .get(a.guild.id)
              .members.cache.get(a.user.id).voice;

            const voiceChannel = client.guilds.cache
              .get(a.guild.id)
              .channels.cache.get(player.voiceChannel);

            if (!channel)
              return await a
                .reply(`${EMOJIS.no} | ${locale("global:MUSIC.not_voice")}`)
                .catch(() => {});
            setTimeout(
              async () => await a.deleteReply().catch(() => {}),
              15000,
            );

            if (player) {
              if (channel.id !== player.voiceChannel) {
                return await a
                  .reply(
                    `${EMOJIS.no} | ${locale("global:MUSIC.not_voice_same", {
                      vc: voiceChannel.name,
                    })}`,
                  )
                  .catch(() => {});
              }
            }
            setTimeout(
              async () => await a.deleteReply().catch(() => {}),
              15000,
            );

            const pauseLocale = !player.paused ? "pause" : "resume";
            player.pause(!player.paused);
            //  await a.deferReply()
            await a
              .reply(
                `${EMOJIS.yes} | ${locale(
                  `commands:${pauseLocale}.success_${pauseLocale}`,
                  {
                    track: player.queue.current.title,
                  },
                )}`,
              )
              .catch(() => {});
            setTimeout(
              async () => await a.deleteReply().catch(() => {}),
              15000,
            );
          } else if (button === "skip") {
            if (!player && !player.playing) return;
            const { channel } = client.guilds.cache
              .get(a.guild.id)
              .members.cache.get(a.user.id).voice;

            const voiceChannel = client.guilds.cache
              .get(a.guild.id)
              .channels.cache.get(player.voiceChannel);

            if (!channel)
              return await a
                .reply(`${EMOJIS.no} | ${locale("global:MUSIC.not_voice")}`)
                .catch(() => {});
            setTimeout(
              async () => await a.deleteReply().catch(() => {}),
              15000,
            );

            if (player) {
              if (channel.id !== player.voiceChannel) {
                return await a
                  .reply(
                    `${EMOJIS.no} | ${locale("global:MUSIC.not_voice_same", {
                      vc: voiceChannel.name,
                    })}`,
                  )
                  .catch(() => {});
              }
            }
            setTimeout(
              async () => await a.deleteReply().catch(() => {}),
              15000,
            );

            player.stop();

            //   await a.deferReply()
            await a
              .reply(
                `${EMOJIS.yes} | ${locale("commands:skip.success_skip", {
                  track: player.queue.current.title,
                })}`,
              )
              .catch(() => {});
            if (texT.deletable) texT.delete().catch(() => {});
            setTimeout(
              async () => await a.deleteReply().catch(() => {}),
              15000,
            );
          }
        });

        //
        if (player.timeout !== null) return clearTimeout(player.timeout);
      })
      .on("trackError", async (player, track, payload) => {
        client.log.error(
          `Track error in the guild ${player.guild} : ${payload.error}`,
        );

        const Guild = await this.guildService.find(player.guild);
        const localeString: string = Guild.locale;
        const locale = await client.manager.getLocale(localeString);

        const embed = new Embed()
          .setColor(COLORS.red)
          .setTitle(locale("global:MUSIC_ERROR_TITLE"))
          .setDescription(locale("global:MUSIC_ERROR_INFO"))
          .setTimestamp();

        const textChannel = client.channels.cache.get(
          player.textChannel,
        ) as TextChannel;
        if (textChannel)
          textChannel.send({
            embeds: [embed],
          });
        if (player) player.stop();
      })
      .on("trackStuck", async (player) => {
        client.log.error(`Track stuck in the guild ${player.guild}`);

        const Guild = await this.guildService.find(player.guild);
        const localeString: string = Guild.locale;
        const locale = await client.manager.getLocale(localeString);

        const embed = new Embed()
          .setColor(COLORS.red)
          .setTitle(locale("global:MUSIC_STUCK_TITLE"))
          .setDescription(locale("global:MUSIC_ERROR_INFO"))
          .setTimestamp();

        const textChannel = client.channels.cache.get(
          player.textChannel,
        ) as TextChannel;
        if (textChannel)
          textChannel.send({
            embeds: [embed],
          });
        if (player) player.stop();
      })

      .on("queueEnd", async (player) => {
        const Guild = await this.guildService.find(player.guild);
        const localeString: string = Guild.locale;
        const locale = await client.manager.getLocale(localeString);

        player.timeout = setTimeout(() => {
          const voiceChannel = client.channels.cache.get(
            player.voiceChannel,
          ) as VoiceChannel;

          const textChannel = client.channels.cache.get(
            player.textChannel,
          ) as TextChannel;
          if (textChannel) {
            setTimeout(
              () =>
                textChannel.send(
                  locale("global:QUEUE_END", {
                    vc: voiceChannel.name,
                  }),
                ),
              15000,
            );
          }

          player.destroy();
        }, 120000);
      });

    client.on("raw", (p: VoicePacket) =>
      client.lavalink.manager.updateVoiceState(p),
    );
  }
}
