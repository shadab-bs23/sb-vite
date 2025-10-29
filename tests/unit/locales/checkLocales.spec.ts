import { messages as localesObj } from "../../../src/locales";

// For effective traversing through all the locale objects
const locale_name_keys = Object.keys(localesObj).sort();

const isObject = (o): boolean => typeof o === "object";

const isEmptyObject = (o): boolean =>
  o &&
  Object.keys(o).length === 0 &&
  Object.getPrototypeOf(o) === Object.prototype;

// Flatten object for easier comparison ...
const flattenObject = (o, prefix = "") =>
  Object.keys(o).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (isObject(o[k])) Object.assign(acc, flattenObject(o[k], pre + k));
    else acc[pre + k] = o[k];
    return acc;
  }, {});

describe("Checking locales: " + locale_name_keys.join(", "), () => {
  // True as long as everything that is checked so far is OK (to fail fast)
  let allCheckedIsOk = true;
  const localesObj_flattened = {};

  // Quick check to eastablish that the basics are in order 1 : object structure
  locale_name_keys.forEach((locale_name) => {
    if (!allCheckedIsOk) return; // no point to continue
    const locale_obj = localesObj[locale_name];
    const is_object = isObject(locale_obj);
    const is_emptyObject = is_object && isEmptyObject(locale_obj);

    it(`Checking that "${locale_name}" is defined with valid JSON structure / object`, () => {
      expect(is_object).toBe(true);
      expect(is_emptyObject).toBe(false);
    });
    if (!is_object || is_emptyObject) {
      allCheckedIsOk = false;
      return; // break out of current iteration
    } else {
      localesObj_flattened[locale_name] = flattenObject(locale_obj);
    }
  });

  // STATUS 1: If allCheckedIsOk, we now know that all locale JSON-files contain non-empty objects

  // Do a detailed check - fail fast!
  if (allCheckedIsOk) {
    locale_name_keys.forEach((locale_name_this, index) => {
      if (!allCheckedIsOk || index === locale_name_keys.length - 1) return; // no point to continue
      const locale_name_next = locale_name_keys[index + 1];
      const locale_obj_next = localesObj_flattened[locale_name_next];
      const locale_obj_this = localesObj_flattened[locale_name_this];

      describe(`comparing "${locale_name_this}" and "${locale_name_next}"`, () => {
        const locale_keys_this = Object.keys(locale_obj_this);
        const locale_keys_next = Object.keys(locale_obj_next);
        const locale_keys_this_set = new Set(locale_keys_this);
        const locale_keys_next_set = new Set(locale_keys_next);
        const locale_keys_union = new Set([
          ...locale_keys_this_set,
          ...locale_keys_next_set,
        ]);

        locale_keys_union.forEach((flat_key_union) => {
          const this_set_has_key = locale_keys_this_set.has(flat_key_union);
          const next_set_has_key = locale_keys_next_set.has(flat_key_union);

          // Check that keys exist in both maps ...
          if (!this_set_has_key) {
            it(`Checking that "${locale_name_this}" has key "${flat_key_union}"`, () => {
              expect(this_set_has_key).toBe(true);
            });
            allCheckedIsOk = false;
            return; // break out of current iteration
          } else if (!next_set_has_key) {
            it(`Checking that "${locale_name_next}" has key "${flat_key_union}"`, () => {
              expect(next_set_has_key).toBe(true);
            });
            allCheckedIsOk = false;
            return; // break out of current iteration
          }

          const this_value = locale_obj_this[flat_key_union];
          const next_value = locale_obj_next[flat_key_union];

          // check that no values are empty string ...
          if (!this_value.length) {
            it(`Checking that value of "${flat_key_union}" for "${locale_name_this}" is set with string value`, () => {
              expect(this_value.length).toBeGreaterThan(0);
            });
            allCheckedIsOk = false;
            return; // break out of current iteration
          } else if (!next_value.length) {
            it(`Checking that value of "${flat_key_union}" for "${locale_name_next}" is set with string value`, () => {
              expect(next_value.length).toBeGreaterThan(0);
            });
            allCheckedIsOk = false;
            return; // break out of current iteration
          }
        });
      });
    });
  }

  //it(`Checking "${locale_name_this}" and "${locale_name_next}" by comparing them...`, () => {

  if (allCheckedIsOk) {
    // Just to have output when all is ok
    it("Confirming that we have same JSON structure for all locales, and no values are empty strings", () => {
      expect(allCheckedIsOk).toBe(true);
    });
  }
});
