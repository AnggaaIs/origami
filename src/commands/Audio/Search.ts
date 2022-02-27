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
import { COLORS, EMOJIS } from "@origami/classes/Constants";
import {
  APISelectMenuComponent,
  APISelectMenuOption,
  ComponentType,
} from "discord-api-types/v9";
import { ActionRow, Embed, Message, SelectMenuComponent } from "discord.js";
import pretty from "pretty-ms";

function createQueueEmbed(songs: any, id: string, ctx: CommandContext): Embed {
  const embed = new Embed()
    .setColor(COLORS.general)
    .setTitle(ctx.locale("commands:play.added_to_queue_title"))
    .setDescription(
      ctx.locale("commands:play.added_to_queue_info", {
        duration: `${
          songs.isStream
            ? "🔴 Live"
            : pretty(songs.duration, {
                colonNotation: true,
              })
        }`,
        title: songs.title,
        uri: songs.uri,
        user: id,
      }),
    );

  return embed;
}

/* eslint camelcase: "off" */
export default class Search extends Command {
  constructor(client: Client) {
    super(client, {
      category: "Audio",
      clientPerms: ["CONNECT"],
      cooldown: 5,
      name: "search",
      options: [
        {
          description:
            "Enter song title/link/playlist ( via soundcloud? type 'soundcloud:<query>' )",
          name: "query",
          required: true,
          type: 3,
        },
      ],
      usage: "search <title / url>",
      userPerms: ["CONNECT", "SPEAK"],
    });
  }

  async run(ctx: CommandContext): Promise<void | Message> {
    if (!ctx.interaction.isChatInputCommand()) return;
    let value = ctx.interaction.options.getString("query");
    const manager = this.client.lavalink.manager.players.get(
      ctx.interaction.guild.id,
    );

    const { channel } = ctx.interaction.guild.members.cache.get(
      ctx.interaction.user.id,
    ).voice;

    if (!channel)
      return ctx.reply(
        `${EMOJIS.no} | ${ctx.locale("global:MUSIC.not_voice")}`,
        true,
      );

    if (manager) {
      const voiceChannel = this.client.guilds.cache
        .get(ctx.interaction.guild.id)
        .channels.cache.get(manager.voiceChannel);
      if (channel.id !== manager.voiceChannel) {
        return ctx.reply(
          `${EMOJIS.no} | ${ctx.locale("global:MUSIC.not_voice_same", {
            vc: voiceChannel.name,
          })}`,
          true,
        );
      }
    }

    const player = this.client.lavalink.manager.create({
      guild: ctx.interaction.guild.id,
      selfDeafen: true,
      textChannel: ctx.interaction.channel.id,
      voiceChannel: channel.id,
    });
    const embed = new Embed();

    await ctx.interaction.deferReply();
    let res;

    if (value.startsWith("soundcloud:")) {
      value = value.replace("soundcloud:", "");
      res = await player.search({
        query: value,
        source: "soundcloud",
      });
    } else {
      res = await player.search(
        {
          query: value,
        },
        ctx.interaction.user,
      );
    }
    if (player.state !== "CONNECTED") player.connect();

    if (res.exception) {
      if (player.state === "CONNECTED" && !player.playing) player.destroy();
      await ctx.interaction.followUp(
        `${EMOJIS.no} | ${ctx.locale("commands:play.res_error")}`,
      );
      setTimeout(
        async () => await ctx.interaction.deleteReply().catch(() => {}),
        15000,
      );
      return;
    }

    let maxSongs = 5;
    let songs;

    switch (res.loadType) {
      case "TRACK_LOADED":
      case "SEARCH_RESULT":
        if (res.tracks.length === 1) songs = res.tracks[0];
        if (res.tracks.length < 5) maxSongs = res.tracks.length;

        if (res.tracks.length > 1) {
          const songsDescription = res.tracks
            .slice(0, maxSongs)
            .map(
              (a, i) =>
                `\`${(i += 1)}#\` | **[${a.title}](${a.uri})** \`(${pretty(
                  a.duration,
                  {
                    colonNotation: true,
                  },
                )})\``,
            )
            .join("\n");

          const embedSearch = new Embed()
            .setColor(COLORS.general)
            .setAuthor({
              iconURL: this.client.user.avatarURL(),
              name: ctx.locale("commands:search.select_song_title"),
            })
            .setDescription(songsDescription);

          const songsList: APISelectMenuOption[] = [];
          res.tracks.slice(0, maxSongs).forEach((a, i) => {
            songsList.push({
              description: `${a.author} | ${pretty(a.duration, {
                colonNotation: true,
              })}`,
              label: a.title,
              value: (i += 1),
            });
          });

          const selectMenuData: APISelectMenuComponent = {
            custom_id: "select_song",
            options: songsList,
            placeholder: "Select a song",
            type: ComponentType.SelectMenu,
          };

          const row = new ActionRow().addComponents(
            new SelectMenuComponent(selectMenuData),
          );
          await ctx.interaction.followUp({
            components: [row],
            embeds: [embedSearch],
          });

          const filter = (interactions: any) =>
            interactions.user.id === ctx.interaction.user.id;

          const collector =
            ctx.interaction.channel.createMessageComponentCollector({
              filter,
              time: 60000,
            });

          collector.on("collect", async (a: any) => {
            if (!a || !a.values) return;
            songs = res.tracks[Number(a.values[0]) - 1];
            if (!songs) return;
            player.queue.add(songs);

            const embedQ3 = createQueueEmbed(
              songs,
              ctx.interaction.user.id,
              ctx,
            );

            await a.reply({
              embeds: [embedQ3],
            });
            setTimeout(async () => await a.deleteReply(), 30000);

            if (!player.playing && !player.paused && !player.queue.length)
              player.play();
          });
        } else {
          player.queue.add(songs);

          const embedQ4 = createQueueEmbed(songs, ctx.interaction.user.id, ctx);

          ctx.replyWithTime(
            {
              embeds: [embedQ4],
            },
            30000,
          );

          if (!player.playing && !player.paused && !player.queue.length)
            player.play();
        }

        break;

      case "NO_MATCHES":
        if (player.state === "CONNECTED" && !player.playing) player.destroy();
        await ctx.interaction.followUp(
          `${EMOJIS.no} | ${ctx.locale("global:MUSIC.no_music")}`,
        );
        setTimeout(
          async () => await ctx.interaction.deleteReply().catch(() => {}),
          15000,
        );
        break;

      case "LOAD_FAILED":
        if (player.state === "CONNECTED" && !player.playing) player.destroy();
        await ctx.interaction.followUp(
          `${EMOJIS.no} | ${ctx.locale("global:MUSIC.load_failed")}`,
        );
        setTimeout(
          async () => await ctx.interaction.deleteReply().catch(() => {}),
          15000,
        );
        break;

      case "PLAYLIST_LOADED":
        player.queue.add(res.tracks);

        embed.setColor(COLORS.general);
        embed.setTitle(ctx.locale("commands:play.pl_added_to_queue_title"));
        embed.setDescription(
          ctx.locale("commands:play.pl_added_to_queue_info", {
            pl_count: res.tracks.length + 1,
            pl_duration: pretty(res.playlist.duration, {
              colonNotation: true,
            }),
            pl_name: res.playlist.name,
            user: ctx.interaction.user.id,
          }),
        );

        await ctx.interaction.followUp({
          embeds: [embed],
        });
        setTimeout(
          async () => await ctx.interaction.deleteReply().catch(() => {}),
          30000,
        );
        if (!player.playing && !player.paused) player.play();
        break;
    }
  }
}
