# Sharebus Frontend Coding Standards - Key Points

This document outlines the essential coding standards for the Sharebus frontend project. Following these guidelines is mandatory for code consistency and quality.

## Core Guidelines

1. **Always use Vue 3 Composition API with `<script setup lang="ts">`**
   ```vue
   <script setup lang="ts">
   // Code here
   </script>
   ```

2. **Use computed properties for derived data**
   ```typescript
   // CORRECT: Derive data with computed properties
   const displayName = computed(() => `${user.firstName} ${user.lastName}`);

   // INCORRECT: Manually deriving and storing data
   const displayName = ref(`${user.firstName} ${user.lastName}`);
   ```

3. **Define functions with arrow syntax**
   ```typescript
   // CORRECT
   const handleClick = () => {
     // Implementation
   };

   // INCORRECT
   function handleClick() {
     // Implementation
   }
   ```

3. **Use Bootstrap 5 utilities over custom CSS whenever possible**
   ```html
   <!-- CORRECT: Using Bootstrap classes -->
   <div class="d-flex justify-content-between align-items-center p-3 mb-2">
     <!-- Content -->
   </div>

   <!-- AVOID: Custom CSS when Bootstrap utilities exist -->
   <div class="custom-container">
     <!-- Content -->
   </div>
   ```

4. **Type definitions must use common type files**
   - Use existing types from `/types` directory
   - Only create new type files when no similar types exist
   - Consult team before creating new type files

5. **Don't create composables without prior approval**
   - Reuse existing composables
   - Get approval before creating new ones

6. **Use appropriate data storage mechanisms**
   - Prefer store state over local/session storage
   - Use component state (ref/reactive) for component-specific data
   - Pass props for parent-child communication
   - Use provide/inject for deeply nested components

## Component Structure

```vue
<template>
  <!-- Template content using Bootstrap 5 utilities -->
  <div class="d-flex flex-column">
    <!-- Content -->
  </div>
</template>

<script setup lang="ts">
// Imports (use only what's needed)
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SomeType } from '@/types/common'; // Use common types

// Props with TypeScript type validation
const props = defineProps({
  item: {
    type: Object as PropType<SomeType>,
    required: true,
  },
});

// Arrow function for all methods
const handleAction = () => {
  // Implementation
};

// Computed properties with arrow functions
const computedValue = computed(() => {
  // Implementation
  return result;
});

// Use store for persistent data
const someStore = useSomeStore();
// Derive data using computed properties instead of duplicating from store
const derivedData = computed(() => formatData(someStore.someData));
</script>

<!-- Only use custom CSS when Bootstrap can't handle it -->
<style lang="scss" scoped>
// Minimize custom CSS
</style>
```

## State Management

- Use Pinia with proper typing
- Follow the store pattern established in the project
- Prefer Pinia's persisted state over manual localStorage/sessionStorage usage
- Use computed properties to derive state from store data

### Storage Practices

- **Avoid direct localStorage/sessionStorage usage when possible**
  ```typescript
  // AVOID: Direct use of sessionStorage
  sessionStorage.setItem("userData", JSON.stringify(userData));
  
  // PREFERRED: Use Pinia's persistence plugin
  // Store definition with persist: true is already configured
  ```

- **Data flow priority (in order of preference):**
  1. Computed properties for derived/temporary data
  2. Component refs for component-specific state
  3. Pinia stores for shared/persistent data
  4. Pass props for parent-child communication

- **Use the appropriate storage mechanism:**
  - Component state → ref/reactive
  - Shared state → Pinia stores
  - Temporary form data → component state
  - Cross-component communication → Pinia or props
  - Persistent data → Pinia with persistence plugin

## API Interactions

- Use GraphQL with Apollo for all API calls
- Type all API responses

## Component Usage

- Use @busgroup base components instead of standard HTML elements whenever possible:

  ```vue
  <!-- Import the component -->
  <script setup lang="ts">
  import BaseButton from "@busgroup/vue3-base-button";
  </script>

  <!-- CORRECT: Using base components -->
  <BaseButton
    button-class="sb-btn-primary"
    @click="handleClick"
  >
    Submit
  </BaseButton>

  <!-- AVOID: Using standard HTML elements -->
  <button 
    class="sb-btn-primary" 
    @click="handleClick"
  >
    Submit
  </button>
  ```

- Available @busgroup components to use:
  - `import BaseButton from "@busgroup/vue3-base-button"` - Use instead of `<button>`
  - `import BaseBadge from "@busgroup/vue3-base-badge"` - Use instead of badge/tag elements
  - `import BaseBreadcrumbs from "@busgroup/vue3-base-breadcrumbs"` - Use for navigation breadcrumbs
  - `import BaseCard from "@busgroup/vue3-base-card"` - Use instead of custom card containers
  - `import BaseConfirmationModal from "@busgroup/vue3-base-confirmation-modal"` - Use for confirmation dialogs
  - `import BaseDatepicker from "@busgroup/vue3-base-datepicker"` - Use instead of standard date inputs
  - `import BaseInput from "@busgroup/vue3-base-input"` - Use instead of `<input>`
  - `import BaseLoader from "@busgroup/vue3-base-loader"` - Use for loading states
  - `import BaseLocationAutocomplete from "@busgroup/vue3-base-location-autocomplete"` - Use for location inputs
  - `import BaseModal from "@busgroup/vue3-base-modal"` - Use instead of custom modals
  - `import BaseRadio from "@busgroup/vue3-base-radio"` - Use instead of `<input type="radio">`
  - `import BaseSelect from "@busgroup/vue3-base-select"` - Use instead of `<select>`

- Also use local reusable components from `/src/components/common/reusable` folder:
  ```vue
  <!-- Import the local component -->
  <script setup lang="ts">
  import BaseActionButton from "@/components/common/reusable/BaseActionButton.vue";
  </script>
  ```
  
  Available local reusable components:
  - `BaseActionButton.vue`
  - `BaseActionHeader.vue`
  - `BaseBadge.vue`
  - `BaseBreadcrumbs.vue`
  - `BaseCheckoutItinerary.vue`
  - `BaseOffCanvas.vue`
  - `BasePhoneInput.vue`
  - `BaseQuantity.vue`
  - `BaseRangeSlider.vue`
  - `BaseSaveChanges.vue`
  - `BaseSearch.vue`

- Always prefer reusable components (either from @busgroup packages or local reusable components) over creating new components or using raw HTML elements

## Translation and i18n Guidelines

- Always use i18n for all user-facing text
- When adding new translation keys:
  1. First check if a similar text already exists in the locale files (`/src/locales/*.json`) that can be reused
  2. Group related keys in appropriate sections in the JSON structure
  3. Always add the key to all language files (`en-US.json`, `no-NO.json`, `da-DK.json`, `sv-SE.json`)
  4. Follow the existing naming convention: `"section.subsection.descriptive_key_name"`
  5. Use meaningful and consistent key names across the application

  ```javascript
  // CORRECT: Reuse existing key
  $t("sharebus.booking.payment_summary")

  // INCORRECT: Creating duplicate keys
  $t("checkout.payment_summary")  // Don't create this if "sharebus.booking.payment_summary" already exists
  ```

### Translation Key Management

#### Rules for Adding Translation Keys

1. **Check First, Create Second**: Before creating a new translation key, search for similar content in existing translations that might be reused. This reduces duplication and keeps the translation files manageable.

2. **Add to All Language Files**: Every new translation key must be added to all language files (`en-US.json`, `no-NO.json`, `da-DK.json`, `sv-SE.json`) to maintain consistency. Add the translated text in `en-US.json`, but for other language files, you can add just the key with an empty string value.

```json
// en-US.json - Add key with English value
"feature.new_key": "New feature text"

// Other language files (no-NO.json, da-DK.json, sv-SE.json)
// Add the same key with empty value
"feature.new_key": ""
```

#### Examples

**Good Example**:
```javascript
// Reusing existing translations
$t('common.cancel')
$t('common.submit')

// Properly nested new translations
$t('trip.details.pickup_instructions')
```

**Bad Example**:
```javascript
// Creating duplicates
$t('cancel_button') // Bad: 'common.cancel' already exists

// Poor organization
$t('pickup_instructions') // Bad: too generic, no context
```

## Additional Guidelines

- Follow existing naming conventions (PascalCase for components, camelCase for variables)
- Write unit tests for critical components and logic
- Follow ESLint and Prettier configurations

## Performance Best Practices

- Lazy load components when appropriate using `defineAsyncComponent`
- Use `shallowRef` for large data structures that don't need deep reactivity
- Avoid unnecessary re-renders by using computed properties and proper memoization
- Minimize direct DOM manipulation
- Use v-once for static content that won't change
- Leverage Pinia's state instead of reinventing storage solutions
