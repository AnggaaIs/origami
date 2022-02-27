const { bot_name } = require("./config.json");

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:sort/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint", "prettier", "eslint-plugin-header", "sort"],
  ignorePatterns: ["dist/", "node_modules/"],

  rules: {
    "@typescript-eslint/no-unsafe-call": ["off"],
    "@typescript-eslint/no-explicit-any": ["off"],
    "@typescript-eslint/explicit-module-boundary-types": ["off"],
    "@typescript-eslint/ban-ts-comment": ["off"],
    "@typescript-eslint/no-empty-function": ["off"],
    "@typescript-eslint/no-var-requires": ["off"],
    "header/header": [
      "error",
      "block",
      [
        "*",
        ` * Copyright (c) 2021 ${bot_name}`,
        " *",
        " * This program is free software: you can redistribute it and/or modify",
        " * it under the terms of the GNU General Public License as published by",
        " * the Free Software Foundation, either version 3 of the License, or",
        " * (at your option) any later version.",
        " *",
        " * This program is distributed in the hope that it will be useful,",
        " * but WITHOUT ANY WARRANTY; without even the implied warranty of",
        " * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the",
        " * GNU General Public License for more details.",
        " *",
        " * You should have received a copy of the GNU Affero General Public License",
        " * along with this program.  If not, see <http://www.gnu.org/licenses/>.",
        " *",
        " ",
      ],
      2,
    ],
    "sort/imports": [
      "warn",
      {
        groups: [
          { regex: "(module-alias)", order: 1 },
          {
            regex: "(discord|discord.js|@discordjs|discord-api-types)",
            order: 4,
          },
          { regex: "(@origami)", order: 2 },
          { regex: "(@)", order: 3 },
          { type: "dependency", order: 5 },
          { type: "other", order: 6 },
        ],
      },
    ],
  },
};
