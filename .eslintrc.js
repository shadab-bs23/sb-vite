module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: ["jsdoc"],

  parser: "vue-eslint-parser",

  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "plugin:prettier/recommended",
  ],

  parserOptions: {
    ecmaVersion: 2020,
    ts: "@typescript-eslint/parser",
  },
  rules: {
    "no-console": import.meta.env.MODE === "production" ? "warn" : "off",
    "no-debugger": import.meta.env.MODE === "production" ? "warn" : "off",
    "vue/script-setup-uses-vars": "warn",
    "vue/no-multiple-template-root": 0,
    "vue/v-slot-style": [
      "error",
      {
        atComponent: "longform",
        default: "longform",
        named: "longform",
      },
    ],
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
  },

  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly",
    SB_CUSTOM: "writable",
  },

  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/unit/**/*.spec.{j,t}s?(x)",
      ],
      env: {
        jest: true,
      },
    },
    {
      /*
      See [here](https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/) :
      We strongly recommend that you do not use the no-undef lint rule on TypeScript projects. The checks it provides are already provided by TypeScript without the need for configuration - TypeScript just does this significantly better.
      */
      files: ["*.ts", "*.vue"],
      rules: {
        "no-undef": "off",
      },
    },
  ],

  settings: {
    jsdoc: {
      mode: "typescript",
    },
  },
};
