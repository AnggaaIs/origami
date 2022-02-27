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

import { IUser } from "@origami/interfaces/Database";
import { Document, model, Schema } from "mongoose";

const UserSchema = new Schema({
  id: {
    required: true,
    type: String,
  },
  limitError: {
    default: {
      retry: 0,
      time: null,
    },
    required: true,
    type: Object,
  },
});

export default model<IUser & Document>("User", UserSchema);
