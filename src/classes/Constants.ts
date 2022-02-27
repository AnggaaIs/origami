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

export const COLORS = {
  general: 0x03fcc6,
  green: 0x1bff0a,
  red: 0xfc0303,
  white: 0xffffff,
};

export const text = {
  error:
    "An error occurred on the server, please try some more time. If this problem persists, please press the button below!",
  errorServerTitle: "❌ Error",
};

export const EMOJIS = {
  no: "<a:nononono:727181317837553674>",
  yes: "<a:yes_check:726815720486469653>",
};

export const PATTERN = {
  coordinates:
    /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/s,
  earthquakePlace: /(\d*)\s?(km)\s(\w{1,4})\s(of)/s,
  earthquakePlace2: /(,.\w*)/s,
};

Object.freeze(COLORS);
Object.freeze(text);
Object.freeze(EMOJIS);
