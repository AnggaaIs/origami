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
import {
  CommandInteraction,
  InteractionDeferReplyOptions,
  InteractionReplyOptions,
  Message,
  MessagePayload,
  WebhookEditMessageOptions,
} from "discord.js";
import { TFunction } from "i18next";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default class CommandContext {
  constructor(
    public client: Client,
    public interaction: CommandInteraction,
    public i18n: TFunction,
  ) {}

  async reply(
    value:
      | string
      | MessagePayload
      | InteractionReplyOptions
      | InteractionDeferReplyOptions
      | WebhookEditMessageOptions,
    ephemeral = false,
  ): Promise<Message | void> {
    if (typeof value === "string") {
      return this.interaction
        .reply({
          content: value,
          ephemeral,
        })
        .catch(() => {});
    }

    return this.interaction.reply(value).catch(() => {});
  }

  async replyWithTime(
    value:
      | string
      | MessagePayload
      | InteractionReplyOptions
      | InteractionDeferReplyOptions
      | WebhookEditMessageOptions,
    time = 15000,
  ): Promise<Message | void> {
    if (typeof value === "string") {
      await this.interaction
        .reply({
          content: value,
          ephemeral: false,
        })
        .catch(() => {});
      setTimeout(
        async () => await this.interaction.deleteReply().catch(() => {}),
        time,
      );
      return;
    }

    await this.interaction.reply(value);
    setTimeout(
      async () => await this.interaction.deleteReply().catch(() => {}),
      time,
    );
  }

  async replyT(value: string, translateOpt = {}, ephemeral = false) {
    this.reply(this.locale(value, translateOpt), ephemeral);
  }

  locale(text: string, opt = {}): string {
    return this.i18n(text, opt);
  }
}
