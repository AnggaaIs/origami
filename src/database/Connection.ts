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

import mongoose from "mongoose";
import config from "../../config.json";

export default function mongoConnect(spinnies: any): void {
  const connect = () => {
    mongoose
      .connect(config.mongo_uri)
      .then(() => {})
      .catch((e) => {
        spinnies.update("firstSpinner", {
          failColor: "white",
          status: "fail",
          text: `Failed to connect to database ${e}`,
        });
        process.exit(1);
      });
  };

  connect();
}
