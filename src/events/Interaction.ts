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
import CommandContext from "@origami/classes/CommandContext";
import { COLORS, text } from "@origami/classes/Constants";
import Event from "@origami/classes/Event";
import UserConfig from "@origami/database/models/User";
import GuildService from "@origami/database/services/Guild";
import UserService from "@origami/database/services/User";
import { toTitleCase } from "@origami/util";
import {
  ActionRow,
  ButtonComponent,
  ButtonStyle,
  Collection,
  Embed,
  Interaction,
  Message,
  Snowflake,
  TextChannel,
  UnsafeEmbed,
} from "discord.js";
import i18next from "i18next";

export default class InteractionCreate extends Event {
  public client: Client;

  public guildService: GuildService = new GuildService();

  public userService: UserService = new UserService();

  constructor(client: Client) {
    super(client, {
      name: "interactionCreate",
    });
  }

  async run(interaction: Interaction): Promise<Message | void> {
    //  try {
    if (!interaction.isCommand()) return;

    // Create user data
    await this.userService.findOrCreate(interaction.user.id);

    let localeConfig = "";

    const guildConfig = await this.guildService.find(interaction.guildId ?? "");

    if (!guildConfig) {
      localeConfig = "en-US";
    } else {
      localeConfig = guildConfig.locale;
    }

    const locale = i18next.getFixedT(localeConfig);

    const command = this.client.manager.getCommand(interaction.commandName);

    if (!command) return;

    const ctx = new CommandContext(this.client, interaction, locale);

    if (command.dev && !this.client.config.owners.includes(interaction.user.id))
      await ctx.interaction.deferReply();

    if (!command.allowDm && !interaction.inGuild()) {
      return ctx.reply(
        locale("global:CMD_ALLOW_DM", {
          cmdName: toTitleCase(command.name),
        }),
        true,
      );
    }

    const channel = interaction.channel as TextChannel;

    if (interaction.inGuild()) {
      const clientCheckPerms = channel.permissionsFor(interaction.guild.me);
      const userCheckPerms = channel.permissionsFor(interaction.user.id);

      const { clientPerms } = command;
      const { userPerms } = command;

      if (!clientCheckPerms.has("SendMessages")) {
        return ctx.interaction.user.send(
          locale("global:NO_PERM_CLIENT", {
            perm: "Send Messages",
          }),
        );
      }

      if (!clientCheckPerms.has("EmbedLinks")) {
        return ctx.reply(
          locale("global:NO_PERM_CLIENT", {
            perm: "Embed Links",
          }),
        );
      }

      const arrayUserPerms: string[] = [];
      const arrayClientPerms: string[] = [];
      // Handle client permissions
      if (clientPerms?.length) {
        clientPerms?.forEach((p: any) => {
          if (!clientCheckPerms.has(p)) arrayClientPerms.push(p);
        });
      }

      // Handle user permissions
      if (userPerms?.length) {
        userPerms?.forEach((p: any) => {
          if (!userCheckPerms.has(p)) arrayUserPerms.push(p);
        });
      }

      if (arrayClientPerms.length) {
        return ctx
          .reply(
            locale("global:NO_PERM_CLIENT", {
              perm: toTitleCase(arrayClientPerms.join(", ")),
            }),
          )
          .catch(() => {});
      }

      if (arrayUserPerms.length) {
        return ctx
          .reply(
            locale("global:NO_PERM_USER", {
              perm: toTitleCase(arrayUserPerms.join(", ")),
            }),
          )
          .catch(() => {});
      }
    }

    if (command.cooldown) {
      if (!this.client.cooldowns?.has(command?.name))
        this.client.cooldowns.set(command.name, new Collection());

      const timeStamp: Collection<Snowflake, number> =
        this.client.cooldowns.get(command?.name);
      const cooldownAmount: number = command.cooldown * 1000;

      if (!timeStamp.has(interaction.user?.id)) {
        timeStamp.set(interaction.user?.id, Date.now());
        if (this.client.config.owners.includes(interaction.user.id))
          timeStamp.delete(interaction.user.id);
      } else {
        const time = timeStamp.get(interaction.user?.id) + cooldownAmount;
        if (Date.now() < time) {
          const timeLeft = (time - Date.now()) / 1000;

          return ctx
            .reply(
              ctx.locale("global:HAS_COOLDOWN", {
                time: timeLeft.toFixed(1),
              }),
              true,
            )
            .catch(() => {});
        }

        timeStamp.set(interaction.user?.id, Date.now());
        setTimeout(() => timeStamp.delete(interaction.user.id), cooldownAmount);
      }
    }
    // Exec command and handle error
    /* eslint-disable @typescript-eslint/no-unused-vars */
    new Promise((resolve) => {
      resolve(command.run(ctx));
    }).catch(async (err) => {
      try {
        console.error(err);
        const error = [];
        const err2 = err.message;
        const err3 = err.stack;
        let dsbBu = false;
        const timeError = new Date();
        const UserData = await UserConfig.findOne({
          id: interaction.user.id,
        });

        if (err.stack) {
          const inter = interaction;

          const embedError = new UnsafeEmbed()
            .setColor(COLORS.red)
            .setAuthor({
              iconURL: this.client.user.avatarURL(),
              name: text.errorServerTitle,
            })
            .setDescription(text.error)
            .addField({
              name: "Message error",
              value: `\`\`\`${err2}\`\`\``,
            })
            .setTimestamp();

          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(today.getDate() + 1);

          const tomorrow2 = tomorrow.getTime();
          const timeout = tomorrow2 - Date.now();

          if (timeout - (Date.now() - UserData.limitError.time) > 0) {
            await UserData.updateOne({
              limitError: {
                retry: 0,
                time: UserData.limitError.time,
              },
            });
          }

          if (
            timeout - (Date.now() - UserData.limitError.time) > 0 &&
            UserData.limitError.retry === 3
          )
            dsbBu = true;

          const row = new ActionRow().addComponents(
            new ButtonComponent()
              .setCustomId("report")
              .setEmoji({
                name: "📬",
              })
              .setLabel("Report to developer")
              .setStyle(ButtonStyle.Danger)
              .setDisabled(dsbBu),
          );

          await inter
            .reply({
              components: [row],
              embeds: [embedError],
              ephemeral: true,
            })
            .catch(() => {});

          const filter = (interactions: any) =>
            interactions.user.id === ctx.interaction.user.id;

          const collector = inter.channel.createMessageComponentCollector({
            filter,
            max: 1,
          });

          collector.on("collect", async (i: any) => {
            const row = new ActionRow().addComponents(
              new ButtonComponent()
                .setCustomId("report")
                .setEmoji({
                  name: "📬",
                })
                .setLabel("Report to developer")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true),
            );

            if (i.customId === "report") {
              const reportSuccess = new Embed()
                .setColor(COLORS.general)
                .setTitle("Reported")
                .setDescription(
                  "The problem was successfully reported to the developer, thank you for cooperating!",
                )
                .setTimestamp();

              i.update({
                components: [row],
                embeds: [reportSuccess],
              }).catch(() => {});

              await UserData.updateOne({
                limitError: {
                  retry: UserData.limitError.retry + 1,
                  time: Date.now(),
                },
              });

              const senderData = await this.client.users.fetch(i.user.id);

              this.client.config.owners.forEach(async (id) => {
                const devData = await this.client.users.fetch(id);
                const ownerEmbed = new UnsafeEmbed()
                  .setColor(COLORS.general)
                  .setAuthor({
                    iconURL: this.client.user.avatarURL(),
                    name: "New Report",
                  })
                  .setThumbnail(this.client.user.avatarURL())
                  .setDescription(
                    `From: \`${senderData.tag}\`\nTo: \`${devData.tag}\`\nTime: \`${timeError}\``,
                  )
                  .addField({
                    name: `Message Error`,
                    value: `\`\`\`${err3}\`\`\``,
                  });

                await devData.send({
                  embeds: [ownerEmbed],
                });
              });
            }
          });

          // setTimeout(async () => await inter.deleteReply().catch(() => {}), 15000);
          //  if(!err.stack.includes(error)) error.push(err.stack)
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
}
