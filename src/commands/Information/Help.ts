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
import { toTitleCase } from "@origami/util";
import {
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
import { readdirSync } from "fs";
import { join } from "path";

function getCommandsByCategory(
  category: string,
  client: Client,
): Command | any {
  const cmd = client.manager.commands.filter(
    (x) => x.category.toLowerCase() === category.toLowerCase(),
  );
  return cmd;
}

function getCommandByName(name: string, client: Client): Command | any {
  const cmd = client.manager.commands.get(name.toLowerCase());
  return cmd;
}

/* eslint camelcase: "off" */
export default class Help extends Command {
  constructor(client: Client) {
    super(client, {
      allowDm: true,
      category: "Information",
      cooldown: 5,
      name: "help",
      options: [
        {
          description: "Show command specific details",
          name: "command_name",
          required: false,
          type: 3,
        },
      ],
      usage: "help [command]",
    });
  }

  async run(ctx: CommandContext): Promise<void | Message> {
    try {
      if (!ctx.interaction.isChatInputCommand()) return;
      const command_name = ctx.interaction.options.getString(
        "command_name",
        false,
      );

      const prefix: string = this.client.config.prefix2;

      if (!command_name) {
        const categoryArray: string[] = [];
        const categoryList: APISelectMenuOption[] = [];
        const cmdCount = this.client.manager.commands.filter(
          (x) => x.category !== "Dev",
        );

        // Read category
        const folder = readdirSync(join(__dirname, "..", "..", "commands"));

        folder.forEach((file) => {
          categoryArray.push(file);
        });

        categoryArray.forEach((x) => {
          switch (x) {
            case "Administrator":
              categoryList.push({
                description: ctx.locale(
                  "commands:help.childCategory.administrator_description",
                ),
                emoji: {
                  name: "🛠️",
                },
                label: "Administrator",
                value: "administrator",
              });
              break;
            case "Audio":
              categoryList.push({
                description: ctx.locale(
                  "commands:help.childCategory.audio_description",
                ),
                emoji: {
                  name: "🔊",
                },
                label: "Audio",
                value: "audio",
              });
              break;
            case "Information":
              categoryList.push({
                description: ctx.locale(
                  "commands:help.childCategory.information_description",
                ),
                emoji: {
                  name: "📋",
                },
                label: "Information",
                value: "information",
              });
              break;
          }
        });
        // Back menu
        categoryList.push({
          description: ctx.locale(
            "commands:help.childCategory.back_description",
          ),
          emoji: {
            name: "↩️",
          },
          label: "Back",
          value: "back",
        });

        const selectMenuData: APISelectMenuComponent = {
          custom_id: "select_category",
          options: categoryList,
          placeholder: ctx.locale("commands:help.select_category_desc"),
          type: ComponentType.SelectMenu,
        };
        const row = new ActionRow().addComponents(
          new SelectMenuComponent(selectMenuData),
        );

        const embedHelp1 = new Embed()
          .setColor(COLORS.general)
          .setAuthor({
            iconURL: this.client.user.avatarURL(),
            name: "Help Panel",
          })
          .setThumbnail(this.client.user.avatarURL())
          .setDescription(`${ctx.locale("commands:help.description_help1")}`)
          .setFooter({
            text: ctx.locale("commands:help.total_cmd", {
              count: cmdCount.size,
            }),
          })
          .setTimestamp();
        await ctx.reply({
          components: [row],
          embeds: [embedHelp1],
        });

        const collector =
          ctx.interaction.channel.createMessageComponentCollector();

        collector.on("collect", async (a: any) => {
          if (!a.values) return;
          const value = a.values[0];

          categoryArray.forEach(async (x) => {
            if (value.toLowerCase() === x.toLowerCase()) {
              const categoryList = getCommandsByCategory(value, this.client);
              const categoryList2 = categoryList
                .map((x) => `\`${x.name}\``)
                .join(", ");

              const embedCategory = new Embed()
                .setColor(COLORS.general)
                .setAuthor({
                  iconURL: this.client.user.avatarURL(),
                  name: `Category ${x}`,
                })
                .setThumbnail(this.client.user.avatarURL())
                .setDescription(categoryList2)
                .setFooter({
                  text: ctx.locale("commands:help.total_cmd", {
                    count: categoryList.size,
                  }),
                })
                .setTimestamp();
              await a
                .update({
                  embeds: [embedCategory],
                })
                .catch(() => {});
            } else if (value.toLowerCase() === "back") {
              await a
                .update({
                  embeds: [embedHelp1],
                })
                .catch(() => {});
            }
          });
        });
      } else {
        const command = getCommandByName(command_name, this.client);
        const commandFields = [];

        if (command) {
          const { name } = command;
          const { cooldown } = command;
          const { usage } = command;
          const clientPermissions = command.clientPerms;
          const userPermissions = command.userPerms;

          if (name) {
            commandFields.push({
              inline: true,
              name: ctx.locale("commands:help.help2.name_desc"),
              value: toTitleCase(name),
            });
          }

          if (cooldown) {
            commandFields.push({
              inline: true,
              name: ctx.locale("commands:help.help2.cooldown"),
              value: `${cooldown}s`,
            });
          }

          if (usage) {
            commandFields.push({
              inline: true,
              name: ctx.locale("commands:help.help2.usage"),
              value: `\`${prefix}${usage}\``,
            });
          }

          if (clientPermissions.length !== 0) {
            const cPerms = toTitleCase(clientPermissions.join(", "));

            commandFields.push({
              inline: true,
              name: ctx.locale("commands:help.help2.clientPerms"),
              value: cPerms,
            });
          }
          if (userPermissions.length !== 0) {
            const uPerms = toTitleCase(userPermissions.join(", "));

            commandFields.push({
              inline: true,
              name: ctx.locale("commands:help.help2.userPerms"),
              value: uPerms,
            });
          }

          const commandEmbed = new UnsafeEmbed()
            .setColor(COLORS.general)
            .setAuthor({
              iconURL: this.client.user.avatarURL(),
              name: ctx.locale("commands:help.help2.name_title", {
                cmd: toTitleCase(name),
              }),
            })
            .setThumbnail(this.client.user.avatarURL())
            .setDescription(
              ctx.locale(`commands:${name.toLowerCase()}.description`),
            )
            .addFields(commandFields as unknown as APIEmbedField)
            .setTimestamp();

          return ctx.replyWithTime(
            {
              embeds: [commandEmbed],
            },
            30000,
          );
        }
        return ctx.reply(
          `${EMOJIS.no} | ${ctx.locale("commands:help.cmd_not_found", {
            cmd: command_name,
          })}`,
          true,
        );
      }
    } catch (e) {
      console.error(e);
    }
  }
}
